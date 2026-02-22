<?php

namespace App\Notifications;

use App\Models\Submission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubmissionStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $submission;
    public $status; // 'approved' or 'rejected'
    public $approverName;

    /**
     * Create a new notification instance.
     */
    public function __construct(Submission $submission, string $status, string $approverName)
    {
        $this->submission = $submission;
        $this->status = $status;
        $this->approverName = $approverName;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $statusIndo = $this->status === 'approved' ? 'Disetujui' : 'Ditolak';

        return (new MailMessage)
            ->subject('Update Status Pengajuan: ' . $this->submission->code)
            ->line("Pengajuan Anda telah $statusIndo oleh $this->approverName")
            ->action('Lihat Detail', url('/submissions/' . $this->submission->id))
            ->line('Terima kasih.');
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
            'status' => $this->status,
            'approver_name' => $this->approverName,
            'message' => "Pengajuan {$this->submission->code} telah " . ($this->status === 'approved' ? 'disetujui' : 'ditolak'),
            'type' => 'submission_status',
            'link' => '/submissions/' . $this->submission->id
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'submission_id' => $this->submission->id,
            'code' => $this->submission->code,
            'title' => $this->submission->description,
            'status' => $this->status,
            'approver_name' => $this->approverName,
            'message' => "Pengajuan {$this->submission->code} telah " . ($this->status === 'approved' ? 'disetujui' : 'ditolak'),
            'type' => 'submission_status',
            'link' => '/submissions/' . $this->submission->id,
            'created_at' => now()->toISOString()
        ]);
    }
}