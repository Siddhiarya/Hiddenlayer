export type Role = 'employee' | 'admin' | 'hr';

export type AttendanceStatus = 'Present' | 'Absent' | 'Half-day' | 'Leave';

export type LeaveType = 'Paid Leave' | 'Sick Leave' | 'Unpaid Leave';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export type PaymentStatus = 'Paid' | 'Processing' | 'Pending';

export interface SalaryBreakdown {
  basic: number;
  allowances: {
    hra: number;
    special: number;
    medical: number;
    conveyance: number;
    total: number;
  };
  deductions: {
    pf: number;
    tax: number;
    insurance: number;
    other: number;
    total: number;
  };
  netSalary: number;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  name: string;
  type: string;
  uploadDate: string;
  fileUrl: string;
  size: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
  profilePicture: string;
  department: string;
  designation: string;
  joiningDate: string;
  role: Role;
  status: 'Active' | 'Inactive' | 'On Leave';
  manager: string;
  salary: SalaryBreakdown;
  documents?: EmployeeDocument[];
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // ISO string
  checkOut?: string; // ISO string
  workingHours?: number; // hours in decimal, e.g. 8.5
  status: AttendanceStatus;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  numberOfDays: number;
  remarks: string;
  status: LeaveStatus;
  adminComment?: string;
  createdAt: string; // ISO string
}

export interface LeaveBalance {
  employeeId: string;
  paidLeave: {
    total: number;
    used: number;
    remaining: number;
  };
  sickLeave: {
    total: number;
    used: number;
    remaining: number;
  };
  unpaidLeave: {
    used: number;
  };
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  payPeriod: string; // e.g., "August 2026"
  paymentDate: string;
  basicSalary: number;
  allowances: SalaryBreakdown['allowances'];
  deductions: SalaryBreakdown['deductions'];
  grossSalary: number;
  netSalary: number;
  paymentStatus: PaymentStatus;
  bankAccount: string;
  taxNumber: string;
}

export interface WeeklyAttendanceSummary {
  weekStart: string;
  weekEnd: string;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  totalWorkingHours: number;
}
