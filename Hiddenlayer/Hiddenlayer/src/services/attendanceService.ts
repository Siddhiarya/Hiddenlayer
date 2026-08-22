import { api } from './api';
import { AttendanceRecord, DailyAttendanceSummary } from '../types/attendance';

export const attendanceService = {
  async getAll(employeeId?: string): Promise<{ success: boolean; count: number; attendance: AttendanceRecord[] }> {
    const query = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : '';
    return api.get<{ success: boolean; count: number; attendance: AttendanceRecord[] }>(`/attendance${query}`);
  },

  async getMyAttendance(): Promise<{ success: boolean; count: number; attendance: AttendanceRecord[] }> {
    return api.get<{ success: boolean; count: number; attendance: AttendanceRecord[] }>('/attendance/me');
  },

  async getToday(): Promise<{ success: boolean; attendance: AttendanceRecord | null }> {
    return api.get<{ success: boolean; attendance: AttendanceRecord | null }>('/attendance/today');
  },

  async checkIn(): Promise<{ success: boolean; message: string; attendance: AttendanceRecord }> {
    return api.post<{ success: boolean; message: string; attendance: AttendanceRecord }>('/attendance/check-in');
  },

  async checkOut(): Promise<{ success: boolean; message: string; attendance: AttendanceRecord }> {
    return api.post<{ success: boolean; message: string; attendance: AttendanceRecord }>('/attendance/check-out');
  },

  async getSummary(): Promise<{ success: boolean; summary: DailyAttendanceSummary }> {
    return api.get<{ success: boolean; summary: DailyAttendanceSummary }>('/attendance/summary');
  },
};
