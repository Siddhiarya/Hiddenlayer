import { api, TOKEN_STORAGE_KEY } from './api';
import { User, UserRole } from '../types/auth';

export interface LoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export interface SignupResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, pass: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/login', { email, password: pass });
    if (res.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    }
    return res;
  },

  async signup(data: {
    employeeId: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<SignupResponse> {
    const res = await api.post<SignupResponse>('/auth/signup', data);
    if (res.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    }
    return res;
  },

  async verifyEmail(code: string, email?: string): Promise<{ success: boolean; message?: string }> {
    return api.post('/auth/verify-email', { code, email });
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    return api.get<{ success: boolean; user: User }>('/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  },
};
