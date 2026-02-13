<?php

namespace App\Notifications;

use App\Models\RealizationHeader;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewRealizationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $realization;

    /**
     * Create a new notification instance.
     */
    public function __construct(RealizationHeader $realization)
    {
        $this->realization = $realization;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $code = $this->realization->submission->code ?? 'Unknown';
        return (new MailMessage)
            ->subject('Realisasi Baru: ' . $code)
            ->line('Ada laporan realisasi baru untuk pengajuan #' . $code)
            ->action('Lihat Detail', url('/submissions/' . $this->realization->submission_id));
    }

    public function toArray(object $notifiable): array
    {
        $code = $this->realization->submission->code ?? 'Unknown';
        $title = $this->realization->submission->title ?? 'Unknown';
        
        return [
            'submission_id' => $this->realization->submission_id,
            'realization_id' => $this->realization->id,
            'code' => $code,
            'title' => 'Realisasi: ' . $title,
            'message' => "Laporan realisasi baru untuk #{$code}",
            'type' => 'new_realization',
            'link' => '/submissions/' . $this->realization->submission_id
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $code = $this->realization->submission->code ?? 'Unknown';
        $title = $this->realization->submission->title ?? 'Unknown';

        return new BroadcastMessage([
            'submission_id' => $this->realization->submission_id,
            'realization_id' => $this->realization->id,
            'code' => $code,
            'title' => 'Realisasi: ' . $title,
            'message' => "Laporan realisasi baru untuk #{$code}",
            'type' => 'new_realization',
            'link' => '/submissions/' . $this->realization->submission_id,
            'created_at' => now()->toISOString()
        ]);
    }
}
