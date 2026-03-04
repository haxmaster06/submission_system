# HBM Budgeting System – Mobile Version (Flutter)

## Objective

Build a mobile application version of **HBM Budgeting System** using Flutter (latest stable).

The backend already exists using:

- Laravel 11 (REST API)
- Sanctum (Bearer Token Authentication)
- MySQL 8
- Firebase Cloud Messaging (FCM)
- Laravel Reverb (WebSocket)

The mobile app must integrate fully with this backend using REST API (JSON) and secure token authentication.

---

# 1. Project Initialization

Create a new folder at the project root:
/mobile

Inside it, initialize Flutter:


Use:

- Flutter 3.x (latest stable)
- Dart 3.x
- Material 3 Design

---

# 2. Architecture Requirement

Use **Clean Architecture + Feature-based Modular Structure**.

## Folder Structure

mobile/
└── lib/
├── core/
│ ├── config/
│ ├── constants/
│ ├── theme/
│ ├── utils/
│ └── network/
│
├── features/
│ ├── auth/
│ ├── dashboard/
│ ├── submissions/
│ ├── approvals/
│ ├── realizations/
│ ├── notifications/
│ └── profile/
│
├── shared/
│ ├── widgets/
│ └── components/
│
└── main.dart


---

# 3. Required Mobile Stack

Use:

- State Management: Riverpod
- HTTP Client: Dio
- Routing: GoRouter
- Secure Storage: flutter_secure_storage
- JSON Serialization: Freezed + json_serializable
- File Picker: file_picker
- Image Compression: flutter_image_compress
- PDF Viewer: Syncfusion PDF Viewer (or equivalent)
- Firebase: firebase_core + firebase_messaging
- WebSocket: Connect to Laravel Reverb
- Animations: Smooth transitions and implicit animations

---

# 4. UI / UX Requirements

The mobile UI must be:

- Modern
- Clean
- Fluid
- Non-rigid
- Not overly classic
- Fully responsive
- No overflow issues

## UI Rules

- Use Material 3
- Use 8pt spacing system
- Rounded corners (16–24px)
- Subtle elevation
- Clean card-based layout
- Support Dark Mode
- Minimum font size: 16px
- Tap area: minimum 44px

## Layout Rules

- Wrap long forms with `SingleChildScrollView`
- Use `Expanded` and `Flexible` correctly
- Prevent keyboard overflow
- Use proper safe area handling

Use Bottom Navigation as primary navigation.

---

# 5. Core Features

## A. Authentication

- Login (Email + Password)
- Store Sanctum token securely
- Handle 401 → Auto logout
- Handle 503 → Show Maintenance Screen
- Logout clears secure storage

---

## B. Role-Based Dashboard

### Staff

- My Submissions
- Personal statistics
- Floating Action Button (Create Submission)

### Manager / Director

- Pending Approvals
- Urgent badge highlight

### Super Admin

- Global Summary
- Total Budget
- Top Division
- Active Users

Add:

- Pull-to-refresh
- Shimmer loading
- Animated counters

---

## C. Submission Module

Use step-based wizard form:

1. Meta Information
2. Add Items (Dynamic List)
3. Attachments
4. Review & Submit

### Requirements

- Dynamic item list
- Bottom sheet item editor
- Live total calculation
- Currency formatter
- Auto-save draft
- Multi-file upload
- File preview
- Image compression before upload
- No UI overflow

---

## D. Approval Module

- List pending approvals
- Detail screen:
  - Submission summary
  - Scrollable item table
  - Vertical approval timeline
- Approve / Reject with note
- Show digital signature preview
- Respect sequential approval logic

---

## E. Realization Module

- Compare requested vs actual
- Highlight difference in red if exceeded
- Add realization items dynamically
- Upload receipts
- Summary difference indicator

---

## F. Notifications

Integrate Firebase Cloud Messaging.

### Requirements

- Receive push when:
  - Approval assigned
  - Submission approved
  - Submission rejected
- Work in:
  - Foreground
  - Background
  - Terminated state
- Deep link to correct screen
- Store FCM token via:

POST /api/fcm-token


- Badge counter
- In-app toast notification

---

# 6. Real-Time Integration

Connect to Laravel Reverb WebSocket:

- Subscribe to private user channel
- Show real-time toast
- Auto-refresh related state

---

# 7. Security

- Token stored in secure storage
- No sensitive data in plain storage
- Proper error handling
- Session invalidation handling
- Maintenance screen on 503

---

# 8. Performance Optimization

- Pagination
- Lazy loading
- Debounce search
- Image compression before upload
- Cache dashboard summary
- Avoid unnecessary rebuilds

---

# 9. Mandatory Mobile UX Improvements

Add enhancements beyond web version:

- Swipe-to-refresh
- Swipe-to-delete draft
- Long press quick actions
- Bottom sheet contextual menu
- Animated success check
- Smooth screen transitions
- Smart keyboard types
- Biometric login ready structure
- Offline-ready architecture (future sync queue)

---

# 10. Deliverables

The final result must include:

1. Fully working Flutter app inside `/mobile`
2. Clean architecture
3. Modern UI
4. No layout overflow
5. Firebase Push Notification working
6. WebSocket working
7. README.md including:
   - Setup guide
   - Firebase configuration
   - API configuration
   - Environment setup

---

# 11. Quality Standard

- Production-ready code
- Modular and scalable
- No hardcoded values
- Proper loading states
- Proper error states
- Clean naming convention
- Reusable components
- Maintainable structure

---

# End Goal

A fully functional, modern, mobile-first Flutter application for HBM Budgeting System, seamlessly connected to the existing Laravel backend, with reliable push notifications, real-time updates, smooth UX, and enterprise-level stability.


