<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\RealizationHeader;
use App\Models\RealizationDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Notifications\NewRealizationNotification;
use Illuminate\Support\Facades\Notification;

class RealizationController extends Controller
{
    /**
     * List realizations for a specific submission.
     */
    public function index(Submission $submission)
    {
        return response()->json(
            $submission->realizations()->with('details')->get()
        );
    }

    /**
     * Store a new realization.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'submission_id' => 'required|exists:submissions,id',
            'realization_date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string',
            'items.*.qty' => 'required|numeric|min:0',
            'items.*.nominal' => 'required|numeric|min:0',
        ]);

        $submission = Submission::findOrFail($validated['submission_id']);

        // Check if submission is approved
        if ($submission->final_status !== 'approved') {
            return response()->json(['message' => 'Realisasi hanya bisa dibuat untuk pengajuan yang telah disetujui.'], 422);
        }

        return DB::transaction(function () use ($validated) {
            $header = RealizationHeader::create([
                'submission_id' => $validated['submission_id'],
                'realization_date' => $validated['realization_date'],
                'notes' => $validated['notes'],
            ]);

            foreach ($validated['items'] as $item) {
                RealizationDetail::create([
                    'realization_id' => $header->id,
                    'item_name' => $item['item_name'],
                    'qty' => $item['qty'],
                    'nominal' => $item['nominal'],
                    'total' => $item['qty'] * $item['nominal'],
                ]);
            }

            // Notify Finance
            $financeUsers = User::role('Finance')->get();
            Notification::send($financeUsers, new NewRealizationNotification($header));

            return response()->json([
                'message' => 'Realisasi berhasil disimpan.',
                'data' => $header->load('details')
            ], 201);
        });
    }

    /**
     * Show a specific realization.
     */
    public function show(RealizationHeader $realization)
    {
        return response()->json($realization->load('details', 'submission'));
    }

    /**
     * Remove the specified realization.
     */
    public function destroy(RealizationHeader $realization)
    {
        // Only users with 'manage realizations' permission can delete
        $user = Auth::user();
        if (!$user->can('manage realizations')) {
            return response()->json(['message' => 'Anda tidak memiliki akses untuk menghapus realisasi.'], 403);
        }

        $realization->delete();
        return response()->json(['message' => 'Realisasi berhasil dihapus.']);
    }
}
