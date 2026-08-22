const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

let employeeToken;
let employeeId;
let employeeUserId;
let hrToken;
let hrUserId;
let hrEmployeeId;
let adminToken;
let adminUserId;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_secret_key_dayflow_hrms_2026';
  process.env.JWT_EXPIRES_IN = '1d';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);

  // Require app after env vars are set
  app = require('../src/app');
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('=== Dayflow HRMS Backend Full Test Suite ===', () => {
  let empVerificationToken;
  let sampleLeaveId;
  let sampleNotificationId;

  // -------------------------------------------------------------
  // 1. AUTHENTICATION & SECURITY
  // -------------------------------------------------------------
  describe('1. Authentication Endpoints', () => {
    it('should register a new employee successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          employeeId: 'EMP001',
          email: 'john.doe@dayflow.com',
          password: 'Password123!',
          role: 'employee',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeId).toBe('EMP001');
      expect(res.body.data.emailVerified).toBe(false);
      expect(res.body.data.devVerificationToken).toBeDefined();

      empVerificationToken = res.body.data.devVerificationToken;
      employeeId = 'EMP001';
    });

    it('should reject registration with duplicate email or employeeId', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          employeeId: 'EMP001',
          email: 'another@dayflow.com',
          password: 'Password123!',
          role: 'employee',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject public registration with role admin', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          employeeId: 'ADM999',
          email: 'fakeadmin@dayflow.com',
          password: 'Password123!',
          role: 'admin',
        });

      expect([400, 403]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('should prevent login before email verification', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@dayflow.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.isVerified).toBe(false);
    });

    it('should verify email with valid token', async () => {
      const res = await request(app).get(`/api/auth/verify-email/${empVerificationToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject email verification with invalid token', async () => {
      const res = await request(app).get('/api/auth/verify-email/invalid_token_123');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should log in verified employee and return JWT and sanitized user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@dayflow.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('employee');
      expect(res.body.data.user.password).toBeUndefined();

      employeeToken = res.body.data.token;
      employeeUserId = res.body.data.user._id;
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@dayflow.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should register and verify an HR user', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          employeeId: 'HR001',
          email: 'sarah.hr@dayflow.com',
          password: 'Password123!',
          role: 'hr',
          firstName: 'Sarah',
          lastName: 'Smith',
        });

      expect(regRes.status).toBe(201);
      const token = regRes.body.data.devVerificationToken;

      await request(app).get(`/api/auth/verify-email/${token}`);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'sarah.hr@dayflow.com',
          password: 'Password123!',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.user.role).toBe('hr');

      hrToken = loginRes.body.data.token;
      hrUserId = loginRes.body.data.user._id;
      hrEmployeeId = 'HR001';
    });

    it('should handle forgot password and reset password flow', async () => {
      const forgotRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'john.doe@dayflow.com' });

      expect(forgotRes.status).toBe(200);
      const resetToken = forgotRes.body.devResetToken;
      expect(resetToken).toBeDefined();

      const resetRes = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.success).toBe(true);

      // Verify login with new password
      const newLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@dayflow.com',
          password: 'NewPassword123!',
        });

      expect(newLogin.status).toBe(200);
      employeeToken = newLogin.body.data.token;
    });

    it('should logout and invalidate token in RevokedToken collection', async () => {
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.message).toContain('Logout successful');

      // Subsequent request with the revoked token must fail with 401
      const meRes = await request(app)
        .get('/api/employees/me')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(meRes.status).toBe(401);
      expect(meRes.body.message).toContain('revoked');

      // Re-login to get fresh token for remaining tests
      const freshLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@dayflow.com',
          password: 'NewPassword123!',
        });

      employeeToken = freshLogin.body.data.token;
    });
  });

  // -------------------------------------------------------------
  // 2. EMPLOYEE PROFILE MANAGEMENT & RBAC
  // -------------------------------------------------------------
  describe('2. Employee Profile & RBAC', () => {
    it('should allow employee to get their own profile via /me', async () => {
      const res = await request(app)
        .get('/api/employees/me')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.employeeId).toBe('EMP001');
      expect(res.body.data.email).toBe('john.doe@dayflow.com');
    });

    it('should allow employee to update safe fields (phone, address)', async () => {
      const res = await request(app)
        .put('/api/employees/me')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          phone: '+1234567890',
          address: {
            street: '123 Tech Lane',
            city: 'San Francisco',
            state: 'CA',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.phone).toBe('+1234567890');
      expect(res.body.data.address.city).toBe('San Francisco');
    });

    it('should deny employee from accessing HR employee list /api/employees', async () => {
      const res = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow HR to access all employees list', async () => {
      const res = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.employees.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should allow HR to update employee details and salary structure', async () => {
      const res = await request(app)
        .put(`/api/employees/${employeeUserId}`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          jobTitle: 'Senior Software Engineer',
          department: 'Engineering',
          salaryStructure: {
            basicSalary: 70000,
            allowances: { hra: 20000, da: 10000, specialAllowance: 5000, other: 0 },
            deductions: { pf: 5000, tax: 10000, insurance: 2000, other: 0 },
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.jobTitle).toBe('Senior Software Engineer');
      expect(res.body.data.salaryStructure.grossSalary).toBe(105000);
      expect(res.body.data.salaryStructure.netSalary).toBe(88000);
    });
  });

  // -------------------------------------------------------------
  // 3. ATTENDANCE MANAGEMENT
  // -------------------------------------------------------------
  describe('3. Attendance Management', () => {
    const today = new Date().toISOString().split('T')[0];

    it('should allow employee check-in', async () => {
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          date: today,
          remarks: 'Morning check-in',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('present');
      expect(res.body.data.checkIn).toBeDefined();
    });

    it('should prevent multiple check-ins for the same day', async () => {
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          date: today,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already checked in');
    });

    it('should allow employee check-out and calculate working hours', async () => {
      const res = await request(app)
        .post('/api/attendance/check-out')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          date: today,
          remarks: 'End of day checkout',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.checkOut).toBeDefined();
      expect(typeof res.body.data.totalWorkingHours).toBe('number');
    });

    it('should allow employee to get their own attendance history', async () => {
      const res = await request(app)
        .get('/api/attendance/me')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.attendance.length).toBeGreaterThanOrEqual(1);
    });

    it('should allow employee to get their weekly attendance breakdown', async () => {
      const res = await request(app)
        .get('/api/attendance/me/weekly')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.weekStart).toBeDefined();
      expect(res.body.data.records).toBeDefined();
    });

    it('should allow HR to view all employees attendance with filtering', async () => {
      const res = await request(app)
        .get(`/api/attendance?date=${today}`)
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.attendance.length).toBeGreaterThanOrEqual(1);
    });
  });

  // -------------------------------------------------------------
  // 4. LEAVE / TIME-OFF MANAGEMENT
  // -------------------------------------------------------------
  describe('4. Leave Management', () => {
    it('should allow employee to apply for leave', async () => {
      const res = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'sick',
          startDate: '2026-09-01',
          endDate: '2026-09-03',
          remarks: 'Flu and doctor appointment',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.leaveType).toBe('sick');
      expect(res.body.data.numberOfDays).toBe(3);
      expect(res.body.data.status).toBe('pending');

      sampleLeaveId = res.body.data._id;
    });

    it('should reject overlapping leave request for same employee', async () => {
      const res = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'paid',
          startDate: '2026-09-02',
          endDate: '2026-09-04',
          remarks: 'Vacation',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('leave request from');
    });

    it('should reject leave if start date is after end date', async () => {
      const res = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'paid',
          startDate: '2026-09-10',
          endDate: '2026-09-05',
          remarks: 'Invalid dates',
        });

      expect(res.status).toBe(400);
    });

    it('should allow employee to view own leave requests', async () => {
      const res = await request(app)
        .get('/api/leaves/me')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.leaves.length).toBeGreaterThanOrEqual(1);
    });

    it('should allow HR to view all leave requests', async () => {
      const res = await request(app)
        .get('/api/leaves')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.leaves.length).toBeGreaterThanOrEqual(1);
    });

    it('should allow HR to approve leave request and automatically sync attendance', async () => {
      const res = await request(app)
        .put(`/api/leaves/${sampleLeaveId}/approve`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          adminComment: 'Approved by HR Manager Sarah',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('approved');
      expect(res.body.data.adminComment).toBe('Approved by HR Manager Sarah');

      // Verify that attendance records were created with status 'leave'
      const attCheck = await request(app)
        .get('/api/attendance?date=2026-09-01')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(attCheck.status).toBe(200);
      const leaveAtt = attCheck.body.data.attendance.find((a) => a.employeeId === 'EMP001');
      expect(leaveAtt).toBeDefined();
      expect(leaveAtt.status).toBe('leave');
    });
  });

  // -------------------------------------------------------------
  // 5. PAYROLL / SALARY MANAGEMENT
  // -------------------------------------------------------------
  describe('5. Payroll Management', () => {
    it('should allow employee to view their own payroll structure (read-only)', async () => {
      const res = await request(app)
        .get('/api/payroll/me')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.salaryStructure).toBeDefined();
      expect(res.body.data.currentSalary).toBe(88000);
    });

    it('should allow HR to update employee salary structure', async () => {
      const res = await request(app)
        .put('/api/payroll/employee/EMP001')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          basicSalary: 75000,
          allowances: { hra: 25000, da: 10000, specialAllowance: 5000, other: 0 },
          deductions: { pf: 6000, tax: 12000, insurance: 2000, other: 0 },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.salaryStructure.grossSalary).toBe(115000);
      expect(res.body.data.netSalary).toBe(95000);
    });

    it('should allow HR to generate monthly payroll records', async () => {
      const res = await request(app)
        .post('/api/payroll/generate')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          payPeriod: '2026-08',
          paymentStatus: 'processed',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should allow HR to get all payroll records for a pay period', async () => {
      const res = await request(app)
        .get('/api/payroll?payPeriod=2026-08')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.payrolls.length).toBeGreaterThanOrEqual(1);
    });
  });

  // -------------------------------------------------------------
  // 6. NOTIFICATIONS & INBOX
  // -------------------------------------------------------------
  describe('6. Notification System', () => {
    it('should get employee notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notifications.length).toBeGreaterThanOrEqual(1);
      sampleNotificationId = res.body.data.notifications[0]._id;
    });

    it('should mark a single notification as read', async () => {
      const res = await request(app)
        .put(`/api/notifications/${sampleNotificationId}/read`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isRead).toBe(true);
    });

    it('should mark all notifications as read', async () => {
      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 7. DASHBOARD AGGREGATIONS
  // -------------------------------------------------------------
  describe('7. Dashboard APIs', () => {
    it('should return personalized employee dashboard', async () => {
      const res = await request(app)
        .get('/api/dashboard/employee')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.profile).toBeDefined();
      expect(res.body.data.attendanceToday).toBeDefined();
      expect(res.body.data.weeklySummary).toBeDefined();
      expect(res.body.data.leaves).toBeDefined();
      expect(res.body.data.payroll).toBeDefined();
    });

    it('should deny employee from accessing admin dashboard', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
    });

    it('should return management admin dashboard for HR/Admin', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.employees).toBeDefined();
      expect(res.body.data.todayAttendance).toBeDefined();
      expect(res.body.data.leaves).toBeDefined();
      expect(res.body.data.payrollOverview).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // 8. REPORTS & ANALYTICS
  // -------------------------------------------------------------
  describe('8. Reports & Analytics APIs', () => {
    it('should return attendance report', async () => {
      const res = await request(app)
        .get('/api/reports/attendance')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.statusSummary).toBeDefined();
      expect(res.body.data.dailyTrend).toBeDefined();
    });

    it('should return leave report', async () => {
      const res = await request(app)
        .get('/api/reports/leave')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.byType).toBeDefined();
      expect(res.body.data.byStatus).toBeDefined();
    });

    it('should return payroll report', async () => {
      const res = await request(app)
        .get('/api/reports/payroll')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.payrollSummary).toBeDefined();
      expect(res.body.data.byStatus).toBeDefined();
    });

    it('should return employee summary report', async () => {
      const res = await request(app)
        .get('/api/reports/employee-summary')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalEmployees).toBeGreaterThanOrEqual(2);
      expect(res.body.data.departmentSummary).toBeDefined();
      expect(res.body.data.roleSummary).toBeDefined();
    });
  });
});
