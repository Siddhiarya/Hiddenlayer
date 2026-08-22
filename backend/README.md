# Dayflow – Human Resource Management System (HRMS) Backend

Welcome to the **Dayflow HRMS** REST API backend. This backend powers employee onboarding, profile management, daily & weekly attendance tracking, time-off/leave management with approval workflows, payroll details & salary structures, in-app notification alerts, role-specific dashboards, and HR management reports.

---

## 🛠️ Tech Stack

- **Runtime & Framework**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) with token revocation
- **Password Security**: bcryptjs password hashing
- **Email Service**: Nodemailer (verification & password reset)
- **File Uploads**: Multer (profile picture / avatar uploads)
- **Security & Validation**: Helmet, CORS, Express-Validator, Express-Rate-Limit
- **Automated Testing**: Jest, Supertest, MongoDB Memory Server

---

## 📂 Project Architecture

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                   # MongoDB connection & lifecycle management
│   ├── controllers/
│   │   ├── authController.js       # Register, Login, Verify Email, Logout, Password Reset
│   │   ├── employeeController.js   # Employee Profile (me, all, edit, upload avatar)
│   │   ├── attendanceController.js # Check-in, Check-out, Daily/Weekly view, HR adjustment
│   │   ├── leaveController.js      # Apply leave, overlap checks, Approve/Reject workflow
│   │   ├── payrollController.js    # Salary structure, monthly payroll generation
│   │   ├── notificationController.js# User in-app notifications & read status
│   │   ├── dashboardController.js  # Aggregated metrics for Employee & HR/Admin
│   │   └── reportController.js     # Analytics & reports (Attendance, Leave, Payroll, HR)
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT validation & RevokedToken blacklist check
│   │   ├── roleMiddleware.js       # Role authorization (employee, hr, admin)
│   │   ├── errorMiddleware.js      # Global error & 404 handler
│   │   ├── validationMiddleware.js # Express-validator runner
│   │   └── uploadMiddleware.js     # Multer storage for avatar image uploads
│   ├── models/
│   │   ├── User.js                 # User & Employee model with indexes & methods
│   │   ├── Attendance.js           # Attendance model with working hours & unique index
│   │   ├── Leave.js                # Leave request model with approval audit trail
│   │   ├── Payroll.js              # Monthly payroll & salary breakdown
│   │   ├── Notification.js         # In-app notifications
│   │   └── RevokedToken.js         # JWT invalidation storage with MongoDB TTL index
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth/*
│   │   ├── employeeRoutes.js       # /api/employees/*
│   │   ├── attendanceRoutes.js     # /api/attendance/*
│   │   ├── leaveRoutes.js          # /api/leaves/*
│   │   ├── payrollRoutes.js        # /api/payroll/*
│   │   ├── notificationRoutes.js   # /api/notifications/*
│   │   ├── dashboardRoutes.js      # /api/dashboard/*
│   │   └── reportRoutes.js         # /api/reports/*
│   ├── services/
│   │   ├── emailService.js         # Nodemailer templates for verification & reset
│   │   └── notificationService.js  # Notifications dispatcher
│   ├── utils/
│   │   ├── generateToken.js        # JWT signing & crypto token generator
│   │   └── validators.js           # Request validation rules
│   ├── app.js                      # Express application setup
│   ├── seed.js                     # Safe Admin account seed script
│   └── server.js                   # Server bootstrap
├── tests/
│   └── api.test.js                 # Complete integration test suite
├── uploads/
│   └── avatars/                    # Uploaded user profile pictures
├── .env.example                    # Sample environment variables
├── .gitignore                      # Git ignore rules
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

1. **Node.js**: v18.x or higher
2. **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/dayflow_hrms`) OR a free [MongoDB Atlas Cluster](https://www.mongodb.com/atlas) URI (`mongodb+srv://...`)
3. **npm**: v9.x or higher

---

## 🚀 Quick Setup & Installation

### 1. Navigate to the backend folder
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Edit `.env` as needed:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=*

# MongoDB Connection String
MONGODB_URI=mongodb://127.0.0.1:27017/dayflow_hrms

# JWT Secret
JWT_SECRET=dayflow_hrms_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=7d

# Email / SMTP Configuration (Optional in local development - logs to console)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM="Dayflow HRMS" <no-reply@dayflow.com>

# Initial Seed Admin Account
ADMIN_EMAIL=admin@dayflow.com
ADMIN_PASSWORD=AdminPassword123!
ADMIN_EMPLOYEE_ID=ADM001
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Admin
```

### 4. Seed the Initial Admin Account
Run the seed script to create the master administrator account:
```bash
npm run seed
```

### 5. Start the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

### 6. Run Automated Tests
```bash
npm test
```

---

## 🔑 Frontend Integration Guide

### Authentication Header
Every authenticated request sent from the frontend must include the JWT token in the `Authorization` header:
```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```

### Base URL
All API routes are prefixed with `/api`:
```
http://localhost:5000/api
```

### Example Frontend Fetch Request:
```javascript
const token = localStorage.getItem('dayflow_token');

const response = await fetch('http://localhost:5000/api/dashboard/employee', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

---

## 📚 REST API Reference

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user (`employee` or `hr`) |
| `GET` | `/api/auth/verify-email/:token` | Public | Verify email address |
| `POST` | `/api/auth/resend-verification` | Public | Resend email verification token |
| `POST` | `/api/auth/login` | Public | Sign in with email and password |
| `POST` | `/api/auth/logout` | Private | Logout and blacklist current JWT |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset email |
| `POST` | `/api/auth/reset-password/:token` | Public | Reset password with token |

#### Register Example
```json
POST /api/auth/register
{
  "employeeId": "EMP001",
  "email": "employee@example.com",
  "password": "StrongPassword123!",
  "role": "employee",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login Example
```json
POST /api/auth/login
{
  "email": "employee@example.com",
  "password": "StrongPassword123!"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "66c7...",
      "employeeId": "EMP001",
      "email": "employee@example.com",
      "role": "employee",
      "firstName": "John",
      "lastName": "Doe",
      "jobTitle": "Team Member",
      "department": "Engineering"
    }
  }
}
```

---

### 2. Employee Profile (`/api/employees`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/employees/me` | Private | Get logged-in user profile |
| `PUT` | `/api/employees/me` | Private | Update own profile (address, phone, avatar) |
| `POST` | `/api/employees/me/avatar` | Private | Upload profile picture (`multipart/form-data`) |
| `GET` | `/api/employees` | HR, Admin | List all employees (search, filter, pagination) |
| `GET` | `/api/employees/:id` | Private (HR/Admin/Self) | Get employee by ID or employeeId |
| `PUT` | `/api/employees/:id` | HR, Admin | Update employee details / salary / status |
| `DELETE` | `/api/employees/:id` | Admin | Delete / deactivate employee |

---

### 3. Attendance Management (`/api/attendance`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/attendance/check-in` | Private | Check-in for today |
| `POST` | `/api/attendance/check-out` | Private | Check-out for today (auto calculates working hours) |
| `GET` | `/api/attendance/me` | Private | Get logged-in user attendance history |
| `GET` | `/api/attendance/me/weekly` | Private | Get current week attendance summary |
| `GET` | `/api/attendance` | HR, Admin | View all employees' attendance (date/dept filter) |
| `GET` | `/api/attendance/employee/:employeeId` | HR, Admin | View specific employee's attendance |
| `PUT` | `/api/attendance/:id` | HR, Admin | Manually adjust attendance record |

---

### 4. Leave / Time-Off Management (`/api/leaves`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/leaves` | Private | Apply for leave (`paid`, `sick`, `unpaid`) |
| `GET` | `/api/leaves/me` | Private | View own leave applications |
| `GET` | `/api/leaves/:id` | Private | View leave request details |
| `DELETE` | `/api/leaves/:id` | Private | Cancel pending leave request |
| `GET` | `/api/leaves` | HR, Admin | View all leave applications |
| `PUT` | `/api/leaves/:id/approve` | HR, Admin | Approve leave & auto-sync attendance |
| `PUT` | `/api/leaves/:id/reject` | HR, Admin | Reject leave request |

#### Apply Leave Example:
```json
POST /api/leaves
{
  "leaveType": "paid",
  "startDate": "2026-09-10",
  "endDate": "2026-09-12",
  "remarks": "Family vacation"
}
```

---

### 5. Payroll Management (`/api/payroll`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/payroll/me` | Private | View own salary structure & history |
| `GET` | `/api/payroll` | HR, Admin | View all employee payroll records |
| `GET` | `/api/payroll/employee/:employeeId` | HR, Admin | View specific employee payroll details |
| `PUT` | `/api/payroll/employee/:employeeId` | HR, Admin | Update employee salary structure |
| `POST` | `/api/payroll/generate` | HR, Admin | Generate monthly payroll records |

---

### 6. Notifications (`/api/notifications`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Private | Get user notifications & unread count |
| `PUT` | `/api/notifications/:id/read` | Private | Mark a single notification as read |
| `PUT` | `/api/notifications/read-all` | Private | Mark all notifications as read |

---

### 7. Dashboards (`/api/dashboard`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/employee` | Private | Employee home cards (today attendance, week hours, leaves, alerts) |
| `GET` | `/api/dashboard/admin` | HR, Admin | Management metrics (headcount, today attendance %, pending leaves, payroll total) |

---

### 8. Analytics & Reports (`/api/reports`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reports/attendance` | HR, Admin | Attendance trends & status breakdown |
| `GET` | `/api/reports/leave` | HR, Admin | Leave breakdown by type & approval status |
| `GET` | `/api/reports/payroll` | HR, Admin | Payroll expenses by department & period |
| `GET` | `/api/reports/employee-summary` | HR, Admin | Headcount, department & gender breakdown |

---

## 🔒 Security Best Practices Implemented

- **Password Hashing**: Salted bcrypt (10 rounds) with passwords never returned in responses (`select: false`).
- **Token Invalidation on Logout**: Real token invalidation backed by MongoDB TTL indexed `RevokedToken` collection.
- **Role-Based Access Control**: Strict role checking on all routes preventing horizontal and vertical privilege escalation.
- **Input Validation & Sanitization**: Comprehensive validation chains using `express-validator`.
- **Brute Force Protection**: IP rate limiting on all `/api/auth` endpoints.
- **HTTP Header Hardening**: Helmet integration with cross-origin policies.
- **Safe Admin Bootstrap**: Seed script creates admin only if not already present.
