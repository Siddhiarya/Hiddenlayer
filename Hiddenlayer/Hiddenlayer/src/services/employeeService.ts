import { api } from './api';
import { Employee } from '../types/employee';

export const employeeService = {
  async getAll(): Promise<{ success: boolean; count: number; employees: Employee[] }> {
    return api.get<{ success: boolean; count: number; employees: Employee[] }>('/employees');
  },

  async getMyProfile(): Promise<{ success: boolean; employee: Employee }> {
    return api.get<{ success: boolean; employee: Employee }>('/employees/me/profile');
  },

  async getById(id: string): Promise<{ success: boolean; employee: Employee }> {
    return api.get<{ success: boolean; employee: Employee }>(`/employees/${id}`);
  },

  async add(empData: Omit<Employee, 'id'>): Promise<{ success: boolean; message: string; employee: Employee }> {
    return api.post<{ success: boolean; message: string; employee: Employee }>('/employees', empData);
  },

  async update(id: string, updates: Partial<Employee>): Promise<{ success: boolean; message: string; employee: Employee }> {
    return api.put<{ success: boolean; message: string; employee: Employee }>(`/employees/${id}`, updates);
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/employees/${id}`);
  },
};
