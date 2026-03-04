# 🎯 MASTER UI TRANSFORMATION RULE

## HBM Submission System → Modern Corporate Indigo Style

---

### 1️⃣ GLOBAL DESIGN RULES

_Apply these rules across all screens for consistency._

#### **Color System**

- **Primary**:
  - Deep Indigo / Royal Blue (`#3F3D9E` or similar).
  - Subtle gradient (Blue → Purple-Blue) for hero sections.
- **Background**:
  - Light Grey (Soft): `#F5F6FA`
  - Pure White: For cards and containers.
- **Status Colors (Soft Palette)**:
  - **Approved**: Green Soft
  - **Pending**: Orange Soft
  - **Rejected**: Red Soft

#### **Shapes & Elevation**

- **Global Radius**: `20px`
- **Card Radius**: `20–24px`
- **Button Radius**: `18–22px`
- **Elevation (Soft Shadows Only)**:
  - Offset: `y: 6–10`
  - Blur: `20`
  - Opacity: `8–12%` (No hard shadows allowed).

#### **Typography Hierarchy**

- **Greeting / Hero Title**: `22–24px` Bold
- **Section Title**: `16–18px` Semi-Bold
- **Card Title**: `14–16px` Medium
- **Label**: `12–13px` Regular
- **Currency**: Bold, slightly larger than surrounding text.
- _Note: All text must be clean, clear, and not condensed._

---

### 2️⃣ DASHBOARD DESIGN RULES

#### **Hero Section (Top)**

- **Background**: Indigo solid or subtle gradient.
- **Shape**: Full width with `30px` radius on bottom-left and bottom-right.
- **Content (Left)**:
  - Small text: "Halo,"
  - User Name: **Bold Large**
  - Role: Smaller, `70%` opacity.
- **Content (Right)**:
  - Circular notification icon with transparent white background.
  - Small circular user avatar.
- **Highlight Card (Floating Style)**:
  - 1 floating card inside the hero.
  - White background, `18px` radius.
  - Display: Total Submissions This Month or Approved Budget (Large Bold value).

#### **Stat Cards (Below Hero)**

- **Layout**: 2-column grid.
- **Style**: White card, `20px` radius, soft shadow.
- **Content**:
  - Top-left icon inside a soft blue circle.
  - Small title, large value.
  - _Optional_: Thin progress bar at the bottom.
- **Metrics**: Total Submissions, Approved, Pending, Rejected.

#### **Submission List**

- **Style**: White card, `14–16px` spacing.
- **Layout**:
  - Small icon on the left.
  - Title Bold, Subtitle (Division, Date) small.
  - Nominal (Currency) bottom-right.
  - Status badge (Rounded Pill) top-right.

---

### 3️⃣ SUBMISSION LIST SCREEN

- **Header**: Clean layout, white background, title on top-left, search/filter icons on top-right.
- **Filter Chips**: Rounded pill style. Background soft grey, Blue when active.
- **Cards**: `20px` radius, white, soft shadow, optional thin blue left accent bar.

---

### 4️⃣ SUBMISSION DETAIL SCREEN

- **Top Section**: "Mini-Hero" style, Indigo background, `30px` bottom radius. Large white Title and Nominal, contrast status badge.
- **Breakdown Section**: White card, `20px` radius, invoice-style layout (Label left, Nominal right).
- **Approval Timeline**: Vertical modern stepper with small circles. Colored based on status (Green/Blue/Grey). Large spacing.

---

### 5️⃣ CREATE SUBMISSION SCREEN

- **Top Section**: Indigo background, White Title ("Buat Pengajuan").
- **Form Container**: White with `30px` top-radius, overlapping the hero.
- **Inputs**: Floating labels, `18px` radius, very soft grey background. Border becomes blue on focus.
- **Dropdowns**: Rounded, minimal arrows.
- **Submit Button**: Full width, `22px` rounded, solid indigo, bold white text, soft shadow.

---

### 6️⃣ APPROVAL SCREEN

- **Top Section**: Mini-Hero (Indigo), Title "Approval", pending count.
- **Tabs**: Pill style ("Menunggu", "Riwayat").
- **Cards**: White, `20px` radius, max 2-line title, bold nominal, status badge.
- **Actions**: Modern Bottom Sheet (`30px` top-radius). Reject (Red Outline), Approve (Green Solid).

---

### 7️⃣ PROFILE SCREEN

- **Top Section**: Indigo Hero with large center avatar, bold Name, small Role.
- **Menu Card**: White, `20px` radius, minimal list tiles with left icons and right arrows.
- **Logout**: Red outline button, full width.

---

### 8️⃣ MICRO-INTERACTION RULES

- **Tap Feedback**: Scale down to `0.98` on card tap.
- **Transitions**: Smooth fade between tabs.
- **Buttons**: Lower elevation on press.
- **Bottom Sheets**: Smooth slide animation.
- **Refresh**: Clean pull-to-refresh indicator.

---

### 9️⃣ BOTTOM NAVIGATION

- **Style**: White background, `25px` top-radius, soft shadow.
- **Icons**: Active (Filled Blue), Inactive (Grey), small labels.

---

### 🔟 STRICT RULES (DO NOT DEVIATE)

1. **No Logic Changes**: Do not modify role logic or approval flows.
2. **No Data Changes**: Maintain the existing data structure.
3. **No New Features**: Do not add extra functionality.
4. **Visual Only**: Focus strictly on visual refinement and layout transformation based on the reference Indigo style.
