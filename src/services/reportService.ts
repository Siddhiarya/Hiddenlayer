import { api } from './api';
import { AttendanceRecord, DailyAttendanceSummary } from '../types/attendance';
import { LeaveRequest } from '../types/leave';

export const reportService = {
  async getAttendanceReport(): Promise<{
    success: boolean;
    summary: DailyAttendanceSummary;
    attendance: AttendanceRecord[];
  }> {
    return api.get<{
      success: boolean;
      summary: DailyAttendanceSummary;
      attendance: AttendanceRecord[];
    }>('/reports/attendance');
  },

  async getLeaveReport(): Promise<{
    success: boolean;
    count: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    leaves: LeaveRequest[];
  }> {
    return api.get<{
      success: boolean;
      count: number;
      approvedCount: number;
      pendingCount: number;
      rejectedCount: number;
      leaves: LeaveRequest[];
    }>('/reports/leave');
  },

  async getPayrollReport(): Promise<{
    success: boolean;
    totalGross: number;
    totalNet: number;
    totalDeductions: number;
    employeeCount: number;
    breakdown: any[];
  }> {
    return api.get<{
      success: boolean;
      totalGross: number;
      totalNet: number;
      totalDeductions: number;
      employeeCount: number;
      breakdown: any[];
    }>('/reports/payroll');
  },

  async getSummaryReport(): Promise<{
    success: boolean;
    totalEmployees: number;
    attendanceSummary: DailyAttendanceSummary;
    pendingLeavesCount: number;
  }> {
    return api.get<{
      success: boolean;
      totalEmployees: number;
      attendanceSummary: DailyAttendanceSummary;
      pendingLeavesCount: number;
    }>('/reports/summary');
  },
};
