<?php

namespace App\Notifications;

use App\Models\Submission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewSubmissionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $submission;

    /**
     * Create a new notification instance.
     */
    public function __construct(Submission $submission)
    {
        $this->submission = $submission;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', \App\Broadcasting\FcmChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pengajuan Baru: ' . $this->submission->code)
            ->line('Ada pengajuan baru dari ' . $this->submission->user->name)
            ->action('Lihat Pengajuan', url('/submissions/' . $this->submission->id))
            ->line('Mohon segera diperiksa.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'submission_id' => $this->submission->id,
            'code' => $this->submission->code,
            'title' => $this->submission->description,
            'requester_name' => $this->submission->user->name,
            'amount' => $this->submission->total_amount,
            'message' => 'Pengajuan baru dari ' . $this->submission->user->name,
            'type' => 'new_submission',
            'link' => '/submissions/' . $this->submission->id
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'submission_id' => $this->submission->id,
            'code' => $this->submission->code,
            'title' => $this->submission->description,
            'requester_name' => $this->submission->user->name,
            'amount' => $this->submission->total_amount,
            'message' => 'Pengajuan baru dari ' . $this->submission->user->name,
            'type' => 'new_submission',
            'link' => '/submissions/' . $this->submission->id,
            'created_at' => now()->toISOString()
        ]);
    }

    public function toFcm($notifiable): array
    {
        return [
            'title' => 'Pengajuan Baru (' . $this->submission->code . ')',
            'body' => $this->submission->user->name . ' mengajukan: ' . str($this->submission->description)->limit(40),
            'url' => '/approvals',
            'type' => 'new_submission',
        ];
    }
}