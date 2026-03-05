# Approvals Feature

## Overview

This feature handles the complex dynamic workflow logic of the organization. It determines who needs to approve a submission, when it is approved, and at what conditions, before a submission is officially finalized.

## Key Components

### Controllers

- `ApprovalController`: Manages user actions (checking pending approvals, approving, rejecting, viewing history) and signature checking.
- `ApprovalFlowController`: An admin/manager controller to design dynamic workflows (adding steps, reordering, creating conditions) mapping to specific submission types.
- `SignatureController`: Manages the storage and retrieval of users' digital signatures required for generating the final printable documents.

### Models

- `ApprovalFlow`: The container for a multi-step approval workflow. Tied to a specific `JenisPengajuan`.
- `ApprovalFlowStep`: Represents a single step in a flow (e.g., Step 1: Supervisor, Step 2: Finance Manager). Points to a required `Role`.
- `ApprovalCondition`: Defines programmatic rules (e.g., if Amount > 5,000,000 then trigger this step).
- `SubmissionApproval`: The actual instantiation of an `ApprovalFlowStep` mapped to a completed `Submission` instance. Stores the state (Pending, Approved, Rejected) and the specific `approver_id`.

### Features & Workflows

1. **Flow Configuration**: Managers can map sequential approval roles and condition rules based on thresholds using `ApprovalFlowController`.
2. **Approval Triggers**: When a `Submission` is marked complete, the backend reads the `ApprovalFlow`, evaluates `ApprovalCondition` criteria, and generates sequential `SubmissionApproval` steps.
3. **Execution**: The relevant roles receive notifications and can query `/approvals/pending`. They can hit the `approve` endpoint to sign off, triggering the next step.
    - **Tanda Tangan Digital**: Approvers must have a valid digital signature (canvas-drawn or uploaded) before they can finalize an approval.

### API Routes

- **Execution**:
    - `GET /approvals/pending` (paginated, `per_page=25`)
    - `GET /approvals/history` (paginated, `per_page=25`)
    - `POST /approvals/{id}/approve`
    - `POST /approvals/{id}/reject`
- **Configuration (Admin)**:
    - `GET /approval-flows`
    - `POST /approval-flows/{flow}/steps`
    - `POST /approval-flows/{flow}/steps/reorder`
    - `POST /approval-flows/{flow}/conditions`
