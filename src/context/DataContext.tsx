import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Employee } from '../types/employee';
import { AttendanceRecord, DailyAttendanceSummary } from '../types/attendance';
import { LeaveRequest, LeaveBalance, LeaveType } from '../types/leave';
import { PayslipRecord } from '../types/payroll';
import { AppNotification } from '../types/notification';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { employeeService } from '../services/employeeService';
import { attendanceService } from '../services/attendanceService';
import { leaveService } from '../services/leaveService';
import { payrollService } from '../services/payrollService';
import { notificationService } from '../services/notificationService';
import { INITIAL_EMPLOYEES } from '../data/initialEmployees';
import { INITIAL_ATTENDANCE } from '../data/initialAttendance';
import { INITIAL_LEAVES } from '../data/initialLeaves';
import { INITIAL_PAYSLIPS } from '../data/initialPayroll';
import { INITIAL_NOTIFICATIONS } from '../data/initialNotifications';

interface DataContextType {
  // Loading & sync
  isLoadingData: boolean;
  refreshData: () => Promise<void>;

  // Employees
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<Employee | undefined>;
  updateEmployee: (id: string, updated: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployeeById: (id: string) => Employee | undefined;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  todayUserAttendance: AttendanceRecord | null;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  getEmployeeAttendance: (employeeId: string) => AttendanceRecord[];
  getDailyAttendanceSummary: () => DailyAttendanceSummary;

  // Leaves
  leaveRequests: LeaveRequest[];
  applyLeave: (leaveData: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }) => Promise<void>;
  approveLeave: (requestId: string, comment?: string) => Promise<void>;
  rejectLeave: (requestId: string, comment: string) => Promise<void>;
  cancelLeave: (requestId: string) => Promise<void>;
  getEmployeeLeaveBalance: (employeeId: string) => LeaveBalance;
  getUserLeaveRequests: (employeeId: string) => LeaveRequest[];

  // Payroll
  payslips: PayslipRecord[];
  updateEmployeeSalary: (
    employeeId: string,
    salary: { basic: number; hra: number; allowances: number; deductions: number }
  ) => Promise<void>;
  getEmployeePayslips: (employeeId: string) => PayslipRecord[];

  // Notifications
  notifications: AppNotification[];
  userNotifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;

  // Reset
  resetToDefaultData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { success, info, error: toastError } = useToast();

  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [todayUserAttendance, setTodayUserAttendance] = useState<AttendanceRecord | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [payslips, setPayslips] = useState<PayslipRecord[]>(INITIAL_PAYSLIPS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Fetch all live data from backend
  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Fetch Employees
      const empRes = await employeeService.getAll().catch(() => null);
      if (empRes && empRes.employees) {
        setEmployees(empRes.employees);
      }

      // 2. Fetch Attendance
      const attRes = await attendanceService.getAll().catch(() => null);
      if (attRes && attRes.attendance) {
        setAttendanceRecords(attRes.attendance);
      }

      const todayRes = await attendanceService.getToday().catch(() => null);
      if (todayRes) {
        setTodayUserAttendance(todayRes.attendance);
      }

      // 3. Fetch Leaves
      const leaveRes = await leaveService.getAll().catch(() => null);
      if (leaveRes && leaveRes.leaves) {
        setLeaveRequests(leaveRes.leaves);
      }

      // 4. Fetch Payroll
      const payRes = await payrollService.getAll().catch(() => null);
      if (payRes && payRes.payroll) {
        setPayslips(payRes.payroll);
      }

      // 5. Fetch Notifications
      const notifRes = await notificationService.getMyNotifications().catch(() => null);
      if (notifRes && notifRes.notifications) {
        setNotifications(notifRes.notifications);
      }
    } catch (err) {
      console.error('Error fetching live data from backend:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [user]);

  // Initial and reactive load on user change
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Employee Operations
  const addEmployee = async (empData: Omit<Employee, 'id'>): Promise<Employee | undefined> => {
    try {
      const res = await employeeService.add(empData);
      if (res.success && res.employee) {
        setEmployees(prev => [res.employee, ...prev]);
        success('Employee Added', `${res.employee.name} has been enrolled successfully.`);
        await refreshData();
        return res.employee;
      }
    } catch (err: any) {
      toastError('Failed to add employee', err.message);
    }
    return undefined;
  };

  const updateEmployee = async (id: string, updated: Partial<Employee>) => {
    try {
      const res = await employeeService.update(id, updated);
      if (res.success && res.employee) {
        setEmployees(prev => prev.map(e => (e.id === id || e.employeeId === id ? res.employee : e)));
        success('Profile Updated', 'Employee details saved successfully.');
        await refreshData();
      }
    } catch (err: any) {
      toastError('Update Failed', err.message);
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const res = await employeeService.delete(id);
      if (res.success) {
        setEmployees(prev => prev.filter(e => e.id !== id && e.employeeId !== id));
        success('Employee Removed', 'The employee record has been deleted.');
        await refreshData();
      }
    } catch (err: any) {
      toastError('Delete Failed', err.message);
    }
  };

  const getEmployeeById = (id: string): Employee | undefined => {
    return employees.find(e => e.id === id || e.employeeId === id);
  };

  // Attendance Operations
  const checkIn = async () => {
    try {
      const res = await attendanceService.checkIn();
      if (res.success && res.attendance) {
        setTodayUserAttendance(res.attendance);
        setAttendanceRecords(prev => {
          const idx = prev.findIndex(a => a.id === res.attendance.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = res.attendance;
            return copy;
          }
          return [res.attendance, ...prev];
        });
        success('Checked In Successfully', `Good day! Checked in at ${res.attendance.checkIn}.`);
      }
    } catch (err: any) {
      toastError('Check-in Failed', err.message);
    }
  };

  const checkOut = async () => {
    try {
      const res = await attendanceService.checkOut();
      if (res.success && res.attendance) {
        setTodayUserAttendance(res.attendance);
        setAttendanceRecords(prev =>
          prev.map(a => (a.id === res.attendance.id ? res.attendance : a))
        );
        info('Checked Out', `Checked out at ${res.attendance.checkOut}. Total logged: 8.5 hrs.`);
      }
    } catch (err: any) {
      toastError('Check-out Failed', err.message);
    }
  };

  const getEmployeeAttendance = (employeeId: string): AttendanceRecord[] => {
    return attendanceRecords.filter(r => r.employeeId === employeeId);
  };

  const getDailyAttendanceSummary = (): DailyAttendanceSummary => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter(r => r.date === today);
    const present = todayRecords.filter(r => r.status === 'Present').length;
    const halfDay = todayRecords.filter(r => r.status === 'Half Day').length;
    const onLeave = todayRecords.filter(r => r.status === 'Leave').length;
    const absent = Math.max(0, employees.length - (present + halfDay + onLeave));

    return {
      present,
      halfDay,
      onLeave,
      absent,
      total: employees.length,
    };
  };

  // Leaves Operations
  const applyLeave = async (leaveData: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }) => {
    try {
      const res = await leaveService.apply(leaveData);
      if (res.success && res.leave) {
        setLeaveRequests(prev => [res.leave, ...prev]);
        success('Leave Request Submitted', `Your application for ${leaveData.days} day(s) has been sent.`);
        await refreshData();
      }
    } catch (err: any) {
      toastError('Application Failed', err.message);
    }
  };

