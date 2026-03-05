<?php

namespace App\Notifications;

use App\Models\Submission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class SubmissionRevisedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $submission;
    public $ownerName;

    public function __construct(Submission $submission, string $ownerName)
    {
        $this->submission = $submission;
        $this->ownerName = $ownerName;
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
            'status' => 'revised',
            'owner_name' => $this->ownerName,
            'message' => "Pengajuan {$this->submission->code} telah direvisi oleh {$this->ownerName}. Silakan review kembali.",
            'type' => 'submission_revised',
            'link' => '/approvals',
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
            'title' => 'Pengajuan Direvisi!',
            'body' => "Pengajuan #{$this->submission->code} telah direvisi oleh {$this->ownerName}. Silakan review.",
            'url' => '/approvals',
            'type' => 'submission_revised',
        ];
    }
}
