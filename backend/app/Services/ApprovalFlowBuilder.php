<?php

namespace App\Services;

use App\Models\ApprovalCondition;
use App\Models\ApprovalFlow;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ApprovalFlowBuilder
{
    /**
     * Build the final approval steps for a specific submission.
     * Returns an ordered array of ['role_name' => ..., 'approver_id' => ...].
     */
    public function buildSteps(Submission $submission): array
    {
        $flow = $this->getBaseFlow();
        $context = $this->buildContext($submission);
        $baseSteps = $flow->steps()->orderBy('step_order')->get();

        // Evaluate conditions and get matched conditional steps
        $matchedConditions = $this->evaluateConditions($flow, $context);

        // Insert conditional steps into base steps
        $finalSteps = $this->insertConditionalSteps($baseSteps, $matchedConditions);

        // Resolve approver IDs for each step (pass submission for dynamic role resolution)
        return $this->resolveApprovers($finalSteps, $submission);
    }

    /**
     * Get the default active base flow.
     */
    private function getBaseFlow(): ApprovalFlow
    {
        $flow = ApprovalFlow::where('is_default', true)
            ->where('is_active', true)
            ->with(['steps', 'conditions' => function ($q) {
                $q->where('is_active', true)->orderBy('priority');
            }])
            ->first();

        if (!$flow) {
            throw new \Exception('No default approval flow configured. Please run the ApprovalFlowSeeder.');
        }

        return $flow;
    }

    /**
     * Build the context array from submission data for condition evaluation.
     */
    private function buildContext(Submission $submission): array
    {
        // Eager load relationships if not already loaded
        $submission->loadMissing(['division', 'jenisPerjalanan', 'jenisPengajuan']);

        return [
            'division_code' => $submission->division->code ?? null,
            'division_name' => $submission->division->name ?? null,
            'travel_type' => $submission->jenisPerjalanan->name ?? null,
            'jenis_pengajuan' => $submission->jenisPengajuan->name ?? null,
            'total' => (float) $submission->total,
            'urgency' => $submission->status_urgent,
        ];
    }

    /**
     * Evaluate all conditions for a flow against the submission context.
     * Returns matched ApprovalCondition models.
     */
    private function evaluateConditions(ApprovalFlow $flow, array $context): array
    {
        $matched = [];

        foreach ($flow->conditions as $condition) {
            if (!$condition->is_active) {
                continue;
            }

            if ($this->evaluateCondition($condition, $context)) {
                $matched[] = $condition;
            }
        }

        return $matched;
    }

    /**
     * Evaluate a single condition against the context.
     * Supports 'any_of' (OR) and 'all_of' (AND) logic.
     */
    private function evaluateCondition(ApprovalCondition $condition, array $context): bool
    {
        $rules = $condition->condition_rules;

        if (empty($rules)) {
            return false;
        }

        $results = [];
        foreach ($rules as $rule) {
            $field = $rule['field'] ?? null;
            $operator = $rule['operator'] ?? '==';
            $value = $rule['value'] ?? null;

            if (!$field || !array_key_exists($field, $context)) {
                $results[] = false;
                continue;
            }

            $contextValue = $context[$field];
            $results[] = $this->compareValues($contextValue, $operator, $value);
        }

        if ($condition->condition_type === 'all_of') {
            // AND logic: all rules must match
            return !in_array(false, $results, true);
        }

        // any_of (OR logic): at least one rule must match
        return in_array(true, $results, true);
    }

    /**
     * Compare two values using the specified operator.
     */
    private function compareValues($contextValue, string $operator, $ruleValue): bool
    {
        // Normalize for case-insensitive string comparison
        $left = is_string($contextValue) ? strtolower(trim($contextValue)) : $contextValue;
        $right = is_string($ruleValue) ? strtolower(trim($ruleValue)) : $ruleValue;

        return match ($operator) {
            '==' => $left == $right,
            '!=' => $left != $right,
            '>' => $left > $right,
            '>=' => $left >= $right,
            '<' => $left < $right,
            '<=' => $left <= $right,
            'in' => is_array($ruleValue) && in_array($left, array_map('strtolower', $ruleValue)),
            'not_in' => is_array($ruleValue) && !in_array($left, array_map('strtolower', $ruleValue)),
            default => false,
        };
    }

    /**
     * Insert matched conditional steps into the base steps and re-index step_order.
     */
    private function insertConditionalSteps(Collection $baseSteps, array $matchedConditions): array
    {
        // Convert base steps to array format
        $steps = $baseSteps->map(function ($step) {
            return [
                'role_name' => $step->role_name,
                'is_optional' => $step->is_optional ?? false,
                'original_order' => $step->step_order,
            ];
        })->toArray();

        // Sort conditions by insert_after_step DESC so we insert from bottom to top
        // This preserves correct positions when multiple conditions insert at different points
        usort($matchedConditions, function ($a, $b) {
            return $b->insert_after_step <=> $a->insert_after_step;
        });

        foreach ($matchedConditions as $condition) {
            $insertAfter = $condition->insert_after_step;

            // Find the array index where to insert (after the step with matching original_order)
            $insertIndex = null;
            foreach ($steps as $index => $step) {
                if ($step['original_order'] === $insertAfter) {
                    $insertIndex = $index + 1;
                    break;
                }
            }

            // If position not found, append at the insert_after_step position
            if ($insertIndex === null) {
                $insertIndex = min($insertAfter, count($steps));
            }

            // Insert the conditional step
            array_splice($steps, $insertIndex, 0, [[
                'role_name' => $condition->role_name,
                'is_optional' => false,
                'original_order' => -1, // Mark as dynamically inserted
            ]]);
        }

        return $steps;
    }

    /**
     * Resolve approver user IDs for each step.
     * Handles the special "Requester Division" placeholder by mapping it
     * to the actual role corresponding to the requester's division.
     */
    private function resolveApprovers(array $steps, Submission $submission): array
    {
        $resolved = [];
        $requesterId = $submission->user_id;

        // Map division codes to their Spatie role names
        $divisionRoleMap = [
            'HRD' => 'HRD',
            'GAL' => 'GA Legal',
            'FIN' => 'Finance',
            'GM' => 'GM',
            'DIR' => 'Director',
            'OPS' => 'HRD', // OPS staff → approved by HRD first
        ];

        foreach ($steps as $step) {
            $roleName = $step['role_name'];

            // Resolve "Requester Division" to actual division role
            if ($roleName === 'Requester Division') {
                $divisionCode = $submission->division->code ?? 'OPS';
                $roleName = $divisionRoleMap[$divisionCode] ?? 'HRD';
            }

            // --- SMART SKIP LOGIC ---
            // Get all users who have this role
            $usersWithRole = User::role($roleName)->get();
            
            if ($usersWithRole->isEmpty()) {
                // No user found with this role
                if ($step['is_optional'] ?? false) {
                    continue;
                }
                $approverId = null;
            } else {
                // Filter out the person who made the submission
                $otherUsers = $usersWithRole->filter(fn($u) => $u->id !== $requesterId);
                
                if ($otherUsers->isNotEmpty()) {
                    // There are other users with this role, pick the first one
                    $approverId = $otherUsers->first()->id;
                } else {
                    // The requester is the ONLY person with this role.
                    // SMART SKIP: Skip this approval step entirely to avoid self-approval.
                    continue;
                }
            }

            $resolved[] = [
                'role_name' => $roleName,
                'approver_id' => $approverId,
            ];
        }

        return $resolved;
    }
}
