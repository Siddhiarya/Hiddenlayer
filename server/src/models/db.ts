export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  avatar: string;
  address: string;
  dob: string;
  department: string;
  jobTitle: string;
  joiningDate: string;
  manager: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  status: 'Active' | 'On Leave' | 'Probation' | 'Terminated';
  role: 'Employee' | 'Admin' | 'HR';
  salary: {
    basic: number;
    hra: number;
    allowances: number;
    deductions: number;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
    size: string;
  }[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave';
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  avatar?: string;
  leaveType: 'Paid' | 'Sick' | 'Unpaid' | 'Casual';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedOn: string;
  approvedBy?: string;
  reviewedAt?: string;
  adminComment?: string;
}

export interface PayslipRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  month: string;
  year: number;
  paymentDate: string;
  basic: number;
  hra: number;
  allowances: number;
  grossSalary: number;
  pfDeduction: number;
  taxDeduction: number;
  totalDeductions: number;
  netSalary: number;
  status: 'Paid' | 'Processed' | 'Pending';
  paymentMethod: string;
  bankAccount: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'attendance' | 'leave' | 'payroll' | 'system';
  timestamp: string;
  read: boolean;
  link?: string;
}

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeId: 'DF-1001',
    name: 'Alex Morgan',
    email: 'employee@dayflow.com',
    password: 'employee123',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    address: '742 Evergreen Terrace, San Francisco, CA 94107',
    dob: '1994-06-15',
    department: 'Engineering',
    jobTitle: 'Senior Frontend Engineer',
    joiningDate: '2022-03-15',
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: { basic: 6500, hra: 2600, allowances: 1400, deductions: 950 },
    documents: [
      { id: 'doc-1', name: 'Offer_Letter_AlexMorgan.pdf', type: 'Offer Letter', uploadedAt: '2022-03-01', size: '1.2 MB' },
      { id: 'doc-2', name: 'Passport_ID_Proof.pdf', type: 'ID Proof', uploadedAt: '2022-03-05', size: '2.4 MB' },
      { id: 'doc-3', name: 'Employment_Agreement_2022.pdf', type: 'Employment Contract', uploadedAt: '2022-03-15', size: '3.1 MB' },
      { id: 'doc-4', name: 'Payslip_Sept_2026.pdf', type: 'Salary Slip', uploadedAt: '2026-09-30', size: '420 KB' }
    ]
  },
  {
    id: 'emp-2',
    employeeId: 'DF-1002',
    name: 'Sarah Jenkins',
    email: 'admin@dayflow.com',
    password: 'admin123',
    phone: '+1 (555) 876-5432',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    address: '88 King Street, Suite 400, San Francisco, CA 94107',
    dob: '1988-11-20',
    department: 'HR',
    jobTitle: 'VP of People & Operations',
    joiningDate: '2020-01-10',
    manager: 'David Chen (CEO)',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Admin',
    salary: { basic: 11000, hra: 4400, allowances: 2600, deductions: 1800 },
    documents: [
      { id: 'doc-201', name: 'Executive_Offer_Letter.pdf', type: 'Offer Letter', uploadedAt: '2020-01-02', size: '1.8 MB' }
    ]
  },
  {
    id: 'emp-3',
    employeeId: 'DF-1003',
    name: 'Marcus Vance',
    email: 'hr@dayflow.com',
    password: 'hr123',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    address: '120 Market Street, San Francisco, CA 94105',
    dob: '1992-04-12',
    department: 'HR',
    jobTitle: 'HR Operations Lead',
    joiningDate: '2021-06-01',
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'HR',
    salary: { basic: 5800, hra: 2320, allowances: 1200, deductions: 850 },
    documents: [
      { id: 'doc-301', name: 'Offer_Letter_Marcus.pdf', type: 'Offer Letter', uploadedAt: '2021-05-15', size: '1.1 MB' }
    ]
  },
  {
    id: 'emp-4',
    employeeId: 'DF-1004',
    name: 'Elena Rostova',
    email: 'elena.r@dayflow.com',
    password: 'password123',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    address: '450 Mission Bay Blvd, San Francisco, CA 94158',
    dob: '1993-08-25',
    department: 'Design',
    jobTitle: 'Lead Product Designer',
    joiningDate: '2021-09-01',
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: { basic: 7200, hra: 2880, allowances: 1600, deductions: 1050 },
    documents: [{ id: 'doc-401', name: 'Offer_Letter_Elena.pdf', type: 'Offer Letter', uploadedAt: '2021-08-20', size: '1.4 MB' }]
  },
  {
    id: 'emp-5',
    employeeId: 'DF-1005',
    name: 'Kenji Takahashi',
    email: 'kenji.t@dayflow.com',
    password: 'password123',
    phone: '+1 (555) 567-8901',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    address: '325 Townsend St, San Francisco, CA 94107',
    dob: '1990-03-18',
    department: 'Engineering',
    jobTitle: 'Principal Backend Architect',
    joiningDate: '2020-08-15',
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: { basic: 8900, hra: 3560, allowances: 2100, deductions: 1400 },
    documents: [{ id: 'doc-501', name: 'Offer_Letter_Kenji.pdf', type: 'Offer Letter', uploadedAt: '2020-08-01', size: '1.3 MB' }]
  },
  {
    id: 'emp-6',
    employeeId: 'DF-1006',
    name: 'Priya Sharma',
    email: 'priya.s@dayflow.com',
    password: 'password123',
    phone: '+1 (555) 678-9012',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    address: '1500 4th Street, San Francisco, CA 94158',
    dob: '1995-12-04',
    department: 'Engineering',
    jobTitle: 'Fullstack Software Engineer',
    joiningDate: '2023-01-09',
    manager: 'Kenji Takahashi',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: { basic: 6000, hra: 2400, allowances: 1300, deductions: 880 },
    documents: [{ id: 'doc-601', name: 'Offer_Letter_Priya.pdf', type: 'Offer Letter', uploadedAt: '2022-12-20', size: '1.2 MB' }]
  }
];

