<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PushNotificationController extends Controller
{
    /**
     * Check if a specific endpoint is subscribed by the current user.
     */
    public function check(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url',
        ]);

        $user = Auth::user();
        $exists = $user->pushSubscriptions()
            ->where('endpoint', $request->endpoint)
            ->exists();

        return response()->json(['is_subscribed' => $exists]);
    }

    /**
     * Subscribe a user's browser device to receive Web Push notifications.
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $user = Auth::user();

        // Update or create the subscription
        $user->pushSubscriptions()->updateOrCreate(
        ['endpoint' => $request->endpoint],
        [
            'public_key' => $request->input('keys.p256dh'),
            'auth_token' => $request->input('keys.auth'),
        ]
        );

        return response()->json(['message' => 'Push subscription created successfully.']);
    }

    /**
     * Unsubscribe a user's browser relative to the endpoint.
     */
    public function unsubscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url',
        ]);

        $user = Auth::user();

        $deleted = $user->pushSubscriptions()
            ->where('endpoint', $request->endpoint)
            ->delete();

        return response()->json(['message' => 'Push subscription removed successfully.']);
    }
}