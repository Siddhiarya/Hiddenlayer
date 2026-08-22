/**
 * Comprehensive API Integration Test Suite for Dayflow HRMS Backend
 */
import http from 'http';
import { db } from './data/db.js';

const PORT = 5000;
let token: string = '';

const request = async (
  method: string,
  path: string,
  body?: any,
  authToken?: string
): Promise<{ status: number; data: any }> => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    if (body) {
      headers['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
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
            resolve({ status: res.statusCode || 500, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode || 500, data: resData });
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

const runTests = async () => {
  console.log('🚀 Starting Dayflow HRMS API Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: string) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.status === 'healthy', '1. Server Health Check endpoint');

    // 2. Authentication - Invalid Credentials
    const badLogin = await request('POST', '/api/auth/login', {
      email: 'alex.rivera@dayflow.corp',
      password: 'wrongpassword'
    });
    assert(badLogin.status === 401 && badLogin.data.success === false, '2. Reject invalid login credentials');

    // 3. Authentication - Valid Login
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'alex.rivera@dayflow.corp',
      password: 'password123'
    });
    assert(
      loginRes.status === 200 && loginRes.data.success === true && !!loginRes.data.token,
      '3. Successful Login & JWT Token generation'
    );
    token = loginRes.data.token;

    // 4. Auth - Me Session
    const meRes = await request('GET', '/api/auth/me', undefined, token);
    assert(
      meRes.status === 200 && meRes.data.user.employeeId === 'EMP-1001',
      '4. Validate /api/auth/me returns authenticated employee'
    );

    // 5. Profile - Get Profile
    const profileRes = await request('GET', '/api/employee/profile', undefined, token);
    assert(
      profileRes.status === 200 && profileRes.data.data.name === 'Alex Rivera' && !!profileRes.data.data.salary,
      '5. GET /api/employee/profile returns full employee profile'
    );

    // 6. Profile - Update Allowed Fields
    const updateRes = await request('PUT', '/api/employee/profile', {
      phone: '+1 (555) 777-9999',
      address: '999 Silicon Vista Way, San Francisco, CA 94107'
    }, token);
    assert(
      updateRes.status === 200 && updateRes.data.data.phone === '+1 (555) 777-9999',
      '6. PUT /api/employee/profile updates phone and address'
    );

    // 7. Attendance - Check In
    // Ensure clean state before check-in test
    await request('DELETE', '/api/employee/attendance/today', undefined, token);
    const checkInRes = await request('POST', '/api/employee/attendance/check-in', undefined, token);
    assert(
      checkInRes.status === 200 && checkInRes.data.data.checkIn && !checkInRes.data.data.checkOut && checkInRes.data.data.status === 'Present',
      '7. POST /api/employee/attendance/check-in logs check-in with empty check-out and Present status'
    );

    // 7b. Attendance - Duplicate Check In Guard
    const dupCheckIn = await request('POST', '/api/employee/attendance/check-in', undefined, token);
    assert(
      dupCheckIn.status === 400 && dupCheckIn.data.message.includes('already recorded'),
      '7b. Prevent duplicate check-in on the same date'
    );

    // 8. Attendance - Check Out
    const checkOutRes = await request('POST', '/api/employee/attendance/check-out', undefined, token);
    assert(
      checkOutRes.status === 200 && !!checkOutRes.data.data.checkOut && typeof checkOutRes.data.data.workingHours === 'number',
      '8. POST /api/employee/attendance/check-out calculates duration and records check-out'
    );

    // 8b. Attendance - Duplicate Check Out Guard
    const dupCheckOut = await request('POST', '/api/employee/attendance/check-out', undefined, token);
    assert(
      dupCheckOut.status === 400 && dupCheckOut.data.message.includes('Already checked out'),
      '8b. Prevent duplicate check-out on the same date'
    );

    // 9. Attendance - Get Records
    const attListRes = await request('GET', '/api/employee/attendance', undefined, token);
    assert(
      attListRes.status === 200 && Array.isArray(attListRes.data.data.records) && attListRes.data.data.records.length > 0,
      '9. GET /api/employee/attendance returns historical records'
    );

    // 10. Attendance - Weekly Summary
    const weekRes = await request('GET', '/api/employee/attendance/weekly', undefined, token);
    assert(
      weekRes.status === 200 && weekRes.data.data.totalWorkingDays === 5 && typeof weekRes.data.data.presentDays === 'number',
      '10. GET /api/employee/attendance/weekly returns working summary metrics'
    );

    // 11. Leaves - Get Leaves and Balance
    const leavesRes = await request('GET', '/api/employee/leaves', undefined, token);
    assert(
      leavesRes.status === 200 && Array.isArray(leavesRes.data.data.leaves) && !!leavesRes.data.data.balance,
      '11. GET /api/employee/leaves returns leave list and quotas'
    );

    // 12. Leaves - Apply Invalid Date Range
    const badLeaveRes = await request('POST', '/api/employee/leaves', {
      leaveType: 'Paid Leave',
      startDate: '2026-10-10',
      endDate: '2026-10-05', // End before start
      remarks: 'Vacation'
    }, token);
    assert(
      badLeaveRes.status === 400 && badLeaveRes.data.message.includes('Start date cannot be after'),
      '12. POST /api/employee/leaves rejects invalid date ranges'
    );

    // 13. Leaves - Apply Valid Leave
    const randomOffsetDays = Math.floor(Math.random() * 200) + 60;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + randomOffsetDays);
    const startStr = futureDate.toISOString().split('T')[0];
    futureDate.setDate(futureDate.getDate() + 2);
    const endStr = futureDate.toISOString().split('T')[0];

    const validLeaveRes = await request('POST', '/api/employee/leaves', {
      leaveType: 'Sick Leave',
      startDate: startStr,
      endDate: endStr,
      remarks: 'Scheduled medical appointment and recovery.'
    }, token);
    assert(
      validLeaveRes.status === 201 && validLeaveRes.data.data.status === 'Pending',
      '13. POST /api/employee/leaves creates new Pending leave request'
    );

    // 14. Payroll - Get Payroll & Salary Statements (Read-Only)
    const payRes = await request('GET', '/api/employee/payroll', undefined, token);
    assert(
      payRes.status === 200 && !!payRes.data.data.salaryStructure && Array.isArray(payRes.data.data.payrolls),
      '14. GET /api/employee/payroll returns read-only salary structure and payslips'
    );

    // 15. Security - Reject Unauthenticated Access
    const unauthRes = await request('GET', '/api/employee/profile');
    assert(
      unauthRes.status === 401 && unauthRes.data.success === false,
      '15. Protected endpoints reject unauthenticated requests with 401'
    );

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    if (token) {
      await request('DELETE', '/api/employee/attendance/today', undefined, token);
    }
    console.log(`\n=============================================`);
    console.log(`Test Results: ${passed} passed, ${failed} failed.`);
    console.log(`=============================================`);
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
