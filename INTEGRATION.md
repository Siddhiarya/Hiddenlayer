# Dayflow HRMS – Employee Module Integration Guide

**"Every workday, perfectly aligned."**

This document serves as the master technical specification and integration handbook for the **Employee Module** in the **Dayflow – Human Resource Management System (HRMS)** hackathon project.

---

## 1. Architectural Overview

The Employee Module follows a decoupled architecture designed for frictionless integration with teammate modules (Admin / HR Portal, Authentication service, Relational/NoSQL Database).

```
┌─────────────────────────────────────────────────────────────┐
│                 Dayflow HRMS Frontend (React)               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Employee Module Pages:                              │  │
│  │   - Dashboard (/employee/dashboard)                   │  │
│  │   - Profile & Edit (/employee/profile)                │  │
│  │   - Attendance Hub (/employee/attendance)             │  │
│  │   - Leaves / Time-Off (/employee/leaves)              │  │
│  │   - Payroll & Payslips (/employee/payroll)            │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │ API Service Client            │
│                             ▼                               │
│                    /api/employee/*                          │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP / REST / JWT
┌─────────────────────────────▼───────────────────────────────┐
│               Dayflow HRMS Backend (Express / TS)           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Auth & Ownership Middleware (JWT + Role Validator)   │  │
│  │  Employee Controller & Business Rules                 │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │ Data Access Layer             │
│                             ▼                               │
│                     Database Store                          │
│     (Employees, Attendance, LeaveRequests, Payroll)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. API Specifications & Contracts

All endpoints under `/api/employee` require a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```

### 2.1 Profile Endpoints

#### `GET /api/employee/profile`
- **Description:** Returns the logged-in employee's complete profile, job details, compensation summary, and documents.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "emp_01",
    "employeeId": "EMP-1001",
    "name": "Alex Rivera",
    "email": "alex.rivera@dayflow.corp",
    "phone": "+1 (555) 234-5678",
    "address": "742 Evergreen Terrace, Suite 402, San Francisco, CA 94107",
    "profilePicture": "https://...",
    "department": "Engineering",
    "designation": "Senior Frontend Engineer",
    "joiningDate": "2023-03-15",
    "role": "employee",
    "status": "Active",
    "manager": "David Vance (Director of Engineering)",
    "salary": {
      "basic": 6500,
      "allowances": { "hra": 1800, "special": 950, "medical": 450, "conveyance": 300, "total": 3500 },
      "deductions": { "pf": 780, "tax": 1120, "insurance": 250, "other": 50, "total": 2200 },
      "netSalary": 7800
    },
    "documents": [
      {
        "id": "doc_1",
        "employeeId": "EMP-1001",
        "name": "Employment_Agreement.pdf",
        "type": "Contract",
        "uploadDate": "2023-03-15",
        "fileUrl": "https://...",
        "size": "1.8 MB"
      }
    ]
  }
}
```

#### `PUT /api/employee/profile`
- **Description:** Updates non-admin fields. **Only `phone`, `address`, and `profilePicture` are modifiable.** Any attempts by employees to mutate salary, department, designation, or role are rejected.
- **Request Body:**
```json
{
  "phone": "+1 (555) 999-8888",
  "address": "456 Market Street, Apt 8A, San Francisco, CA 94105",
  "profilePicture": "https://images.unsplash.com/photo-..."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": { ...updatedEmployee }
}
```

---

### 2.2 Attendance Endpoints

#### `POST /api/employee/attendance/check-in`
- **Description:** Records check-in timestamp for the current calendar date for the authenticated employee. Prevents multiple check-ins on the same day.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Checked in successfully. Have a productive workday!",
  "data": {
    "id": "att_2026-08-22_EMP-1001",
    "employeeId": "EMP-1001",
    "date": "2026-08-22",
    "checkIn": "2026-08-22T09:05:00.000Z",
    "status": "Present"
  }
}
```

