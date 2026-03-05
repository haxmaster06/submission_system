# Notifications & Audit Logs Feature

## Overview

This combined feature is critical for tracking system behavior, accountability, and alerting users when workflows require their immediate attention.

## Key Components

### Controllers

- `NotificationController`: Provides REST resources for in-app database notifications.
- `PushNotificationController` & `FcmTokenController`: Logic for interacting with Google Firebase Cloud Messaging APIs to dispatch native mobile OS alerts.
- `AuditTrailController`: Returns structured metadata detailing every programmatic change to records in the database.

### Models

- `FcmToken` & `PushSubscription`: Links native device registration tokens to Laravel user accounts for external pushing.
- `AuditTrail`: Logs the "who, what, and when" for sensitive state configurations and critical submission interactions.

### Features & Workflows

1. **Pusher / Database Notifications**: Triggered locally within the Laravel ecosystem whenever statuses change. Handled primarily by Laravel's built-in `Notification` facade using a custom database channel.
    - **User Actions**: Users can acknowledge, mark-read, or batch-delete (`DELETE /notifications/batch`) these records.
    - **Localization**: All messages are served in **Bahasa Indonesia** for better accessibility.
    - **Mobile Implementation**: Features a real-time notification badge on the Dashboard with unread count synchronization.
2. **FCM Synchronization**: When a user logs in via the mobile app, `FcmTokenController` stores their device string. Background queued jobs use this token to dispatch real-time ping alerts to their lockscreens.
3. **Audit Trails**: Global observer logic silently writes to the `audit_trails` table. Exposes endpoints (`/admin/audit-logs`) empowering Super Admins to resolve disputes regarding who approved what, and what values actually changed.

### API Routes

- `GET /notifications`
- `PUT /notifications/{id}/read`
- `PUT /notifications/read-all`
- `DELETE /notifications/batch`
- `POST /fcm/register`, `/unregister`, `/check`
- `GET /audit-logs/{model}/{id}`
- `GET /admin/audit-logs` (paginated, `per_page=25`)
