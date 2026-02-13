<?php

namespace App\Notifications;

use App\Models\Submission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProxySignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $submission;
    public $proxyName;

    /**
     * Create a new notification instance.
     */
    public function __construct(Submission $submission, $proxyName)
    {
        $this->submission = $submission;
        $this->proxyName = $proxyName;
    }

    public function via(object $notifiable): array
    {
        // Maybe mail is important for this security event
        return ['database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Info: Tanda Tangan Proxy Digunakan')
            ->line("Tanda tangan Anda digunakan oleh {$this->proxyName} untuk menyetujui pengajuan #{$this->submission->code}.")
            ->action('Lihat Detail', url('/submissions/' . $this->submission->id));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'submission_id' => $this->submission->id,
            'code' => $this->submission->code,
            'title' => 'Proxy Signature Alert',
            'message' => "Tanda tangan Anda digunakan oleh {$this->proxyName}",
            'type' => 'proxy_singed',
            'link' => '/submissions/' . $this->submission->id,
            'proxy_name' => $this->proxyName
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'submission_id' => $this->submission->id,
            'code' => $this->submission->code,
            'title' => 'Proxy Signature Alert',
            'message' => "Tanda tangan Anda digunakan oleh {$this->proxyName}",
            'type' => 'proxy_singed',
            'link' => '/submissions/' . $this->submission->id,
            'proxy_name' => $this->proxyName,
            'created_at' => now()->toISOString()
        ]);
    }
}