#### `POST /api/employee/attendance/check-out`
- **Description:** Records check-out timestamp and computes total `workingHours`.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Checked out successfully! Total working hours: 8.5 hrs.",
  "data": {
    "id": "att_2026-08-22_EMP-1001",
    "employeeId": "EMP-1001",
    "date": "2026-08-22",
    "checkIn": "2026-08-22T09:05:00.000Z",
    "checkOut": "2026-08-22T17:35:00.000Z",
    "workingHours": 8.5,
    "status": "Present"
  }
}
```

#### `GET /api/employee/attendance`
- **Description:** Fetches all historical attendance records for the authenticated employee plus today's active session.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "records": [ ...attendanceList ],
    "today": { ...todayAttendanceOrNull }
  }
}
```

#### `GET /api/employee/attendance/weekly`
- **Description:** Summarizes attendance metrics for the current Monday–Sunday period.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "weekStart": "2026-08-17",
    "weekEnd": "2026-08-23",
    "totalWorkingDays": 5,
    "presentDays": 4,
    "absentDays": 0,
    "halfDays": 1,
    "leaveDays": 0,
    "totalWorkingHours": 36.5
  }
}
```

---

### 2.3 Leave & Time-Off Endpoints

#### `GET /api/employee/leaves`
- **Description:** Returns the employee's leave balance allowances and past leave requests.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leaves": [
      {
        "id": "leave_101",
        "employeeId": "EMP-1001",
        "employeeName": "Alex Rivera",
        "leaveType": "Paid Leave",
        "startDate": "2026-08-10",
        "endDate": "2026-08-12",
        "numberOfDays": 3,
        "remarks": "Family vacation.",
        "status": "Approved",
        "adminComment": "Approved by HR.",
        "createdAt": "2026-08-01T10:30:00.000Z"
      }
    ],
    "balance": {
      "employeeId": "EMP-1001",
      "paidLeave": { "total": 20, "used": 4, "remaining": 16 },
      "sickLeave": { "total": 10, "used": 2, "remaining": 8 },
      "unpaidLeave": { "used": 0 }
    }
  }
}
```

#### `POST /api/employee/leaves`
- **Description:** Submits a new leave request. Default status is `Pending`. Validates date ranges and overlaps.
- **Request Body:**
```json
{
  "leaveType": "Paid Leave",
  "startDate": "2026-09-02",
  "endDate": "2026-09-04",
  "remarks": "Attending annual developer conference."
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Leave application submitted successfully. Pending HR/Admin review.",
  "data": {
    "id": "leave_1724300000000",
    "employeeId": "EMP-1001",
    "employeeName": "Alex Rivera",
    "leaveType": "Paid Leave",
    "startDate": "2026-09-02",
    "endDate": "2026-09-04",
    "numberOfDays": 3,
    "remarks": "Attending annual developer conference.",
    "status": "Pending",
    "createdAt": "2026-08-22T10:30:00.000Z"
  }
}
```

---

### 2.4 Payroll & Compensation Endpoints

