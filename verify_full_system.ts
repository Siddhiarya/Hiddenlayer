import http from 'http';

const FRONTEND_PORT = 3000;
const BACKEND_PORT = 5000;

interface TestResult {
  title: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

const request = async (
  port: number,
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; data: any; headers: any }> => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (body) {
      headers['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port,
        path,
        method,
        headers
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => {
          resData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = resData ? JSON.parse(resData) : {};
            resolve({ status: res.statusCode || 500, data: parsed, headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode || 500, data: resData, headers: res.headers });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(postData);
    }
    req.end();
  });
};

const assertTest = (title: string, condition: boolean, errorMsg?: string) => {
  if (condition) {
    console.log(`  ✅ PASS: ${title}`);
    results.push({ title, passed: true });
  } else {
    console.error(`  ❌ FAIL: ${title} -> ${errorMsg || 'Condition not met'}`);
    results.push({ title, passed: false, error: errorMsg });
  }
};

const runComprehensiveVerification = async () => {
  console.log('================================================================');
  console.log('🔍 DAYFLOW HRMS - EMPLOYEE MODULE FULL VERIFICATION SUITE');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // SECTION 1: FRONTEND & PROXY INTEGRITY
    // -------------------------------------------------------------
    console.log('--- SECTION 1: FRONTEND & PROXY SERVER CHECKS ---');
    const frontendHome = await request(FRONTEND_PORT, 'GET', '/');
    assertTest(
      '1.1 Vite Frontend Dev Server returns 200 and loads HTML',
      frontendHome.status === 200 && typeof frontendHome.data === 'string' && frontendHome.data.includes('Dayflow HRMS')
    );

    const proxiedHealth = await request(FRONTEND_PORT, 'GET', '/api/health');
    assertTest(
      '1.2 Vite /api Proxy routes successfully to Backend API (Port 5000)',
      proxiedHealth.status === 200 && proxiedHealth.data.status === 'healthy'
    );

    // -------------------------------------------------------------
    // SECTION 2: AUTHENTICATION FLOW & FORM VALIDATION
    // -------------------------------------------------------------
    console.log('\n--- SECTION 2: AUTHENTICATION & FORM VALIDATION ---');
    
    // Invalid email / password
    const badLogin = await request(BACKEND_PORT, 'POST', '/api/auth/login', {
      email: 'alex.rivera@dayflow.corp',
      password: 'wrong_password_xyz'
    });
    assertTest(
      '2.1 Reject invalid login password with 401',
      badLogin.status === 401 && badLogin.data.success === false
    );

    const nonExistentLogin = await request(BACKEND_PORT, 'POST', '/api/auth/login', {
      email: 'nonexistent@dayflow.corp',
      password: 'password123'
    });
    assertTest(
      '2.2 Reject non-existent employee with 401',
      nonExistentLogin.status === 401 && nonExistentLogin.data.success === false
    );

    // Valid login as Alex Rivera (EMP-1001)
    const alexLogin = await request(BACKEND_PORT, 'POST', '/api/auth/login', {
      email: 'alex.rivera@dayflow.corp',
      password: 'password123'
    });
    assertTest(
      '2.3 Login Alex Rivera (EMP-1001) -> Returns JWT and profile',
      alexLogin.status === 200 && !!alexLogin.data.token && alexLogin.data.user.employeeId === 'EMP-1001'
    );
    const alexToken = alexLogin.data.token;

    // Valid login as Sarah Jenkins (EMP-1002) for isolation testing
    const sarahLogin = await request(BACKEND_PORT, 'POST', '/api/auth/login', {
      email: 'sarah.jenkins@dayflow.corp',
      password: 'password123'
    });
    assertTest(
      '2.4 Login Sarah Jenkins (EMP-1002) -> Returns JWT',
      sarahLogin.status === 200 && !!sarahLogin.data.token && sarahLogin.data.user.employeeId === 'EMP-1002'
    );
    const sarahToken = sarahLogin.data.token;

    // Verify /api/auth/me session
    const meRes = await request(BACKEND_PORT, 'GET', '/api/auth/me', undefined, alexToken);
    assertTest(
      '2.5 Auth session verification (/api/auth/me) returns valid employee session',
      meRes.status === 200 && meRes.data.user.email === 'alex.rivera@dayflow.corp'
    );

    // -------------------------------------------------------------
    // SECTION 3: EMPLOYEE PROFILE & RESTRICTED EDITING
    // -------------------------------------------------------------
    console.log('\n--- SECTION 3: EMPLOYEE PROFILE & EDIT FLOW ---');
    const profileRes = await request(BACKEND_PORT, 'GET', '/api/employee/profile', undefined, alexToken);
    assertTest(
      '3.1 Retrieve full employee profile (personal, job, salary, documents)',
      profileRes.status === 200 &&
      profileRes.data.data.name === 'Alex Rivera' &&
      profileRes.data.data.department === 'Engineering' &&
      !!profileRes.data.data.salary &&
      Array.isArray(profileRes.data.data.documents)
    );

    // Edit Phone number and Address
    const updatedPhone = '+1 (555) 444-9988';
    const updatedAddress = '888 Brannan St, Suite 500, San Francisco, CA 94103';
    const updatedAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';

    const editRes = await request(BACKEND_PORT, 'PUT', '/api/employee/profile', {
      phone: updatedPhone,
      address: updatedAddress,
      profilePicture: updatedAvatar
    }, alexToken);

    assertTest(
      '3.2 Edit employee phone, address, and profile picture',
      editRes.status === 200 &&
      editRes.data.data.phone === updatedPhone &&
      editRes.data.data.address === updatedAddress &&
      editRes.data.data.profilePicture === updatedAvatar
    );

    // Validation: Attempt to submit too short phone
    const badPhoneRes = await request(BACKEND_PORT, 'PUT', '/api/employee/profile', {
      phone: '123'
    }, alexToken);
    assertTest(
      '3.3 Validation: Reject invalid phone number (< 7 chars)',
      badPhoneRes.status === 400 && badPhoneRes.data.message.includes('valid phone number')
    );

    // Security check: Employee cannot alter salary, department, designation, or role via PUT /profile
    const maliciousEdit = await request(BACKEND_PORT, 'PUT', '/api/employee/profile', {
      department: 'Executive Board',
      designation: 'CEO & President',
      role: 'admin',
      salary: { basic: 999999, netSalary: 999999 }
    }, alexToken);
    // Profile controller strictly only reads phone, address, profilePicture, ignoring unauthorized fields
    const freshProfile = await request(BACKEND_PORT, 'GET', '/api/employee/profile', undefined, alexToken);
    assertTest(
      '3.4 Security: Admin-controlled fields (role, department, salary) are immutable by employee',
      freshProfile.data.data.role === 'employee' &&
      freshProfile.data.data.department === 'Engineering' &&
      freshProfile.data.data.salary.basic === 6500
    );

    // -------------------------------------------------------------
    // SECTION 4: ATTENDANCE MANAGEMENT & LIVE TIMER
    // -------------------------------------------------------------
    console.log('\n--- SECTION 4: ATTENDANCE MANAGEMENT & LIVE TIMER ---');
    
    // Step 4.0: Pre-check: Ensure today is not checked in initially
    const preAtt = await request(BACKEND_PORT, 'GET', '/api/employee/attendance', undefined, alexToken);
    // If a previous test left a record, clean it
    if (preAtt.data.data.today) {
      await request(BACKEND_PORT, 'DELETE', `/api/employee/attendance/today`, undefined, alexToken);
    }

    // Step 4.1: Perform Check-In
    const checkInRes = await request(BACKEND_PORT, 'POST', '/api/employee/attendance/check-in', undefined, alexToken);
    assertTest(
      '4.1 Check-In creates record with valid timestamp and NULL check-out',
      checkInRes.status === 200 &&
      !!checkInRes.data.data.checkIn &&
      !checkInRes.data.data.checkOut &&
      checkInRes.data.data.status === 'Present'
    );

    // Step 4.2: Verify Currently Working State (Check-out is empty, not Half-day or Completed)
    const midAtt = await request(BACKEND_PORT, 'GET', '/api/employee/attendance', undefined, alexToken);
    assertTest(
      '4.2 After Check-In: Employee is Currently Working (checkOut is null, status is Present)',
      midAtt.status === 200 &&
      !!midAtt.data.data.today?.checkIn &&
      !midAtt.data.data.today?.checkOut &&
      midAtt.data.data.today?.status === 'Present'
    );

    // Step 4.3: Prevent Duplicate Check-In on same day
    const duplicateCheckIn = await request(BACKEND_PORT, 'POST', '/api/employee/attendance/check-in', undefined, alexToken);
    assertTest(
      '4.3 Duplicate Check-In for same date is strictly blocked with 400',
      duplicateCheckIn.status === 400 && duplicateCheckIn.data.message.includes('already recorded')
    );

    // Step 4.4: Perform Check-Out
    const checkOutRes = await request(BACKEND_PORT, 'POST', '/api/employee/attendance/check-out', undefined, alexToken);
    assertTest(
      '4.4 Check-Out records timestamp and computes working hours',
      checkOutRes.status === 200 &&
      !!checkOutRes.data.data.checkOut &&
      typeof checkOutRes.data.data.workingHours === 'number'
    );

    // Step 4.5: Prevent Duplicate Check-Out
    const duplicateCheckOut = await request(BACKEND_PORT, 'POST', '/api/employee/attendance/check-out', undefined, alexToken);
    assertTest(
      '4.5 Duplicate Check-Out on same date is strictly blocked with 400',
      duplicateCheckOut.status === 400 && duplicateCheckOut.data.message.includes('Already checked out')
    );

    // Step 4.6: Daily Attendance History retrieves records with dates, times, and statuses
    const attendanceHistory = await request(BACKEND_PORT, 'GET', '/api/employee/attendance', undefined, alexToken);
    assertTest(
      '4.6 Daily Attendance History retrieves records with dates, times, and statuses',
      attendanceHistory.status === 200 &&
      Array.isArray(attendanceHistory.data.data.records) &&
      attendanceHistory.data.data.records.length >= 10
    );

    // Step 4.7: Weekly summary
    const weeklySummary = await request(BACKEND_PORT, 'GET', '/api/employee/attendance/weekly', undefined, alexToken);
    assertTest(
      '4.7 Weekly Attendance Summary computes total days, present days, and work hours',
      weeklySummary.status === 200 &&
      typeof weeklySummary.data.data.presentDays === 'number' &&
      typeof weeklySummary.data.data.totalWorkingHours === 'number'
    );

    // -------------------------------------------------------------
    // SECTION 5: LEAVE MANAGEMENT & OVERLAP PREVENTIONS
    // -------------------------------------------------------------
    console.log('\n--- SECTION 5: LEAVE MANAGEMENT FLOW ---');
    
    // Get leave balance & history
    const initialLeaves = await request(BACKEND_PORT, 'GET', '/api/employee/leaves', undefined, alexToken);
    assertTest(
      '5.1 Leave balance quotas (Paid, Sick, Unpaid) and history retrieved',
      initialLeaves.status === 200 &&
      initialLeaves.data.data.balance.paidLeave.total === 20 &&
      Array.isArray(initialLeaves.data.data.leaves)
    );

    // Validation: Start Date > End Date
    const invalidDateRange = await request(BACKEND_PORT, 'POST', '/api/employee/leaves', {
      leaveType: 'Paid Leave',
      startDate: '2026-12-25',
      endDate: '2026-12-20', // Invalid: end before start
      remarks: 'Christmas holiday'
    }, alexToken);
    assertTest(
      '5.2 Validation: Reject start date greater than end date',
      invalidDateRange.status === 400 && invalidDateRange.data.message.includes('Start date cannot be after')
    );

    // Validation: Missing remarks
    const missingRemarks = await request(BACKEND_PORT, 'POST', '/api/employee/leaves', {
      leaveType: 'Sick Leave',
      startDate: '2026-12-01',
      endDate: '2026-12-02',
      remarks: 'ab' // Too short (< 5 chars)
    }, alexToken);
    assertTest(
      '5.3 Validation: Reject leave request with insufficient remarks',
      missingRemarks.status === 400 && missingRemarks.data.message.includes('clear reason')
    );

    // Submit 1: Paid Leave with dynamic future date
    const randomOffset = Math.floor(Math.random() * 500) + 100;
    const paidStart = new Date();
    paidStart.setDate(paidStart.getDate() + randomOffset);
    const paidEnd = new Date(paidStart);
    paidEnd.setDate(paidEnd.getDate() + 4);
    const paidStartStr = paidStart.toISOString().split('T')[0];
    const paidEndStr = paidEnd.toISOString().split('T')[0];

    const paidLeaveRes = await request(BACKEND_PORT, 'POST', '/api/employee/leaves', {
      leaveType: 'Paid Leave',
      startDate: paidStartStr,
      endDate: paidEndStr,
      remarks: 'End of year family vacation.'
    }, alexToken);
    assertTest(
      '5.4 Apply Paid Leave -> Creates new Pending leave request',
      paidLeaveRes.status === 201 &&
      paidLeaveRes.data.data.leaveType === 'Paid Leave' &&
      paidLeaveRes.data.data.status === 'Pending' &&
      typeof paidLeaveRes.data.data.numberOfDays === 'number'
    );

    // Submit 2: Duplicate Overlapping Leave Prevention (overlaps with paidStart)
    const overlapLeaveRes = await request(BACKEND_PORT, 'POST', '/api/employee/leaves', {
      leaveType: 'Paid Leave',
      startDate: paidStartStr,
      endDate: paidEndStr,
      remarks: 'Overlapping request test'
    }, alexToken);
    assertTest(
      '5.5 Overlap Guard: Reject leave that overlaps with existing pending/approved leave',
      overlapLeaveRes.status === 400 && overlapLeaveRes.data.message.includes('overlapping')
    );

    // Submit 3: Sick Leave
    const sickStart = new Date();
    sickStart.setDate(sickStart.getDate() + randomOffset + 20);
    const sickStartStr = sickStart.toISOString().split('T')[0];

    const sickLeaveRes = await request(BACKEND_PORT, 'POST', '/api/employee/leaves', {
      leaveType: 'Sick Leave',
      startDate: sickStartStr,
      endDate: sickStartStr,
      remarks: 'Doctor follow-up checkup.'
    }, alexToken);
    assertTest(
      '5.6 Apply Sick Leave -> Created successfully with Pending status',
      sickLeaveRes.status === 201 && sickLeaveRes.data.data.leaveType === 'Sick Leave'
    );

    // Submit 4: Unpaid Leave
    const unpaidStart = new Date();
    unpaidStart.setDate(unpaidStart.getDate() + randomOffset + 40);
    const unpaidEnd = new Date(unpaidStart);
    unpaidEnd.setDate(unpaidEnd.getDate() + 2);
    const unpaidStartStr = unpaidStart.toISOString().split('T')[0];
    const unpaidEndStr = unpaidEnd.toISOString().split('T')[0];

    const unpaidLeaveRes = await request(BACKEND_PORT, 'POST', '/api/employee/leaves', {
      leaveType: 'Unpaid Leave',
      startDate: unpaidStartStr,
      endDate: unpaidEndStr,
      remarks: 'Personal urgent relocation.'
    }, alexToken);
    assertTest(
      '5.7 Apply Unpaid Leave -> Created successfully with Pending status',
      unpaidLeaveRes.status === 201 && unpaidLeaveRes.data.data.leaveType === 'Unpaid Leave'
    );

    // Verify Pending / Approved / Rejected status badges exist in leave history
    const finalLeaves = await request(BACKEND_PORT, 'GET', '/api/employee/leaves', undefined, alexToken);
    const statuses = finalLeaves.data.data.leaves.map((l: any) => l.status);
    assertTest(
      '5.8 Leave history displays Approved, Pending, and Rejected statuses',
      statuses.includes('Approved') && statuses.includes('Pending') && statuses.includes('Rejected')
    );

    // Cleanup: Reset today's attendance so user starts fresh in the browser
    await request(BACKEND_PORT, 'DELETE', '/api/employee/attendance/today', undefined, alexToken);

    // -------------------------------------------------------------
    // SECTION 6: PAYROLL & SALARY (READ-ONLY)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 6: PAYROLL & SALARY (READ-ONLY) ---');
    const payrollRes = await request(BACKEND_PORT, 'GET', '/api/employee/payroll', undefined, alexToken);
    assertTest(
      '6.1 Read-Only Payroll returns salary breakdown (Basic, HRA, Medical, PF, Tax, Net)',
      payrollRes.status === 200 &&
      payrollRes.data.data.salaryStructure.basic === 6500 &&
      payrollRes.data.data.salaryStructure.netSalary === 7800 &&
      Array.isArray(payrollRes.data.data.payrolls)
    );

    assertTest(
      '6.2 Historical monthly payslips contain itemized allowances and deductions',
      payrollRes.data.data.payrolls.length > 0 &&
      !!payrollRes.data.data.payrolls[0].allowances &&
      !!payrollRes.data.data.payrolls[0].deductions &&
      !!payrollRes.data.data.payrolls[0].bankAccount
    );

    // -------------------------------------------------------------
    // SECTION 7: TENANT & DATA ISOLATION
    // -------------------------------------------------------------
    console.log('\n--- SECTION 7: MULTI-EMPLOYEE DATA ISOLATION ---');
    // Verify Sarah Jenkins cannot see Alex Rivera's profile
    const sarahProfile = await request(BACKEND_PORT, 'GET', '/api/employee/profile', undefined, sarahToken);
    assertTest(
      '7.1 Sarah Jenkins receives her own profile (EMP-1002), not Alex Rivera\'s (EMP-1001)',
      sarahProfile.data.data.employeeId === 'EMP-1002' && sarahProfile.data.data.name === 'Sarah Jenkins'
    );

    // Verify Sarah Jenkins cannot see Alex Rivera's leave requests
    const sarahLeaves = await request(BACKEND_PORT, 'GET', '/api/employee/leaves', undefined, sarahToken);
    const sarahLeaveEmployeeIds = sarahLeaves.data.data.leaves.map((l: any) => l.employeeId);
    assertTest(
      '7.2 Sarah Jenkins\'s leave history contains ONLY records for EMP-1002',
      sarahLeaveEmployeeIds.every((id: string) => id === 'EMP-1002')
    );

    // Verify Sarah Jenkins cannot see Alex Rivera's payroll
    const sarahPayroll = await request(BACKEND_PORT, 'GET', '/api/employee/payroll', undefined, sarahToken);
    assertTest(
      '7.3 Sarah Jenkins receives her own salary structure ($8,400 net), isolated from Alex ($7,800 net)',
      sarahPayroll.data.data.salaryStructure.netSalary === 8400
    );

  } catch (err: any) {
    console.error('CRITICAL UNHANDLED ERROR DURING TEST SUITE:', err);
    results.push({ title: 'Suite Execution', passed: false, error: err.message });
  }

  console.log('\n================================================================');
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;
  console.log(`VERIFICATION SUMMARY: ${passedCount}/${total} PASSED (${failedCount} FAILED)`);
  console.log('================================================================\n');

  process.exit(failedCount > 0 ? 1 : 0);
};

runComprehensiveVerification();
