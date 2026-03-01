<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications (read and unread) for the authenticated user.
     * User wants notifications to stay in the bell even after reading.
     */
    public function index(Request $request)
    {
        // Get all notifications, unread first, then read, sorted by newest
        $notifications = $request->user()->notifications()
            ->orderBy('read_at', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $notifications
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();

        if ($notification && is_null($notification->read_at)) {
            $notification->markAsRead();
        }

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Delete a specific notification.
     */
    public function destroy(Request $request, $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->delete();
        }

        return response()->json(['message' => 'Notification deleted']);
    }

    /**
     * Batch delete notifications (e.g. all read ones or all of them).
     */
    public function batchDelete(Request $request)
    {
        $request->validate([
            'type' => 'required|in:all,read',
        ]);

        $query = $request->user()->notifications();

        if ($request->type === 'read') {
            $query->whereNotNull('read_at');
        }

        $query->delete();

        return response()->json(['message' => 'Notifications deleted']);
    }
}