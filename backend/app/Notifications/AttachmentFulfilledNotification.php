<?php

namespace App\Notifications;

use App\Models\AttachmentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class AttachmentFulfilledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $attachmentRequest;

    public function __construct(AttachmentRequest $attachmentRequest)
    {
        $this->attachmentRequest = $attachmentRequest;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', \App\Broadcasting\FcmChannel::class];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'submission_id' => $this->attachmentRequest->submission_id,
            'request_id' => $this->attachmentRequest->id,
            'target_name' => $this->attachmentRequest->targetUser->name,
            'file_description' => $this->attachmentRequest->file_description,
            'message' => $this->attachmentRequest->targetUser->name . ' telah mengunggah lampiran yang diminta: ' . $this->attachmentRequest->file_description,
            'type' => 'attachment_fulfilled',
            'link' => '/submissions/' . $this->attachmentRequest->submission_id
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toFcm($notifiable): array
    {
        return [
            'title' => 'Lampiran Tersedia',
            'body' => $this->attachmentRequest->targetUser->name . ' sudah mengunggah: ' . $this->attachmentRequest->file_description,
            'url' => '/submissions/' . $this->attachmentRequest->submission_id,
            'type' => 'attachment_fulfilled',
        ];
    }
}
