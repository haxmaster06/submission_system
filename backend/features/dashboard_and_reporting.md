# Dashboard & Reporting Feature

## Overview

This module aggregates application numbers and financial data to provide an overview to staff and high-level analytical data to super admins and management directors.

## Key Components

### Controllers

- `DashboardController`: Supplies statistical numbers displayed on the home page. Contains logic conditional to a user's role:
    - **Super Admin**: Global overview (Total users, total systems budget).
    - **Management (Director, GM, Finance)**: Organizational-wide insights, division performance rankings, and financial trends.
    - **Staff/Others**: Personal interaction history and division-specific counters.
- `ReportingController`: Provides comprehensive endpoints used by Finance / Master Data roles (and Management) to query, list, summarize, and export structured reporting sheets.

### Features & Workflows

- **Staff Stats Dashboard**: Provides quick hits (`GET /dashboard/stats`) corresponding to Personal pending, approved, and rejected volumes.
- **Admin & Management Dashboard**: Gives high-level aggregates (`GET /admin/dashboard-stats`) like total application users, total urgent documents, and organization-wide pending pipelines. Restricted to Management and Admins.
- **Mobile Visual Analytics**: The mobile application enhances these statistics using `fl_chart` to display:
    - **Trends**: Line chart showing Budget vs Realization over 6 months.
    - **Distribution**: Pie chart for Submission Categories (Stationery, Petty Cash, etc.).
    - **Rankings**: Division performance rankings based on budget usage.
- **PDF Reporting & Export**: Routes mapping to `ReportingController` handle generating and serving PDF exports and browser-printable templates for end-of-month reconciliations.

### API Routes

- `GET /dashboard/stats`
- `GET /admin/dashboard-stats`
- `GET /reports/submissions`
- `GET /reports/submissions/export` (PDF download)
- `GET /reports/submissions/print-url` (HTML Print view)
