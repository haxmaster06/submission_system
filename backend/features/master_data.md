# Master Data Management Feature

## Overview

This module provides centralized management for all lookup tables and foundational data required by the submission system. It is primarily managed by users with the `manage master data` permission.

## Key Components

### Controllers

- `MasterDataController`: Handles CRUD operations for all master data points (Divisions, Types, UOMs, etc.) requiring specific permissions.
- `LookupController`: Provides public, read-only endpoints returning concise, active lists of data usually for frontend dropdowns.
- `EmployeeController`: Manages the employee database (separate from system logins/Users).

### Models

- `Division`: Represents company departments or divisions.
- `JenisPengajuan`: Submission types (e.g., Cash Advance, Reimbursement).
- `JenisPerjalanan`: Travel types (e.g., Domestic, International).
- `Uom`: Unit of Measurement definitions (e.g., Pcs, Hari, Unit).
- `UrgencyStatus`: Defines urgency levels for submissions.
- `Employee`: HR records of employees.
- `Setting`: Global application settings, such as `maintenance_mode`.

### API Routes

- **Lookups (Frontend Cache)**:
    - `GET /lookups/divisions`
    - `GET /lookups/jenis-pengajuan`
    - `GET /lookups/uoms`, etc.
- **Management (Protected)**:
    - `POST/PUT/DELETE /master/divisions`
    - `POST/PUT/DELETE /master/types`
    - `POST/PUT/DELETE /master/uoms`
    - `POST/PUT/DELETE /master/travel-types`
    - `POST/PUT/DELETE /master/urgency` (includes `reorder`)
    - `API Resource /master/employees`
