# Salary Matrix (Matrix Gaji Karyawan Harian)

## Overview

A specialized submission type for daily-rate employees that uses a matrix-style input (Employees vs. Dates) instead of standard line items. This feature alignment ensures parity between the Web (Next.js) and Mobile (Flutter) applications.

## Business Logic

- **Submission Type**: Specifically triggered for "Gaji Karyawan Harian".
- **Matrix Structure**: Intersects a list of Employees with a range of Active Dates.
- **Formula (Auto-Fill)**: `daily_rate = base_salary / 25`.
- **Exclusion Logic**: Users can toggle specific dates within a range as "Inactive", removing them from the matrix calculations.
- **Subtotals**:
    - Row Subtotal = Sum of nominals for an employee across active dates.
    - Employee Days Count = Number of active dates where nominal > 0.
- **Grand Total**: Sum of all row subtotals.

## Technical Implementation (Mobile)

### State Structure

```dart
final Map<int, Map<String, double>> _salaryMatrix = {}; // employeeId -> {dateStr: amount}
List<String> _excludedDates = []; // dates manually toggled off
```

### Key UI Components

- **Date Range Picker**: Defines the period.
- **Active Days Selector**: Horizontal chip list to toggle `_excludedDates`.
- **Matrix Grid**:
    - Sticky-like layout for Employee Names and Subtotals.
    - Horizontal scroll for Date columns.
    - `TextField` in each cell for manual nominal adjustment.
- **Action Buttons**:
    - **Global Auto-Fill**: Applies formula to all employees and all active dates.
    - **Per-Row Auto-Fill**: Applies formula only to a specific employee.
    - **Reset/Kosongkan**: Clears the matrix state.

## Data Structure (Payload)

Sent to the backend `POST /submissions` endpoint within the `payload` field:

```json
{
  "type": "salary",
  "date_range": {
    "start": "2026-02-22",
    "end": "2026-02-28"
  },
  "employees": [
    {
      "employee_id": 1,
      "employee_name": "Adi Prasetyo Budi",
      "department": "Produksi Harian",
      "base_salary": 2000000,
      "total_days": 7,
      "total_salary": 560000,
      "daily_records": [
        { "date": "2026-02-22", "is_present": true, "nominal": 80000 },
        ...
      ]
    }
  ],
  "total_amount": 560000
}
```

## Backend Integration

- **Controller**: `SubmissionController` handles the `payload` for PDF generation.
- **PDF Template**: `submission-salary.blade.php` iterates over the `employees` and `daily_records` to render the official matrix document.
- **Storage**: The payload is stored in the `submissions.payload` JSON column.
