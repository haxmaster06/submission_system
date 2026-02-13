<?php

namespace App\Notifications;

use App\Models\Submission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BudgetExceededNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $submission;
    public $amount;
    public $budgetLimit;
    public $currentUsage;

    /**
     * Create a new notification instance.
     */
    public function __construct(Submission $submission, $amount, $budgetLimit, $currentUsage)
    {
        $this->submission = $submission;
        $this->amount = $amount;
        $this->budgetLimit = $budgetLimit;
        $this->currentUsage = $currentUsage;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Peringatan: Budget Terlampaui - ' . $this->submission->code)
            ->line('Pengajuan #' . $this->submission->code . ' melebihi batas budget Divisi.')
            ->line('Budget Limit: ' . number_format($this->budgetLimit))
            ->line('Penggunaan Current: ' . number_format($this->currentUsage))
            ->line('Nominal Pengajuan: ' . number_format($this->amount))
            ->action('Lihat Pengajuan', url('/submissions/' . $this->submission->id));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'submission_id' => $this->submission->id,
            'code' => $this->submission->code,
            'title' => 'Budget Alert: ' . $this->submission->title,
            'message' => "Pengajuan melebihi budget divisi! (Limit: " . number_format($this->budgetLimit) . ")",
            'type' => 'budget_exceeded',
            'link' => '/submissions/' . $this->submission->id,
            'severity' => 'warning'
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'submission_id' => $this->submission->id,
            'code' => $this->submission->code,
            'title' => 'Budget Alert: ' . $this->submission->title,
            'message' => "Pengajuan melebihi budget divisi! (Limit: " . number_format($this->budgetLimit) . ")",
            'type' => 'budget_exceeded',
            'link' => '/submissions/' . $this->submission->id,
            'severity' => 'warning',
            'created_at' => now()->toISOString()
        ]);
    }
}
