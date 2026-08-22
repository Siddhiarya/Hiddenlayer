import { api } from './api';
import { LeaveRequest, LeaveBalance, LeaveType } from '../types/leave';

export const leaveService = {
  async getAll(employeeId?: string): Promise<{ success: boolean; count: number; leaves: LeaveRequest[] }> {
    const query = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : '';
    return api.get<{ success: boolean; count: number; leaves: LeaveRequest[] }>(`/leaves${query}`);
  },

  async getMyLeaves(): Promise<{ success: boolean; count: number; leaves: LeaveRequest[] }> {
    return api.get<{ success: boolean; count: number; leaves: LeaveRequest[] }>('/leaves/me');
  },

  async getBalance(employeeId: string): Promise<{ success: boolean; balance: LeaveBalance }> {
    return api.get<{ success: boolean; balance: LeaveBalance }>(`/leaves/balance/${employeeId}`);
  },

  async apply(data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }): Promise<{ success: boolean; message: string; leave: LeaveRequest }> {
    return api.post<{ success: boolean; message: string; leave: LeaveRequest }>('/leaves', data);
  },

  async approve(id: string, comment?: string): Promise<{ success: boolean; message: string; leave: LeaveRequest }> {
    return api.put<{ success: boolean; message: string; leave: LeaveRequest }>(`/leaves/${id}/approve`, { comment });
  },

  async reject(id: string, comment: string): Promise<{ success: boolean; message: string; leave: LeaveRequest }> {
    return api.put<{ success: boolean; message: string; leave: LeaveRequest }>(`/leaves/${id}/reject`, { comment });
  },

  async cancel(id: string): Promise<{ success: boolean; message: string; leave: LeaveRequest }> {
    return api.put<{ success: boolean; message: string; leave: LeaveRequest }>(`/leaves/${id}/cancel`);
  },
};