// Helper to get formatted today string (YYYY-MM-DD)
const getTodayStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const getNowTimeStr = () => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
};

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'DF-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    date: getTodayStr(),
    checkIn: '09:12 AM',
    checkOut: null,
    workingHours: 4.5,
    status: 'Present',
    notes: 'Regular check-in',
  },
  {
    id: 'att-2',
    employeeId: 'DF-1002',
    employeeName: 'Sarah Jenkins',
    department: 'HR',
    date: getTodayStr(),
    checkIn: '08:45 AM',
    checkOut: null,
    workingHours: 5.0,
    status: 'Present',
  },
  {
    id: 'att-3',
    employeeId: 'DF-1003',
    employeeName: 'Marcus Vance',
    department: 'HR',
    date: getTodayStr(),
    checkIn: '09:00 AM',
    checkOut: null,
    workingHours: 4.7,
    status: 'Present',
  },
  {
    id: 'att-alex-past-1',
    employeeId: 'DF-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    date: '2026-10-13',
    checkIn: '09:05 AM',
    checkOut: '06:15 PM',
    workingHours: 8.5,
    status: 'Present',
  }
];

const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'LR-101',
    employeeId: 'DF-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    leaveType: 'Paid',
    startDate: '2026-10-20',
    endDate: '2026-10-22',
    days: 3,
    reason: 'Family trip to Yosemite National Park',
    status: 'Pending',
    appliedOn: getTodayStr(),
  },
  {
    id: 'LR-102',
    employeeId: 'DF-1006',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    leaveType: 'Sick',
    startDate: '2026-10-18',
    endDate: '2026-10-19',
    days: 2,
    reason: 'Dental surgery and post-op recovery',
    status: 'Pending',
    appliedOn: getTodayStr(),
  }
];

const INITIAL_PAYROLL: PayslipRecord[] = [
  {
    id: 'PAY-2026-09-1001',
    employeeId: 'DF-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    jobTitle: 'Senior Frontend Engineer',
    month: 'September 2026',
    year: 2026,
    paymentDate: '2026-09-30',
    basic: 6500,
    hra: 2600,
    allowances: 1400,
    grossSalary: 10500,
    pfDeduction: 600,
    taxDeduction: 350,
    totalDeductions: 950,
    netSalary: 9550,
    status: 'Paid',
    paymentMethod: 'Direct Deposit / ACH',
    bankAccount: '•••• •••• •••• 8842'
  },
  {
    id: 'PAY-2026-08-1001',
    employeeId: 'DF-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    jobTitle: 'Senior Frontend Engineer',
    month: 'August 2026',
    year: 2026,
    paymentDate: '2026-08-31',
    basic: 6500,
    hra: 2600,
    allowances: 1400,
    grossSalary: 10500,
    pfDeduction: 600,
    taxDeduction: 350,
    totalDeductions: 950,
    netSalary: 9550,
    status: 'Paid',
    paymentMethod: 'Direct Deposit / ACH',
    bankAccount: '•••• •••• •••• 8842'
  }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'DF-1001',
    title: 'Salary Slip Available',
    message: 'Your salary slip for September 2026 has been generated and is ready for download.',
    category: 'payroll',
    timestamp: '2 hours ago',
    read: false,
    link: '/employee/payroll'
  },
  {
    id: 'notif-2',
    userId: 'DF-1001',
    title: 'Attendance Reminder',
    message: 'Don’t forget to check out at the end of your workday.',
    category: 'attendance',
    timestamp: '4 hours ago',
    read: false,
    link: '/employee/attendance'
  },
  {
    id: 'notif-admin-1',
    userId: 'DF-1002',
    title: 'New Leave Request',
    message: 'Alex Morgan submitted a Paid Leave request for Oct 20 - Oct 22 (3 days).',
    category: 'leave',
    timestamp: '30 mins ago',
    read: false,
    link: '/admin/leaves'
  }
];

