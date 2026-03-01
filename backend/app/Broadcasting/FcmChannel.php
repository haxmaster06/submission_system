<?php

namespace App\Broadcasting;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;

class FcmChannel
{
    /**
     * Send the given notification via Firebase Cloud Messaging.
     */
    public function send($notifiable, Notification $notification)
    {
        if (!method_exists($notifiable, 'fcmTokens')) {
            Log::warning('FcmChannel: Notifiable does not have fcmTokens method.');
            return;
        }

        if (!method_exists($notification, 'toFcm')) {
            Log::warning('FcmChannel: Notification does not have toFcm method.');
            return;
        }

        $tokens = $notifiable->fcmTokens()->pluck('token')->toArray();

        if (empty($tokens)) {
            return;
        }

        $payloadData = $notification->toFcm($notifiable);
        $credentialsPath = base_path(env('FIREBASE_CREDENTIALS', 'storage/firebase-service-account.json'));

        if (!file_exists($credentialsPath)) {
            Log::warning('FcmChannel: Firebase credentials file not found at ' . $credentialsPath);
            return;
        }

        try {
            $firebase = (new Factory)
                ->withServiceAccount($credentialsPath);
            $messaging = $firebase->createMessaging();

            $messagePayload = [
                'notification' => [
                    'title' => $payloadData['title'] ?? 'Notifikasi',
                    'body' => $payloadData['body'] ?? '',
                ],
                'data' => [
                    'url' => $payloadData['url'] ?? '/',
                    'type' => $payloadData['type'] ?? 'general',
                ],
            ];

            // Filter valid tokens to avoid failing the whole batch
            // The Firebase SDK will throw an exception if any token is invalid conceptually
            // However, sendMulticast returns a report of successes and failures.
            $report = $messaging->sendMulticast(CloudMessage::fromArray($messagePayload), $tokens);

            if ($report->hasFailures()) {
                foreach ($report->failures()->getItems() as $failure) {
                    $failedToken = $failure->target()->value();
                    $error = $failure->error()->getMessage();
                    Log::warning("FCM send failed for token: {$failedToken}. Error: {$error}");

                    // If the token is unregistered or invalid, remove it from the database
                    if (str_contains(strtoupper($error), 'UNREGISTERED') || str_contains(strtoupper($error), 'INVALID_ARGUMENT')) {
                        $notifiable->fcmTokens()->where('token', $failedToken)->delete();
                        Log::info("Removed stale FCM token: {$failedToken}");
                    }
                }
            }

            if ($report->hasSuccesses()) {
                Log::info("FCM multcast successful to " . $report->successes()->count() . " devices.");
            }

        }
        catch (\Throwable $e) {
            Log::error('FcmChannel Error: ' . $e->getMessage());
        }
    }
}