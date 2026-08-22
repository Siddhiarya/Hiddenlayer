import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/auth';
import { authService } from '../services/authService';
import { TOKEN_STORAGE_KEY } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingVerificationEmail: string | null;
  login: (email: string, pass: string, remember?: boolean) => Promise<{ success: boolean; message?: string }>;
  signup: (data: {
    employeeId: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<{ success: boolean; message?: string }>;
  verifyEmail: (code: string) => Promise<{ success: boolean; message?: string }>;
  resendVerificationCode: () => Promise<void>;
  logout: () => void;
  switchUser: (employeeId: string) => Promise<void>;
  updateCurrentUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'dayflow_current_user';
const PENDING_EMAIL_KEY = 'dayflow_pending_verification_email';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedEmail = localStorage.getItem(PENDING_EMAIL_KEY);
        if (savedEmail) {
          setPendingVerificationEmail(savedEmail);
        }

        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
          try {
            const meRes = await authService.getMe();
            if (meRes.success && meRes.user) {
              setUser(meRes.user);
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(meRes.user));
              return;
            }
          } catch {
            // Token expired or invalid, fallback to re-login
            localStorage.removeItem(TOKEN_STORAGE_KEY);
          }
        }

        // Default to logging into demo employee account
        const demoLoginRes = await authService.login('employee@dayflow.com', 'employee123');
        if (demoLoginRes.success && demoLoginRes.user) {
          setUser(demoLoginRes.user);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoLoginRes.user));
        }
      } catch (e) {
        console.error('Error in auth initialization:', e);
        // Local fallback if server is unreachable
        const savedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string, remember = true): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await authService.login(email.trim().toLowerCase(), pass);
      if (res.success && res.user) {
        setUser(res.user);
        if (remember) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user));
        }
        return { success: true };
      }
      return { success: false, message: res.message || 'Authentication failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed. Please check credentials.' };
    }
  };

  const signup = async (data: {
    employeeId: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const trimmedEmail = data.email.trim().toLowerCase();
      setPendingVerificationEmail(trimmedEmail);
      localStorage.setItem(PENDING_EMAIL_KEY, trimmedEmail);

      const res = await authService.signup(data);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Signup failed.' };
    }
  };

  const verifyEmail = async (code: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await authService.verifyEmail(code, pendingVerificationEmail || undefined);
      if (res.success) {
        localStorage.removeItem(PENDING_EMAIL_KEY);
        setPendingVerificationEmail(null);
        return { success: true };
      }
      return { success: false, message: res.message || 'Invalid code' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Verification failed.' };
    }
  };

  const resendVerificationCode = async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const switchUser = async (employeeId: string) => {
    const credsMap: Record<string, { email: string; pass: string }> = {
      'DF-1001': { email: 'employee@dayflow.com', pass: 'employee123' },
      'DF-1002': { email: 'admin@dayflow.com', pass: 'admin123' },
      'DF-1003': { email: 'hr@dayflow.com', pass: 'hr123' },
    };

    const target = credsMap[employeeId] || { email: 'employee@dayflow.com', pass: 'employee123' };
    try {
      const res = await authService.login(target.email, target.pass);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  const updateCurrentUser = (updated: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updated };
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        pendingVerificationEmail,
        login,
        signup,
        verifyEmail,
        resendVerificationCode,
        logout,
        switchUser,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
