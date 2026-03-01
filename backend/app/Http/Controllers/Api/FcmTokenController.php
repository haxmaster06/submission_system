<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FcmTokenController extends Controller
{
    /**
     * Register a new FCM token for the authenticated user.
     * This will be used by the upcoming Flutter mobile app.
     */
    public function register(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'device_name' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();

        // Update or create based on token itself since it's unique per device
        $user->fcmTokens()->updateOrCreate(
        ['token' => $request->token],
        ['device_name' => $request->device_name]
        );

        return response()->json(['message' => 'FCM Token registered successfully']);
    }

    /**
     * Remove an FCM token (e.g., when the user logs out from the mobile app).
     */
    public function unregister(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $user = Auth::user();
        $user->fcmTokens()->where('token', $request->token)->delete();

        return response()->json(['message' => 'FCM Token removed successfully']);
    }

    /**
     * Check if a token is registered.
     */
    public function check(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $user = Auth::user();
        $exists = $user->fcmTokens()->where('token', $request->token)->exists();

        return response()->json(['is_registered' => $exists]);
    }
}