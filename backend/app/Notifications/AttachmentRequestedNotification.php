<?php

namespace App\Notifications;

use App\Models\AttachmentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class AttachmentRequestedNotification extends Notification implements ShouldQueue
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
            'requester_name' => $this->attachmentRequest->requestedBy->name,
            'file_description' => $this->attachmentRequest->file_description,
            'message' => $this->attachmentRequest->requestedBy->name . ' meminta lampiran: ' . $this->attachmentRequest->file_description,
            'type' => 'attachment_request',
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
            'title' => 'Permintaan Lampiran Baru',
            'body' => $this->attachmentRequest->requestedBy->name . ' meminta: ' . $this->attachmentRequest->file_description,
            'url' => '/submissions/' . $this->attachmentRequest->submission_id,
            'type' => 'attachment_request',
        ];
    }
}
