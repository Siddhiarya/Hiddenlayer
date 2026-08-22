# Dayflow – Human Resource Management System (HRMS)
> *Every workday, perfectly aligned.*

Dayflow HRMS is a fullstack Human Resource Management System built for modern distributed workforces. This repository contains the complete, production-ready **Employee Module**, featuring profile management, check-in/out attendance tracking, leave requests, and payroll visibility.

---

## Quick Start

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Run the Fullstack Application
In two separate terminal windows:

**Terminal 1 (Backend API - Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend Client - Port 3000):**
```bash
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Demo Employee Accounts

| Employee Name | Employee ID | Email | Password | Role | Department |
|---|---|---|---|---|---|
| **Alex Rivera** | `EMP-1001` | `alex.rivera@dayflow.corp` | `password123` | Employee | Engineering |
| **Sarah Jenkins** | `EMP-1002` | `sarah.jenkins@dayflow.corp` | `password123` | Employee | Product Design |
| **Marcus Chen** | `EMP-1003` | `marcus.chen@dayflow.corp` | `password123` | HR Manager | Human Resources |

*Tip: The login page contains 1-click quick login buttons for instant demo access.*

---

## Features Implemented (Employee Module)

### 1. Employee Dashboard (`/employee/dashboard`)
- Real-time **Check-In / Check-Out Widget** with live workday timer.
- Quick navigation cards for Profile, Attendance, Leaves, Payroll, and Logout.
- Today's shift status indicators (Present, Half-day, Not Checked In).
- Remaining annual and sick leave balances.
- Latest leave request status alert and manager notes.

### 2. Employee Profile (`/employee/profile`)
- **Personal Details:** ID, Name, Email, Phone, Address, Avatar.
- **Job Details:** Department, Designation, Joining Date, Employment Type, Manager.
- **Salary Summary:** Basic, Allowances, Deductions, Net Pay.
- **Documents Gallery:** Downloadable official employment agreements and IDs.

### 3. Edit Profile Modal
- **Employee-Editable Fields:** Phone Number, Residential Address, Profile Photo.
- **Locked/Admin-Only Fields:** Employee ID, Department, Designation, Salary, Role.
- Real-time form validation, error handling, and persistent updates.

### 4. Attendance Management (`/employee/attendance`)
- **Check-In:** Records date and timestamp, prevents multiple check-ins on same day, confetti animation.
- **Check-Out:** Computes working duration and updates status.
- **Weekly Summary Metrics:** Total working days, Present, Absent, Half-days, Leaves, Total Hours.
- **Daily Attendance Log:** Filterable by status and searchable by date.

### 5. Leave & Time-Off Management (`/employee/leaves`)
- **Apply for Leave:** Paid, Sick, and Unpaid leave options with working days calculator.
- **Overlap Prevention:** Prevents duplicate/overlapping leave applications.
- **Leave History Table:** Tracks Pending, Approved, and Rejected statuses with HR feedback.

### 6. Payroll & Salary Statements (`/employee/payroll`)
- **Read-Only Portal:** Itemized breakdown of allowances (HRA, Special, Medical) and deductions (PF, Tax, Insurance).
- **Printable Salary Slip:** Official Dayflow HRMS payslip modal with print/PDF support.

---

## Integration Handbook
For teammates working on Admin/HR, Backend, or Database modules, refer to **[`INTEGRATION.md`](./INTEGRATION.md)** for API contracts and data schemas.
