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

                    $errorMessage = strtoupper((string) $error);
                    // If the token is unregistered or invalid, remove it from the database
                    if (
                        str_contains($errorMessage, 'UNREGISTERED') ||
                        str_contains($errorMessage, 'INVALID_ARGUMENT') ||
                        str_contains($errorMessage, 'NOT FOUND') ||
                        str_contains($errorMessage, 'NOT_FOUND') ||
                        str_contains($errorMessage, 'SENDER_ID_MISMATCH')
                    ) {
                        Log::info("FcmChannel: Attempting to remove stale token: {$failedToken} due to error: {$error}");
                        $notifiable->fcmTokens()->where('token', $failedToken)->delete();
                        Log::info("FcmChannel: Stale token removed.");
                    }
                }
            }

            if ($report->successes()->count() > 0) {
                Log::info("FCM multcast successful to " . $report->successes()->count() . " devices.");
            }

        }
        catch (\Throwable $e) {
            Log::error('FcmChannel Error: ' . $e->getMessage());
        }
    }
}