<?php

namespace App\Broadcasting;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class WebPushChannel
{
    /**
     * Send the given notification.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        // Ensure the notifiable object (e.g., User) has the required method
        if (!method_exists($notifiable, 'pushSubscriptions')) {
            return;
        }

        // The notification must implement a `toWebPush` method
        if (!method_exists($notification, 'toWebPush')) {
            return;
        }

        $subscriptions = $notifiable->pushSubscriptions;

        // Skip if the user hasn't registered any browsers
        if ($subscriptions->isEmpty()) {
            return;
        }

        // Get the payload array from the notification class
        $payloadData = $notification->toWebPush($notifiable);
        $payloadString = json_encode($payloadData);

        // Retrieve VAPID credentials from config/environment
        $auth = [
            'VAPID' => [
                'subject' => env('APP_URL', 'mailto:admin@hbmnet.co.id'),
                'publicKey' => env('VAPID_PUBLIC_KEY'),
                'privateKey' => env('VAPID_PRIVATE_KEY'),
            ],
        ];

        // Ensure keys exist before attempting to send
        if (empty($auth['VAPID']['publicKey']) || empty($auth['VAPID']['privateKey'])) {
            Log::warning('WebPushChannel: VAPID keys are missing from .env');
            return;
        }

        $webPush = new WebPush($auth);

        // Queue all messages for each of the user's active devices
        foreach ($subscriptions as $sub) {
            $webPush->queueNotification(
                Subscription::create([
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->public_key,
                'authToken' => $sub->auth_token,
            ]),
                $payloadString
            );
        }

        // Flush the queue and send the requests to browser push services (Google/Mozilla/Apple)
        foreach ($webPush->flush() as $report) {
            if (!$report->isSuccess()) {
                Log::error('WebPush Failed: ' . $report->getReason());

                // If the endpoint expired or user revoked permission, delete the stale subscription from DB
                if ($report->isSubscriptionExpired()) {
                    $notifiable->pushSubscriptions()->where('endpoint', $report->getRequest()->getUri()->__toString())->delete();
                }
            }
        }
    }
}