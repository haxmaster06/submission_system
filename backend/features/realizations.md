# Realizations Feature

## Overview

Realisasi (Realizations) tracks the actual spending against the budgeted amount requested in a Submission. It ensures financial accountability by detailing differences, handling refunds, or recording over-expenditures.

## Key Components

### Controllers

- `RealizationController`: Provides logic to view tracking details of a specific submission, process new realization entries containing receipts, and manage the final numbers against the parent submission.

### Models

- `RealizationHeader`: Ties together multiple realization lines directly to a completed and approved `Submission`.
- `RealizationDetail`: Individual line-items describing what the money was actually spent on versus what was requested.

### API Routes

- `GET /submissions/{submission}/realizations`: Fetch realization data tied to a specific submission.
- `API Resource /realizations` (except index): Handling CRUD for creating new realization proofs and updating amounts.