  const approveLeave = async (requestId: string, comment?: string) => {
    try {
      const res = await leaveService.approve(requestId, comment);
      if (res.success && res.leave) {
        setLeaveRequests(prev =>
          prev.map(l => (l.id === requestId ? res.leave : l))
        );
        success('Leave Approved', `Approved request for ${res.leave.employeeName}.`);
        await refreshData();
      }
    } catch (err: any) {
      toastError('Approval Failed', err.message);
    }
  };

  const rejectLeave = async (requestId: string, comment: string) => {
    try {
      const res = await leaveService.reject(requestId, comment);
      if (res.success && res.leave) {
        setLeaveRequests(prev =>
          prev.map(l => (l.id === requestId ? res.leave : l))
        );
        info('Leave Rejected', `Declined request for ${res.leave.employeeName}.`);
        await refreshData();
      }
    } catch (err: any) {
      toastError('Rejection Failed', err.message);
    }
  };

  const cancelLeave = async (requestId: string) => {
    try {
      const res = await leaveService.cancel(requestId);
      if (res.success && res.leave) {
        setLeaveRequests(prev =>
          prev.map(l => (l.id === requestId ? res.leave : l))
        );
        info('Leave Cancelled', 'Your pending request has been cancelled.');
        await refreshData();
      }
    } catch (err: any) {
      toastError('Cancel Failed', err.message);
    }
  };

  const getEmployeeLeaveBalance = (employeeId: string): LeaveBalance => {
    const approved = leaveRequests.filter(
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
  };

  const getUserLeaveRequests = (employeeId: string): LeaveRequest[] => {
    return leaveRequests.filter(r => r.employeeId === employeeId);
  };

  // Payroll Operations
  const updateEmployeeSalary = async (
    employeeId: string,
    salary: { basic: number; hra: number; allowances: number; deductions: number }
  ) => {
    try {
      const res = await payrollService.updateSalaryStructure(employeeId, salary);
      if (res.success && res.employee) {
        setEmployees(prev =>
          prev.map(e => (e.employeeId === employeeId || e.id === employeeId ? res.employee : e))
        );
        success('Salary Structure Updated', 'Revisions saved successfully.');
        await refreshData();
      }
    } catch (err: any) {
      toastError('Salary Update Failed', err.message);
    }
  };

  const getEmployeePayslips = (employeeId: string): PayslipRecord[] => {
    return payslips.filter(p => p.employeeId === employeeId);
  };

  // Notification Operations
  const userNotifications = React.useMemo(() => {
    if (!user) return [];
    return notifications.filter(n => n.userId === user.employeeId || n.userId === 'all');
  }, [notifications, user]);

  const unreadNotificationCount = React.useMemo(() => {
    return userNotifications.filter(n => !n.read).length;
  }, [userNotifications]);

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => (n.userId === user.employeeId || n.userId === 'all' ? { ...n, read: true } : n))
      );
    } catch {
      setNotifications(prev =>
        prev.map(n => (n.userId === user.employeeId || n.userId === 'all' ? { ...n, read: true } : n))
      );
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const resetToDefaultData = async () => {
    await refreshData();
    info('Data Synchronized', 'Loaded latest data from backend server.');
  };

  return (
    <DataContext.Provider
      value={{
        isLoadingData,
        refreshData,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployeeById,
        attendanceRecords,
        todayUserAttendance,
        checkIn,
        checkOut,
        getEmployeeAttendance,
        getDailyAttendanceSummary,
        leaveRequests,
        applyLeave,
        approveLeave,
        rejectLeave,
        cancelLeave,
        getEmployeeLeaveBalance,
        getUserLeaveRequests,
        payslips,
        updateEmployeeSalary,
        getEmployeePayslips,
        notifications,
        userNotifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        addNotification,
        resetToDefaultData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