class Database {
  private employees: Employee[] = [...INITIAL_EMPLOYEES];
  private attendance: AttendanceRecord[] = [...INITIAL_ATTENDANCE];
  private leaves: LeaveRequest[] = [...INITIAL_LEAVES];
  private payroll: PayslipRecord[] = [...INITIAL_PAYROLL];
  private notifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];

  // Employee Methods
  getEmployees(): Employee[] {
    return this.employees;
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.employees.find(e => e.id === id || e.employeeId === id);
  }

  getEmployeeByEmail(email: string): Employee | undefined {
    return this.employees.find(e => e.email.toLowerCase() === email.trim().toLowerCase());
  }

  addEmployee(emp: Omit<Employee, 'id'>): Employee {
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`,
    };
    this.employees.unshift(newEmp);

    this.addNotification({
      userId: newEmp.employeeId,
      title: 'Welcome to Dayflow!',
      message: `Welcome aboard ${newEmp.name}. Your profile has been initialized.`,
      category: 'system',
      link: '/employee/profile',
    });

    return newEmp;
  }

  updateEmployee(id: string, updates: Partial<Employee>): Employee | undefined {
    const index = this.employees.findIndex(e => e.id === id || e.employeeId === id);
    if (index === -1) return undefined;
    this.employees[index] = { ...this.employees[index], ...updates };
    return this.employees[index];
  }

  deleteEmployee(id: string): boolean {
    const initialLen = this.employees.length;
    this.employees = this.employees.filter(e => e.id !== id && e.employeeId !== id);
    return this.employees.length < initialLen;
  }

  // Attendance Methods
  getAttendance(employeeId?: string): AttendanceRecord[] {
    if (employeeId) {
      return this.attendance.filter(a => a.employeeId === employeeId);
    }
    return this.attendance;
  }

  getTodayAttendance(employeeId: string): AttendanceRecord | null {
    const today = getTodayStr();
    return this.attendance.find(a => a.employeeId === employeeId && a.date === today) || null;
  }

  checkIn(employeeId: string): AttendanceRecord {
    const today = getTodayStr();
    const nowTime = getNowTimeStr();
    const emp = this.getEmployeeById(employeeId);
    const existingIndex = this.attendance.findIndex(a => a.employeeId === employeeId && a.date === today);

    if (existingIndex >= 0) {
      this.attendance[existingIndex] = {
        ...this.attendance[existingIndex],
        checkIn: nowTime,
        status: 'Present',
      };
      return this.attendance[existingIndex];
    } else {
      const record: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId,
        employeeName: emp ? emp.name : 'Employee',
        department: emp ? emp.department : 'General',
        date: today,
        checkIn: nowTime,
        checkOut: null,
        workingHours: 0.1,
        status: 'Present',
        notes: 'Checked in via web portal',
      };
      this.attendance.unshift(record);
      return record;
    }
  }

  checkOut(employeeId: string): AttendanceRecord | null {
    const today = getTodayStr();
    const nowTime = getNowTimeStr();
    const existingIndex = this.attendance.findIndex(a => a.employeeId === employeeId && a.date === today);

    if (existingIndex >= 0) {
      const record = this.attendance[existingIndex];
      this.attendance[existingIndex] = {
        ...record,
        checkOut: nowTime,
        workingHours: 8.5,
      };
      return this.attendance[existingIndex];
    }
    return null;
  }

  getAttendanceSummary() {
    const today = getTodayStr();
    const todayRecords = this.attendance.filter(r => r.date === today);
    const present = todayRecords.filter(r => r.status === 'Present').length;
    const halfDay = todayRecords.filter(r => r.status === 'Half Day').length;
    const onLeave = todayRecords.filter(r => r.status === 'Leave').length;
    const absent = Math.max(0, this.employees.length - (present + halfDay + onLeave));

    return {
      present,
      halfDay,
      onLeave,
      absent,
      total: this.employees.length,
    };
  }

  // Leave Methods
  getLeaves(employeeId?: string): LeaveRequest[] {
    if (employeeId) {
      return this.leaves.filter(l => l.employeeId === employeeId);
    }
    return this.leaves;
  }

  applyLeave(data: {
    employeeId: string;
    leaveType: 'Paid' | 'Sick' | 'Unpaid' | 'Casual';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }): LeaveRequest {
    const emp = this.getEmployeeById(data.employeeId);
    const newRequest: LeaveRequest = {
      id: `LR-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: data.employeeId,
      employeeName: emp ? emp.name : 'Employee',
      department: emp ? emp.department : 'Engineering',
      avatar: emp?.avatar,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
      reason: data.reason,
      status: 'Pending',
      appliedOn: getTodayStr(),
    };

    this.leaves.unshift(newRequest);

    // Notify Admin/HR
    this.addNotification({
      userId: 'DF-1002',
      title: 'New Leave Request',
      message: `${emp ? emp.name : 'Employee'} applied for ${data.days} day(s) of ${data.leaveType} leave.`,
      category: 'leave',
      link: '/admin/leaves',
    });

    return newRequest;
  }

  approveLeave(requestId: string, approvedBy: string, comment?: string): LeaveRequest | undefined {
    const index = this.leaves.findIndex(l => l.id === requestId);
    if (index === -1) return undefined;

    this.leaves[index] = {
      ...this.leaves[index],
      status: 'Approved',
      approvedBy,
      reviewedAt: getTodayStr(),
      adminComment: comment || 'Approved by HR administration.',
    };

    const target = this.leaves[index];
    // Notify employee
    this.addNotification({
      userId: target.employeeId,
      title: 'Leave Request Approved! 🎉',
      message: `Your ${target.leaveType} leave request for ${target.startDate} to ${target.endDate} (${target.days} days) has been approved.`,
      category: 'leave',
      link: '/employee/leave',
    });

    return target;
  }

  rejectLeave(requestId: string, approvedBy: string, comment: string): LeaveRequest | undefined {
    const index = this.leaves.findIndex(l => l.id === requestId);
    if (index === -1) return undefined;

    this.leaves[index] = {
      ...this.leaves[index],
      status: 'Rejected',
      approvedBy,
      reviewedAt: getTodayStr(),
      adminComment: comment,
    };

    const target = this.leaves[index];
    // Notify employee
    this.addNotification({
      userId: target.employeeId,
      title: 'Leave Request Rejected',
      message: `Your leave request was declined: "${comment}"`,
      category: 'leave',
      link: '/employee/leave',
    });

    return target;
  }

  cancelLeave(requestId: string): LeaveRequest | undefined {
    const index = this.leaves.findIndex(l => l.id === requestId);
    if (index === -1) return undefined;
    this.leaves[index] = { ...this.leaves[index], status: 'Cancelled' };
    return this.leaves[index];
  }

  getLeaveBalance(employeeId: string) {
    const approved = this.leaves.filter(
      r => r.employeeId === employeeId && r.status === 'Approved'
    );

    const paidUsed = approved.filter(r => r.leaveType === 'Paid').reduce((acc, r) => acc + r.days, 0);
    const sickUsed = approved.filter(r => r.leaveType === 'Sick').reduce((acc, r) => acc + r.days, 0);
    const unpaidUsed = approved.filter(r => r.leaveType === 'Unpaid').reduce((acc, r) => acc + r.days, 0);
    const casualUsed = approved.filter(r => r.leaveType === 'Casual').reduce((acc, r) => acc + r.days, 0);

    return {
      paid: { total: 18, used: paidUsed, remaining: Math.max(0, 18 - paidUsed) },
      sick: { total: 10, used: sickUsed, remaining: Math.max(0, 10 - sickUsed) },
      unpaid: { total: 0, used: unpaidUsed, remaining: 0 },
      casual: { total: 5, used: casualUsed, remaining: Math.max(0, 5 - casualUsed) },
    };
  }

  // Payroll Methods
  getPayroll(employeeId?: string): PayslipRecord[] {
    if (employeeId) {
      return this.payroll.filter(p => p.employeeId === employeeId);
    }
    return this.payroll;
  }

  updateEmployeeSalary(
    employeeId: string,
    salary: { basic: number; hra: number; allowances: number; deductions: number }
  ): Employee | undefined {
    const emp = this.updateEmployee(employeeId, { salary });
    if (emp) {
      this.addNotification({
        userId: employeeId,
        title: 'Salary Structure Updated',
        message: 'Your compensation package has been updated by HR.',
        category: 'payroll',
        link: '/employee/payroll',
      });
    }
    return emp;
  }

  // Notification Methods
  getNotifications(userId: string): AppNotification[] {
    return this.notifications.filter(n => n.userId === userId || n.userId === 'all');
  }

  getAllNotifications(): AppNotification[] {
    return this.notifications;
  }

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: 'Just now',
      read: false,
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  markNotificationAsRead(id: string): boolean {
    const target = this.notifications.find(n => n.id === id);
    if (target) {
      target.read = true;
      return true;
    }
    return false;
  }

  markAllNotificationsAsRead(userId: string): void {
    this.notifications.forEach(n => {
      if (n.userId === userId || n.userId === 'all') {
        n.read = true;
      }
    });
  }

  deleteNotification(id: string): boolean {
    const initial = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.id !== id);
    return this.notifications.length < initial;
  }
}

export const db = new Database();
