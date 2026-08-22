import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  Employee,
  Attendance,
  LeaveRequest,
  LeaveBalance,
  PayrollRecord
} from '../models/types.js';

interface DatabaseSchema {
  employees: Employee[];
  attendance: Attendance[];
  leaveRequests: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
  payrolls: PayrollRecord[];
}

const DB_FILE = path.join(process.cwd(), 'src', 'data', 'store.json');

// Helper to hash passwords consistently
const hashPassword = (plain: string) => bcrypt.hashSync(plain, 10);

const getInitialSeedData = (): DatabaseSchema => {
  const employees: Employee[] = [
    {
      id: 'emp_01',
      employeeId: 'EMP-1001',
      name: 'Alex Rivera',
      email: 'alex.rivera@dayflow.corp',
      password: hashPassword('password123'),
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Suite 402, San Francisco, CA 94107',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      department: 'Engineering',
      designation: 'Senior Frontend Engineer',
      joiningDate: '2023-03-15',
      role: 'employee',
      status: 'Active',
      manager: 'David Vance (Director of Engineering)',
      salary: {
        basic: 6500,
        allowances: {
          hra: 1800,
          special: 950,
          medical: 450,
          conveyance: 300,
          total: 3500
        },
        deductions: {
          pf: 780,
          tax: 1120,
          insurance: 250,
          other: 50,
          total: 2200
        },
        netSalary: 7800
      },
      documents: [
        {
          id: 'doc_1',
          employeeId: 'EMP-1001',
          name: 'Employment_Agreement_2023.pdf',
          type: 'Contract',
          uploadDate: '2023-03-15',
          fileUrl: 'https://dayflow.corp/docs/EMP-1001/contract.pdf',
          size: '1.8 MB'
        },
        {
          id: 'doc_2',
          employeeId: 'EMP-1001',
          name: 'Passport_Scan_Copy.pdf',
          type: 'Identification',
          uploadDate: '2023-03-16',
          fileUrl: 'https://dayflow.corp/docs/EMP-1001/passport.pdf',
          size: '2.4 MB'
        },
        {
          id: 'doc_3',
          employeeId: 'EMP-1001',
          name: 'Health_Insurance_Policy.pdf',
          type: 'Insurance',
          uploadDate: '2024-01-10',
          fileUrl: 'https://dayflow.corp/docs/EMP-1001/insurance.pdf',
          size: '950 KB'
        }
      ]
    },
    {
      id: 'emp_02',
      employeeId: 'EMP-1002',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@dayflow.corp',
      password: hashPassword('password123'),
      phone: '+1 (555) 876-5432',
      address: '128 Mission Blvd, Apt 12B, San Francisco, CA 94103',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      department: 'Product Design',
      designation: 'Lead UI/UX Designer',
      joiningDate: '2022-08-01',
      role: 'employee',
      status: 'Active',
      manager: 'Elena Rostova (VP of Product)',
      salary: {
        basic: 7000,
        allowances: {
          hra: 2000,
          special: 1000,
          medical: 500,
          conveyance: 300,
          total: 3800
        },
        deductions: {
          pf: 840,
          tax: 1260,
          insurance: 250,
          other: 50,
          total: 2400
        },
        netSalary: 8400
      },
      documents: [
        {
          id: 'doc_4',
          employeeId: 'EMP-1002',
          name: 'Offer_Letter_Signed.pdf',
          type: 'Contract',
          uploadDate: '2022-08-01',
          fileUrl: 'https://dayflow.corp/docs/EMP-1002/contract.pdf',
          size: '1.2 MB'
        }
      ]
    },
    {
      id: 'emp_03',
      employeeId: 'EMP-1003',
      name: 'Marcus Chen',
      email: 'marcus.chen@dayflow.corp',
      password: hashPassword('password123'),
      phone: '+1 (555) 345-6789',
      address: '500 Howard St, Suite 210, San Francisco, CA 94105',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      department: 'Human Resources',
      designation: 'HR Director & Operations',
      joiningDate: '2021-01-10',
      role: 'hr',
      status: 'Active',
      manager: 'Claire Underwood (COO)',
      salary: {
        basic: 8000,
        allowances: {
          hra: 2200,
          special: 1200,
          medical: 500,
          conveyance: 300,
          total: 4200
        },
        deductions: {
          pf: 960,
          tax: 1540,
          insurance: 250,
          other: 50,
          total: 2800
        },
        netSalary: 9400
      }
    }
  ];

  // Seed 30 days of attendance for Alex Rivera (EMP-1001)
  const attendance: Attendance[] = [];
  const today = new Date();
  
  for (let i = 28; i >= 1; i--) {
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - i);
    const dayOfWeek = pastDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Skip weekends for work attendance
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    const dateStr = pastDate.toISOString().split('T')[0];
    
    // Specific variations for testing all statuses
    if (i === 12) {
      // Leave day
      attendance.push({
        id: `att_${dateStr}_EMP-1001`,
        employeeId: 'EMP-1001',
        date: dateStr,
        checkIn: `${dateStr}T09:00:00.000Z`,
        checkOut: `${dateStr}T17:00:00.000Z`,
        workingHours: 0,
        status: 'Leave',
        notes: 'Approved Paid Leave'
      });
    } else if (i === 7) {
      // Half-day
      attendance.push({
        id: `att_${dateStr}_EMP-1001`,
        employeeId: 'EMP-1001',
        date: dateStr,
        checkIn: `${dateStr}T09:12:00.000Z`,
        checkOut: `${dateStr}T13:42:00.000Z`,
        workingHours: 4.5,
        status: 'Half-day',
        notes: 'Doctor Appointment'
      });
    } else if (i === 19) {
      // Absent
      attendance.push({
        id: `att_${dateStr}_EMP-1001`,
        employeeId: 'EMP-1001',
        date: dateStr,
        checkIn: '',
        checkOut: '',
        workingHours: 0,
        status: 'Absent',
        notes: 'Unexcused Absence'
      });
    } else {
      // Present full day with slight time variations
      const checkInHour = 9;
      const checkInMin = Math.floor(Math.random() * 20); // 09:00 to 09:20
      const checkOutHour = 17 + (Math.random() > 0.4 ? 1 : 0);
      const checkOutMin = Math.floor(Math.random() * 30);
      const hours = Number(((checkOutHour * 60 + checkOutMin - (checkInHour * 60 + checkInMin)) / 60).toFixed(1));

      attendance.push({
        id: `att_${dateStr}_EMP-1001`,
        employeeId: 'EMP-1001',
        date: dateStr,
        checkIn: `${dateStr}T0${checkInHour}:${checkInMin < 10 ? '0' + checkInMin : checkInMin}:00.000Z`,
        checkOut: `${dateStr}T${checkOutHour}:${checkOutMin < 10 ? '0' + checkOutMin : checkOutMin}:00.000Z`,
        workingHours: hours,
        status: 'Present',
        notes: 'Regular Shift'
      });
    }
  }

  // Leave balances
  const leaveBalances: Record<string, LeaveBalance> = {
    'EMP-1001': {
      employeeId: 'EMP-1001',
      paidLeave: {
        total: 20,
        used: 4,
        remaining: 16
      },
      sickLeave: {
        total: 10,
        used: 2,
        remaining: 8
      },
      unpaidLeave: {
        used: 0
      }
    },
    'EMP-1002': {
      employeeId: 'EMP-1002',
      paidLeave: {
        total: 20,
        used: 2,
        remaining: 18
      },
      sickLeave: {
        total: 10,
        used: 1,
        remaining: 9
      },
      unpaidLeave: {
        used: 0
      }
    }
  };

  // Leave requests
  const leaveRequests: LeaveRequest[] = [
    {
      id: 'leave_101',
      employeeId: 'EMP-1001',
      employeeName: 'Alex Rivera',
      leaveType: 'Paid Leave',
      startDate: '2026-08-10',
      endDate: '2026-08-12',
      numberOfDays: 3,
      remarks: 'Family vacation and personal downtime.',
      status: 'Approved',
      adminComment: 'Approved. Enjoy your vacation!',
      createdAt: '2026-08-01T10:30:00.000Z'
    },
    {
      id: 'leave_102',
      employeeId: 'EMP-1001',
      employeeName: 'Alex Rivera',
      leaveType: 'Sick Leave',
      startDate: '2026-07-15',
      endDate: '2026-07-15',
      numberOfDays: 1,
      remarks: 'Viral fever and prescribed medical rest.',
      status: 'Approved',
      adminComment: 'Get well soon. Medical slip acknowledged.',
      createdAt: '2026-07-15T08:15:00.000Z'
    },
    {
      id: 'leave_103',
      employeeId: 'EMP-1001',
      employeeName: 'Alex Rivera',
      leaveType: 'Paid Leave',
      startDate: '2026-09-02',
      endDate: '2026-09-04',
      numberOfDays: 3,
      remarks: 'Attending Web Dev Tech Conference & Workshops.',
      status: 'Pending',
      adminComment: undefined,
      createdAt: '2026-08-20T14:40:00.000Z'
    },
    {
      id: 'leave_104',
      employeeId: 'EMP-1001',
      employeeName: 'Alex Rivera',
      leaveType: 'Unpaid Leave',
      startDate: '2026-06-05',
      endDate: '2026-06-09',
      numberOfDays: 5,
      remarks: 'Extended leave for relocation.',
      status: 'Rejected',
      adminComment: 'Rejected due to critical product sprint milestone. Please reschedule.',
      createdAt: '2026-05-28T09:00:00.000Z'
    }
  ];

  // Payroll Records
  const payrolls: PayrollRecord[] = [
    {
      id: 'pay_2026_07',
      employeeId: 'EMP-1001',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      designation: 'Senior Frontend Engineer',
      payPeriod: 'July 2026',
      paymentDate: '2026-07-31',
      basicSalary: 6500,
      allowances: {
        hra: 1800,
        special: 950,
        medical: 450,
        conveyance: 300,
        total: 3500
      },
      deductions: {
        pf: 780,
        tax: 1120,
        insurance: 250,
        other: 50,
        total: 2200
      },
      grossSalary: 10000,
      netSalary: 7800,
      paymentStatus: 'Paid',
      bankAccount: '•••• •••• •••• 4912 (Silicon Valley Bank)',
      taxNumber: 'US-TAX-8921-987'
    },
    {
      id: 'pay_2026_06',
      employeeId: 'EMP-1001',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      designation: 'Senior Frontend Engineer',
      payPeriod: 'June 2026',
      paymentDate: '2026-06-30',
      basicSalary: 6500,
      allowances: {
        hra: 1800,
        special: 950,
        medical: 450,
        conveyance: 300,
        total: 3500
      },
      deductions: {
        pf: 780,
        tax: 1120,
        insurance: 250,
        other: 50,
        total: 2200
      },
      grossSalary: 10000,
      netSalary: 7800,
      paymentStatus: 'Paid',
      bankAccount: '•••• •••• •••• 4912 (Silicon Valley Bank)',
      taxNumber: 'US-TAX-8921-987'
    },
    {
      id: 'pay_2026_05',
      employeeId: 'EMP-1001',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      designation: 'Senior Frontend Engineer',
      payPeriod: 'May 2026',
      paymentDate: '2026-05-31',
      basicSalary: 6500,
      allowances: {
        hra: 1800,
        special: 950,
        medical: 450,
        conveyance: 300,
        total: 3500
      },
      deductions: {
        pf: 780,
        tax: 1120,
        insurance: 250,
        other: 50,
        total: 2200
      },
      grossSalary: 10000,
      netSalary: 7800,
      paymentStatus: 'Paid',
      bankAccount: '•••• •••• •••• 4912 (Silicon Valley Bank)',
      taxNumber: 'US-TAX-8921-987'
    },
    {
      id: 'pay_2026_08',
      employeeId: 'EMP-1001',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      designation: 'Senior Frontend Engineer',
      payPeriod: 'August 2026',
      paymentDate: '2026-08-31',
      basicSalary: 6500,
      allowances: {
        hra: 1800,
        special: 950,
        medical: 450,
        conveyance: 300,
        total: 3500
      },
      deductions: {
        pf: 780,
        tax: 1120,
        insurance: 250,
        other: 50,
        total: 2200
      },
      grossSalary: 10000,
      netSalary: 7800,
      paymentStatus: 'Processing',
      bankAccount: '•••• •••• •••• 4912 (Silicon Valley Bank)',
      taxNumber: 'US-TAX-8921-987'
    }
  ];

  return {
    employees,
    attendance,
    leaveRequests,
    leaveBalances,
    payrolls
  };
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing store.json, reinitializing seed data.', err);
    }
    const seed = getInitialSeedData();
    this.save(seed);
    return seed;
  }

  private save(data?: DatabaseSchema) {
    try {
      const target = data || this.data;
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(target, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write to store.json', err);
    }
  }

  // Employee methods
  public getEmployees(): Employee[] {
    return this.data.employees;
  }

  public getEmployeeByEmail(email: string): Employee | undefined {
    return this.data.employees.find(e => e.email.toLowerCase() === email.toLowerCase());
  }

  public getEmployeeById(employeeId: string): Employee | undefined {
    return this.data.employees.find(e => e.employeeId === employeeId);
  }

  public updateEmployeeProfile(employeeId: string, updates: Partial<Pick<Employee, 'phone' | 'address' | 'profilePicture'>>): Employee | null {
    const employee = this.data.employees.find(e => e.employeeId === employeeId);
    if (!employee) return null;

    if (updates.phone !== undefined) employee.phone = updates.phone.trim();
    if (updates.address !== undefined) employee.address = updates.address.trim();
    if (updates.profilePicture !== undefined) employee.profilePicture = updates.profilePicture.trim();

    this.save();
    return employee;
  }

  // Attendance methods
  public getAttendanceByEmployee(employeeId: string): Attendance[] {
    return this.data.attendance.filter(a => a.employeeId === employeeId);
  }

  public getAttendanceForDate(employeeId: string, date: string): Attendance | undefined {
    return this.data.attendance.find(a => a.employeeId === employeeId && a.date === date);
  }

  public deleteAttendanceForDate(employeeId: string, date: string): boolean {
    const idx = this.data.attendance.findIndex(a => a.employeeId === employeeId && a.date === date);
    if (idx !== -1) {
      this.data.attendance.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  public checkIn(employeeId: string, date: string, checkInTime: string): Attendance {
    let record = this.getAttendanceForDate(employeeId, date);
    if (record) {
      throw new Error('Attendance already recorded for today. Duplicate check-in is not allowed.');
    }

    record = {
      id: `att_${date}_${employeeId}`,
      employeeId,
      date,
      checkIn: checkInTime,
      checkOut: undefined,
      workingHours: undefined,
      status: 'Present',
      notes: 'Currently Working'
    };

    this.data.attendance.unshift(record);
    this.save();
    return record;
  }

  public checkOut(employeeId: string, date: string, checkOutTime: string): Attendance {
    const record = this.getAttendanceForDate(employeeId, date);
    if (!record || !record.checkIn) {
      throw new Error('Cannot check out without checking in first.');
    }
    if (record.checkOut) {
      throw new Error('Already checked out for today. Duplicate check-out is not allowed.');
    }

    record.checkOut = checkOutTime;
    const checkInDate = new Date(record.checkIn);
    const checkOutDate = new Date(checkOutTime);
    const diffHours = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
    record.workingHours = Number(Math.max(0, diffHours).toFixed(2));
    
    // Status classification upon completion:
    // If working hours >= 4 hrs -> Present (Full Day)
    // If working hours < 4 hrs -> Half-day
    if (record.workingHours < 4) {
      record.status = 'Half-day';
      record.notes = 'Shift Completed (Half-day)';
    } else {
      record.status = 'Present';
      record.notes = 'Shift Completed';
    }

    this.save();
    return record;
  }

  // Leave methods
  public getLeavesByEmployee(employeeId: string): LeaveRequest[] {
    return this.data.leaveRequests.filter(l => l.employeeId === employeeId);
  }

  public getLeaveBalance(employeeId: string): LeaveBalance {
    if (!this.data.leaveBalances[employeeId]) {
      this.data.leaveBalances[employeeId] = {
        employeeId,
        paidLeave: { total: 20, used: 0, remaining: 20 },
        sickLeave: { total: 10, used: 0, remaining: 10 },
        unpaidLeave: { used: 0 }
      };
      this.save();
    }
    return this.data.leaveBalances[employeeId];
  }

  public createLeaveRequest(leave: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>): LeaveRequest {
    const newRequest: LeaveRequest = {
      ...leave,
      id: `leave_${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    this.data.leaveRequests.unshift(newRequest);
    this.save();
    return newRequest;
  }

  // Payroll methods
  public getPayrollsByEmployee(employeeId: string): PayrollRecord[] {
    return this.data.payrolls.filter(p => p.employeeId === employeeId);
  }
}

export const db = new Database();