#### `GET /api/employee/payroll`
- **Description:** Returns the employee's read-only salary structure and list of historical monthly payslips.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "salaryStructure": { ...breakdown },
    "payrolls": [
      {
        "id": "pay_2026_07",
        "employeeId": "EMP-1001",
        "employeeName": "Alex Rivera",
        "department": "Engineering",
        "designation": "Senior Frontend Engineer",
        "payPeriod": "July 2026",
        "paymentDate": "2026-07-31",
        "basicSalary": 6500,
        "allowances": { "hra": 1800, "special": 950, "medical": 450, "conveyance": 300, "total": 3500 },
        "deductions": { "pf": 780, "tax": 1120, "insurance": 250, "other": 50, "total": 2200 },
        "grossSalary": 10000,
        "netSalary": 7800,
        "paymentStatus": "Paid",
        "bankAccount": "•••• •••• •••• 4912 (Silicon Valley Bank)",
        "taxNumber": "US-TAX-8921-987"
      }
    ]
  }
}
```

---

## 3. Database Schema Recommendations (for Database Teammate)

If migrating to PostgreSQL / MySQL / MongoDB, use these schema structures:

### `employees` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Unique UUID or internal ID |
| `employee_id` | VARCHAR(32) | UNIQUE, NOT NULL, INDEX | e.g. `EMP-1001` |
| `name` | VARCHAR(128) | NOT NULL | Full Name |
| `email` | VARCHAR(128) | UNIQUE, NOT NULL | Work email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed string |
| `phone` | VARCHAR(32) | NULL | Employee contact number |
| `address` | TEXT | NULL | Residential address |
| `profile_picture`| TEXT | NULL | Avatar URL / image path |
| `department` | VARCHAR(64) | NOT NULL | e.g. Engineering |
| `designation` | VARCHAR(64) | NOT NULL | e.g. Senior Frontend Engineer |
| `joining_date` | DATE | NOT NULL | YYYY-MM-DD |
| `role` | VARCHAR(20) | NOT NULL | `employee`, `admin`, `hr` |
| `status` | VARCHAR(20) | DEFAULT 'Active' | `Active`, `Inactive`, `On Leave` |
| `manager` | VARCHAR(128) | NULL | Name/ID of reporting supervisor |

### `attendance` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | e.g. `att_YYYY-MM-DD_EMP-1001` |
| `employee_id` | VARCHAR(32) | FK to employees, INDEX | Associated employee |
| `date` | DATE | NOT NULL, INDEX | Attendance date |
| `check_in` | TIMESTAMP | NOT NULL | ISO Check-in timestamp |
| `check_out` | TIMESTAMP | NULL | ISO Check-out timestamp |
| `working_hours` | DECIMAL(4,2)| DEFAULT 0 | Computed duration |
| `status` | VARCHAR(20) | NOT NULL | `Present`, `Absent`, `Half-day`, `Leave` |
| `notes` | TEXT | NULL | Optional remarks |

### `leave_requests` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Unique ID |
| `employee_id` | VARCHAR(32) | FK to employees, INDEX | Requesting employee |
| `leave_type` | VARCHAR(32) | NOT NULL | `Paid Leave`, `Sick Leave`, `Unpaid Leave` |
| `start_date` | DATE | NOT NULL | First day of leave |
| `end_date` | DATE | NOT NULL | Last day of leave |
| `number_of_days`| INT | NOT NULL | Calculated working days |
| `remarks` | TEXT | NOT NULL | Reason provided by employee |
| `status` | VARCHAR(20) | DEFAULT 'Pending' | `Pending`, `Approved`, `Rejected` |
| `admin_comment` | TEXT | NULL | Feedback from HR/Admin |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |

### `payroll` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Slip ID (e.g. `pay_2026_07`) |
| `employee_id` | VARCHAR(32) | FK to employees, INDEX | Employee ID |
| `pay_period` | VARCHAR(32) | NOT NULL | e.g. "July 2026" |
| `payment_date` | DATE | NOT NULL | Payment execution date |
| `basic_salary` | DECIMAL(10,2)| NOT NULL | Base monthly salary |
| `allowances_json`| JSONB/JSON | NOT NULL | Breakdown of HRA, special, medical, total |
| `deductions_json`| JSONB/JSON | NOT NULL | Breakdown of PF, tax, insurance, total |
| `gross_salary` | DECIMAL(10,2)| NOT NULL | Total gross earnings |
| `net_salary` | DECIMAL(10,2)| NOT NULL | Net disbursed amount |
| `payment_status`| VARCHAR(20) | DEFAULT 'Paid' | `Paid`, `Processing`, `Pending` |
| `bank_account` | VARCHAR(64) | NOT NULL | Masked bank details |
| `tax_number` | VARCHAR(64) | NOT NULL | Tax identification number |

---

## 4. Integration Checklist for Teammates

### For the Backend Teammate:
1. Ensure the JWT middleware validates `Authorization: Bearer <token>` and signs payload with `{ employeeId, email, role, name }`.
2. Keep the endpoint paths identical (`/api/employee/...`) so no frontend changes are required.
3. If connecting to a central database (PostgreSQL/MongoDB), plug into the repository methods matching `backend/src/data/db.ts`.

### For the Frontend Teammate (Admin / HR Module):
1. Admin pages can use the same types located at `frontend/src/types/employee.ts`.
2. Admin leave approval can call `PUT /api/admin/leaves/:id/approve` or `reject` and set `adminComment`.
3. The design tokens in `frontend/tailwind.config.js` (`brand-500` to `brand-900` and `odoo-purple`) can be reused across all modules for a cohesive UI.

### For the Database Teammate:
1. Use the provided seed data structure in `backend/src/data/db.ts` to populate test fixtures.
2. Maintain unique compound index on `(employee_id, date)` for the `attendance` table.
