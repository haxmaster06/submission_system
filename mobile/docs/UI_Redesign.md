# Redesign UI – HBM Submission System (Flutter Mobile)

**ROLE:**
You are a Senior Enterprise Mobile UI/UX Designer specializing in corporate financial-grade applications.

Your task is to redesign the mobile UI of an existing Flutter application named: **HBM Submission System**

> **CRITICAL RULE:** Do NOT change any business logic, navigation flow, role-based access logic, or feature structure.

Only improve:

- Layout
- Visual hierarchy
- Typography
- Spacing system
- Color palette
- Component consistency
- Micro-interactions
- Responsive behavior

---

## 📌 CONTEXT

**HBM Submission System** is an internal corporate mobile app used by:

- Staff
- Manager
- Finance
- GM
- Director
- Super Admin

It is used for:

- Creating budget submissions
- Reviewing submission details
- Managing approval workflow
- Tracking submission status
- Viewing dashboard analytics
- Managing profile & digital signature

This is a B2B enterprise environment.

**The design must feel:**

- Professional
- Clean
- Financial-grade
- Trustworthy
- Modern corporate
- Minimal but strong hierarchy

> ❌ **AVOID:** No playful UI. No startup flashy style.

---

## 🎨 DESIGN STYLE REQUIREMENTS

**Colors:**

- **Primary:** Navy / Deep Blue
- **Background:** White background dominant
- **Surfaces:** Soft Gray
- **Status Categories:**
  - Green for _Approved_
  - Orange/Yellow for _Pending_
  - Red for _Rejected_
- **Effects:**
  - Subtle gradient (very soft)
  - Soft shadows (not heavy)

**Shape & Typography:**

- **Corners:** Rounded corners (16–20px)
- **Space:** Clean white space (consistent using a modular scale)
- **Typography style:**
  - Modern sans-serif
  - Strong heading hierarchy
  - Clear contrast
  - Currency bold and dominant

---

## 🧭 NAVIGATION STRUCTURE

Persistent Bottom Navigation Bar.

**Tabs (dynamic based on role):**

- **Standard User:** Dashboard -> Submissions -> Profile
- **Approver User:** Dashboard -> Submissions -> Approval -> Profile

**Tab icons:**

- Outlined when inactive
- Filled when active
- Primary color when active

---

## 📱 SCREEN REDESIGN SPECIFICATIONS

### 1️⃣ LOGIN SCREEN

Redesign with:

- Corporate minimal background (soft gradient top)
- Centered company logo
- Card-style login form
- Floating label input fields
- Password visibility toggle
- Remember Me checkbox
- Large primary button
- Loading indicator inside button
- Keyboard-safe scrolling behavior
- Error message soft red below input
  > _Make it feel like a banking app login._

### 2️⃣ DASHBOARD

**Header:**

- Greeting: "Halo, [Nama]"
- Role below name
- Notification icon right top

**Main Content (Stat Cards grid - 2 columns):**

- **Super Admin:** Total Users, Active Users (7 days), Total Submissions
- **Manager:** Urgent Submissions Highlight
- **Staff:** Total My Submissions, Approved, Pending, Rejected

**StatCard Design:**

- White surface
- Soft shadow
- Left accent bar or subtle gradient
- Large number
- Icon circle

### 3️⃣ SUBMISSIONS LIST

**Header:**

- Page Title
- Search bar
- Horizontal filter chips: Semua, Menunggu, Disetujui, Ditolak

**Submission Card must contain:**

- Title (bold, maxLines 1, ellipsis)
- Applicant name
- Division
- Grand Total (formatted currency, bold)
- Status Badge (color-coded)

**Floating Action Button:**

- Bottom right icon, Elevated, Corporate look
  > _Add elegant empty state if no data._

### 4️⃣ SUBMISSION DETAIL

**Header Section:**

- Big Title, Creator name, Division name (not ID), Date, Highlighted Grand Total (invoice style box)

**Cost Breakdown:**

- Clean invoice-like list, Divider spacing, Clear price alignment right

**Approval Timeline:**

- Vertical timeline/stepper
- Approved = Green, Current = Blue, Pending = Grey
- If no approval history: show subtle info box

### 5️⃣ CREATE SUBMISSION FORM

Must feel structured and premium.

**Fields:**

- Submission Type (dropdown), Title, Division (read-only), Dynamic cost section

**Dynamic Behavior:**

- Smooth animated transition when type changes, No UI flicker, Clear section separation

**Validation & Button:**

- Inline validation, Soft red text, No raw error
- Primary submit button: Full width, Elevated, Clear CTA

### 6️⃣ APPROVAL AREA

**Tabbed Layout:** Menunggu, Riwayat

**Approval Card must show:**

- Title (max 2 lines, ellipsis), Applicant name, Division, Type, Grand total (highlighted), Notes preview (if any)
  > _Layout must avoid overflow on small devices._

**When tapped (Bottom Sheet):**

- Summary
- Required Notes input (mandatory if rejecting)
- Two buttons equal width: TOLAK (Red), SETUJUI (Green)

### 7️⃣ PROFILE

**Header:**

- Large circular avatar, Full name, Division name

**Digital Signature Section:**

- Elegant container. Show image if exists, or show placeholder message if empty.

**Menu & Button:**

- Change Password, Settings, Other options
- Logout button: Bottom, Clear separation, Safe touch spacing

---

## ✨ MICRO-INTERACTIONS REQUIRED

Add subtle animation (No over-animation):

- Tab switch fade
- Card tap scale effect
- Button press elevation animation
- Smooth bottom sheet slide
- Input focus border highlight
- Pull-to-refresh animation

---

## 📦 OUTPUT FORMAT

Generate:

- High fidelity mobile UI layout description
- Component-level design breakdown
- Responsive behavior explanation
- Suggested spacing system
- Color token structure
- Reusable component system
- Flutter-friendly layout structure

> **Do NOT generate backend logic. Do NOT modify feature flow. Focus purely on UI/UX redesign.**
