<?php

namespace App\Notifications;

use App\Models\Submission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class SubmissionHeldNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $submission;
    public $approverName;
    public $notes;

    public function __construct(Submission $submission, string $approverName, string $notes = '')
    {
        $this->submission = $submission;
        $this->approverName = $approverName;
        $this->notes = $notes;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', \App\Broadcasting\FcmChannel::class];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'submission_id' => $this->submission->id,
            'code' => $this->submission->code,
            'title' => $this->submission->description,
            'status' => 'on_hold',
            'approver_name' => $this->approverName,
            'notes' => $this->notes,
            'message' => "Pengajuan {$this->submission->code} ditunda oleh {$this->approverName}. Silakan lakukan perubahan.",
            'type' => 'submission_held',
            'link' => '/submissions/' . $this->submission->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage(array_merge($this->toArray($notifiable), [
            'created_at' => now()->toISOString(),
        ]));
    }

    public function toFcm($notifiable): array
    {
        return [
            'title' => 'Pengajuan Ditunda!',
            'body' => "Pengajuan #{$this->submission->code} ditunda oleh {$this->approverName}. Silakan revisi.",
            'url' => '/submissions/' . $this->submission->id,
            'type' => 'submission_held',
        ];
    }
}
