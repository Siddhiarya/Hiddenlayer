import {
  EmployeeProfile,
  AttendanceRecord,
  WeeklyAttendanceSummary,
  LeaveRequest,
  LeaveBalance,
  PayrollRecord,
  ApiResponse,
  LeaveType
} from '../../../types/employee';

const BASE_URL = '/api/employee';

const getHeaders = () => {
  const token = localStorage.getItem('dayflow_auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${response.status}`,
        error: data.error
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to parse server response'
    };
  }
};

export const employeeApi = {
  // Profile
  async getProfile(): Promise<ApiResponse<EmployeeProfile>> {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse<EmployeeProfile>(res);
  },

  async updateProfile(updates: {
    phone?: string;
    address?: string;
    profilePicture?: string;
  }): Promise<ApiResponse<EmployeeProfile>> {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse<EmployeeProfile>(res);
  },

  // Attendance
  async checkIn(): Promise<ApiResponse<AttendanceRecord>> {
    const res = await fetch(`${BASE_URL}/attendance/check-in`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse<AttendanceRecord>(res);
  },

  async checkOut(): Promise<ApiResponse<AttendanceRecord>> {
    const res = await fetch(`${BASE_URL}/attendance/check-out`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse<AttendanceRecord>(res);
  },

  async getAttendance(): Promise<ApiResponse<{ records: AttendanceRecord[]; today: AttendanceRecord | null }>> {
    const res = await fetch(`${BASE_URL}/attendance`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse<{ records: AttendanceRecord[]; today: AttendanceRecord | null }>(res);
  },

  async getWeeklyAttendance(): Promise<ApiResponse<WeeklyAttendanceSummary>> {
    const res = await fetch(`${BASE_URL}/attendance/weekly`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse<WeeklyAttendanceSummary>(res);
  },

  // Leaves
  async getLeaves(): Promise<ApiResponse<{ leaves: LeaveRequest[]; balance: LeaveBalance }>> {
    const res = await fetch(`${BASE_URL}/leaves`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse<{ leaves: LeaveRequest[]; balance: LeaveBalance }>(res);
  },

  async applyLeave(leaveData: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    remarks: string;
  }): Promise<ApiResponse<LeaveRequest>> {
    const res = await fetch(`${BASE_URL}/leaves`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(leaveData)
    });
    return handleResponse<LeaveRequest>(res);
  },

  // Payroll
  async getPayroll(): Promise<ApiResponse<{ salaryStructure: EmployeeProfile['salary']; payrolls: PayrollRecord[] }>> {
    const res = await fetch(`${BASE_URL}/payroll`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse<{ salaryStructure: EmployeeProfile['salary']; payrolls: PayrollRecord[] }>(res);
  }
};
