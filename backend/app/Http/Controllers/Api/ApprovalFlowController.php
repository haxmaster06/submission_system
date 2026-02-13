<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApprovalFlow;
use App\Models\ApprovalFlowStep;
use App\Models\ApprovalCondition;
use App\Models\Division;
use App\Models\JenisPerjalanan;
use App\Models\UrgencyStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApprovalFlowController extends Controller
{
    /**
     * Get all flows with steps and conditions, plus lookup data for the UI.
     */
    public function index()
    {
        $flows = ApprovalFlow::with([
            'steps' => fn($q) => $q->orderBy('step_order'),
            'conditions' => fn($q) => $q->orderBy('priority'),
        ])->where('is_active', true)->get();

        // Provide lookup data for condition builder
        $lookups = [
            'divisions' => Division::select('code', 'name')->get(),
            'travel_types' => JenisPerjalanan::select('id', 'name')->get(),
            'roles' => \Spatie\Permission\Models\Role::select('id', 'name')->orderBy('name')->get(),
            'available_fields' => [
                ['field' => 'division_code', 'label' => 'Divisi Pemohon', 'type' => 'select', 'options_key' => 'divisions'],
                ['field' => 'travel_type', 'label' => 'Jenis Perjalanan', 'type' => 'select', 'options_key' => 'travel_types'],
                ['field' => 'total', 'label' => 'Total Nominal', 'type' => 'number'],
                ['field' => 'urgency', 'label' => 'Status Urgensi', 'type' => 'text'],
            ],
            'operators' => [
                ['value' => '==', 'label' => 'Sama dengan (=)'],
                ['value' => '!=', 'label' => 'Tidak sama (≠)'],
                ['value' => '>', 'label' => 'Lebih besar (>)'],
                ['value' => '>=', 'label' => 'Lebih besar atau sama (≥)'],
                ['value' => '<', 'label' => 'Lebih kecil (<)'],
                ['value' => '<=', 'label' => 'Lebih kecil atau sama (≤)'],
            ],
            'condition_types' => [
                ['value' => 'any_of', 'label' => 'Salah satu cocok (OR)'],
                ['value' => 'all_of', 'label' => 'Semua harus cocok (AND)'],
            ],
        ];

        return response()->json([
            'flows' => $flows,
            'lookups' => $lookups,
        ]);
    }

    // ─── STEPS CRUD ───

    public function storeStep(Request $request, ApprovalFlow $flow)
    {
        $request->validate([
            'role_name' => 'required|string|max:100',
            'is_optional' => 'boolean',
        ]);

        $maxOrder = $flow->steps()->max('step_order') ?? 0;

        $step = $flow->steps()->create([
            'role_name' => $request->role_name,
            'step_order' => $maxOrder + 1,
            'is_optional' => $request->is_optional ?? false,
        ]);

        return response()->json($step, 201);
    }

    public function updateStep(Request $request, ApprovalFlow $flow, ApprovalFlowStep $step)
    {
        $request->validate([
            'role_name' => 'required|string|max:100',
            'is_optional' => 'boolean',
        ]);

        $step->update([
            'role_name' => $request->role_name,
            'is_optional' => $request->is_optional ?? false,
        ]);

        return response()->json($step);
    }

    public function destroyStep(ApprovalFlow $flow, ApprovalFlowStep $step)
    {
        $step->delete();

        // Re-index remaining steps
        $flow->steps()->orderBy('step_order')->get()->each(function ($s, $index) {
            $s->update(['step_order' => $index + 1]);
        });

        return response()->json(['message' => 'Step deleted']);
    }

    public function reorderSteps(Request $request, ApprovalFlow $flow)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:approval_flow_steps,id',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->ids as $order => $id) {
                ApprovalFlowStep::where('id', $id)->update(['step_order' => $order + 1]);
            }
        });

        return response()->json(['message' => 'Steps reordered']);
    }

    // ─── CONDITIONS CRUD ───

    public function storeCondition(Request $request, ApprovalFlow $flow)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role_name' => 'required|string|max:100',
            'insert_after_step' => 'required|integer|min:0',
            'condition_type' => 'required|in:any_of,all_of',
            'condition_rules' => 'required|array|min:1',
            'condition_rules.*.field' => 'required|string',
            'condition_rules.*.operator' => 'required|string',
            'condition_rules.*.value' => 'required',
        ]);

        $maxPriority = $flow->conditions()->max('priority') ?? 0;
        $validated['priority'] = $maxPriority + 1;
        $validated['is_active'] = true;

        $condition = $flow->conditions()->create($validated);

        return response()->json($condition, 201);
    }

    public function updateCondition(Request $request, ApprovalFlow $flow, ApprovalCondition $condition)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role_name' => 'required|string|max:100',
            'insert_after_step' => 'required|integer|min:0',
            'condition_type' => 'required|in:any_of,all_of',
            'condition_rules' => 'required|array|min:1',
            'condition_rules.*.field' => 'required|string',
            'condition_rules.*.operator' => 'required|string',
            'condition_rules.*.value' => 'required',
        ]);

        $condition->update($validated);

        return response()->json($condition);
    }

    public function destroyCondition(ApprovalFlow $flow, ApprovalCondition $condition)
    {
        $condition->delete();
        return response()->json(['message' => 'Condition deleted']);
    }

    public function toggleCondition(ApprovalFlow $flow, ApprovalCondition $condition)
    {
        $condition->update(['is_active' => !$condition->is_active]);
        return response()->json($condition);
    }
}
