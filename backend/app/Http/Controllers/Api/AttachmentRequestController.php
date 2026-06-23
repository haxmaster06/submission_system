<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttachmentRequest;
use App\Models\Submission;
use App\Models\SubmissionAttachment;
use App\Notifications\AttachmentRequestedNotification;
use App\Notifications\AttachmentFulfilledNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AttachmentRequestController extends Controller
{
    /**
     * Get pending attachment requests for the authenticated user.
     */
    public function myRequests()
    {
        $requests = AttachmentRequest::with(['submission:id,no_pengajuan', 'requestedBy:id,name'])
            ->where(['target_user_id' => auth()->id()])
            ->where(['status' => 'pending'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $requests
        ]);
    }

    /**
     * Create a new attachment request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'submission_id' => 'required|exists:submissions,id',
            'target_user_id' => 'required|exists:users,id',
            'file_description' => 'required|string|max:255',
        ]);

        $submission = Submission::findOrFail($validated['submission_id']);
        $this->authorize('requestAttachment', $submission);

        $user = auth()->user();

        // If requester is NOT the submission owner (i.e. an Approver),
        // force target_user_id to be the submission owner.
        if ($user->id !== $submission->user_id) {
            $validated['target_user_id'] = $submission->user_id;
        }

        $attachmentRequest = AttachmentRequest::create([
            'submission_id' => $validated['submission_id'],
            'requested_by' => $user->id,
            'target_user_id' => $validated['target_user_id'],
            'file_description' => $validated['file_description'],
            'status' => 'pending',
        ]);

        $attachmentRequest->targetUser->notify(new AttachmentRequestedNotification($attachmentRequest));

        return response()->json([
            'message' => 'Permintaan lampiran berhasil dikirim.',
            'data' => $attachmentRequest->load('targetUser:id,name')
        ], 201);
    }

    /**
     * Fulfill an attachment request by uploading a file.
     */
    public function fulfill(Request $request, AttachmentRequest $attachmentRequest)
    {
        if ($attachmentRequest->target_user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($attachmentRequest->status !== 'pending') {
            return response()->json(['message' => 'Permintaan ini sudah diproses atau dibatalkan.'], 422);
        }

        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx|max:10240',
        ]);

        try {
            return DB::transaction(function () use ($request, $attachmentRequest) {
                $file = $request->file('file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('attachments', $filename, 'public');

                $attachment = SubmissionAttachment::create([
                    'submission_id' => $attachmentRequest->submission_id,
                    'file_path' => $path,
                    'file_type' => $file->getClientOriginalExtension(),
                    'uploaded_by' => auth()->id(),
                ]);

                $attachmentRequest->update([
                    'status' => 'fulfilled',
                    'attachment_id' => $attachment->id,
                ]);

                $attachmentRequest->requestedBy->notify(new AttachmentFulfilledNotification($attachmentRequest));

                return response()->json([
                    'message' => 'File berhasil diunggah.',
                    'data' => $attachment
                ]);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengunggah file: ' . $e->getMessage()], 500);
        }
    }
}
