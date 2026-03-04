<?php

namespace App\Services;

use App\Models\Submission;
use App\Models\Division;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use App\Models\User;
use App\Notifications\NewSubmissionNotification;
use App\Notifications\BudgetExceededNotification;
use Illuminate\Support\Facades\Notification;

class SubmissionService
{
    public function createSubmission(array $data)
    {
        return DB::transaction(function () use ($data) {
            $division = Division::findOrFail($data['division_id']);
            $isDraft = $data['final_status'] === 'draf';

            if (!$isDraft) {
                $data['no_pengajuan'] = $this->generateNoPengajuan($division->code);
            }
            
            // Use provided total (e.g., from payload calculations), or fallback to legacy calculation
            $data['total'] = $data['total'] ?? ($data['qty'] ?? 0) * ($data['nominal'] ?? 0);
            $data['tanggal_pengajuan'] = now();

            $submission = Submission::create($data);

            AuditTrailService::log('create', 'Submission', $submission->id, null, $submission->toArray());

            if (!$isDraft) {
                // Notify HRD
                $approvers = User::role('HRD')->get();
                Notification::send($approvers, new NewSubmissionNotification($submission));

                // Budget Check (Bypass for Directors)
                if ($division->budget_limit > 0 && !$submission->user->hasRole('Director')) {
                    $currentUsage = Submission::where('division_id', $division->id)
                        ->whereMonth('tanggal_pengajuan', now()->month)
                        ->whereYear('tanggal_pengajuan', now()->year)
                        ->where('id', '!=', $submission->id)
                        ->sum('total');

                    $totalUsage = $currentUsage + $submission->total;

                    if ($totalUsage > $division->budget_limit) {
                        Notification::send($approvers->merge([$submission->user]), new BudgetExceededNotification($submission, $submission->total, $division->budget_limit, $totalUsage));
                    }
                }
            }

            return $submission;
        });
    }

    public function createSubmissionWithItems(array $data, array $items)
    {
        return DB::transaction(function () use ($data, $items) {
            $division = Division::findOrFail($data['division_id']);
            $isDraft = ($data['final_status'] ?? 'pending') === 'draf';

            if (!$isDraft) {
                $data['no_pengajuan'] = $this->generateNoPengajuan($division->code);
            }
            $data['tanggal_pengajuan'] = now();

            // Calculate grand total from items
            $grandTotal = 0;
            foreach ($items as $item) {
                $grandTotal += ($item['qty'] * $item['nominal']);
            }
            $data['total'] = $grandTotal;

            $submission = Submission::create($data);

            // Create submission items
            foreach ($items as $item) {
                $submission->items()->create([
                    'description' => $item['description'],
                    'qty' => $item['qty'],
                    'uom_id' => $item['uom_id'],
                    'nominal' => $item['nominal'],
                ]);
            }

            AuditTrailService::log('create', 'Submission', $submission->load('items')->id, null, $submission->toArray());

            if (!$isDraft) {
                // Notify HRD
                $approvers = User::role('HRD')->get();
                Notification::send($approvers, new NewSubmissionNotification($submission));

                // Budget Check (Bypass for Directors)
                if ($division->budget_limit > 0 && !$submission->user->hasRole('Director')) {
                    $currentUsage = Submission::where('division_id', $division->id)
                        ->whereMonth('tanggal_pengajuan', now()->month)
                        ->whereYear('tanggal_pengajuan', now()->year)
                        ->where('id', '!=', $submission->id)
                        ->sum('total');

                    $totalUsage = $currentUsage + $submission->total;

                    if ($totalUsage > $division->budget_limit) {
                        Notification::send($approvers->merge([$submission->user]), new BudgetExceededNotification($submission, $submission->total, $division->budget_limit, $totalUsage));
                    }
                }
            }

            return $submission;
        });
    }

    public function generateNoPengajuan($divisionCode)
    {
        $now = Carbon::now();
        $month = $now->format('n'); // Month as 1-12
        $year = $now->format('y'); // Year as 2 digits

        $prefix = "AJU.HBM-{$divisionCode}-{$month}-{$year}-";

        $lastSubmission = Submission::where('no_pengajuan', 'like', "{$prefix}%")
            ->orderBy('no_pengajuan', 'desc')
            ->first();

        $sequence = 1;
        if ($lastSubmission) {
            $lastNo = $lastSubmission->no_pengajuan;
            $parts = explode('-', $lastNo);
            $lastSequence = (int)end($parts);
            $sequence = $lastSequence + 1;
        }

        return $prefix . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}