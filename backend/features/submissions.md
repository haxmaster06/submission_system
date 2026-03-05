# Submissions Feature

## Overview

The core module of the application where users can create, edit, attach documents to, and view their requests (pengajuan) for budgets, travel, or procurement.

## Key Components

### Controllers

- `SubmissionController`: Replaces standard RESTful logic with complex workflow processing. Manages submission creation, file attachments, submission completion (triggering approvals), and generating PDF previews.

### Models

- `Submission`: The main entity representing a request header.
- `SubmissionItem`: The detailed line-items (cost breakdowns) of a submission.
- `SubmissionAttachment`: File attachments (receipts, quotes) uploaded to the submission.
- **[Salary Matrix](file:///home/hbm-server/submission_system/backend/features/salary_matrix.md)**: A specialized structure for daily-rate employee payroll within the `payload` JSON field.

### Features & Workflows

1. **Drafting**: Submissions are initially drafted.
2. **Itemization**: Costs are attached as multiple `SubmissionItem` records calculating a total amount.
3. **Attachments**: Users upload supportive proofs to `SubmissionAttachment`.
    - **Request Attachment**: Submitter can request specific documents from other users.
4. **Completion**: Calling `POST /submissions/{id}/complete` locks the draft and initializes the corresponding `ApprovalFlow`, changing the status to Pending.
5. **Bulk Operations**: Supports `POST /submissions/bulk-delete` for efficient cleanup of drafts.
6. **PDF Export**: Users can preview or download their submission document directly via generated Signed URLs.

### API Routes

- `API Resource /submissions`: Standard CRUD and paginated lists (`per_page=25`, server-side search).
- `POST /submissions/bulk-delete`: Allows multiple deletion.
- `POST /submissions/{submission}/attachments`: Upload documents.
- `GET /submissions/{submission}/export`: Download PDF.
- `GET /submissions/{submission}/preview-url`: Rendered blade templates for signatures.
- `POST /submissions/{submission}/complete`: Finalize submission and start approval.
