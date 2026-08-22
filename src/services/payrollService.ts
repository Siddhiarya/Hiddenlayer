import { api } from './api';
import { PayslipRecord } from '../types/payroll';
import { Employee } from '../types/employee';

export const payrollService = {
  async getAll(employeeId?: string): Promise<{ success: boolean; count: number; payroll: PayslipRecord[] }> {
    const query = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : '';
    return api.get<{ success: boolean; count: number; payroll: PayslipRecord[] }>(`/payroll${query}`);
  },

  async getMyPayroll(): Promise<{ success: boolean; count: number; payroll: PayslipRecord[] }> {
    return api.get<{ success: boolean; count: number; payroll: PayslipRecord[] }>('/payroll/me');
  },

  async updateSalaryStructure(
    employeeId: string,
    salary: { basic: number; hra: number; allowances: number; deductions: number }
  ): Promise<{ success: boolean; message: string; employee: Employee }> {
    return api.put<{ success: boolean; message: string; employee: Employee }>(
      `/payroll/${employeeId}/salary`,
      salary
    );
  },
};
