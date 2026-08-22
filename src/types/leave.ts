export type LeaveType = 'Paid' | 'Sick' | 'Unpaid' | 'Casual' | 'Maternity/Paternity';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  avatar?: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string; // YYYY-MM-DD
  approvedBy?: string;
  reviewedAt?: string;
  adminComment?: string;
}

export interface LeaveBalance {
  paid: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  unpaid: { total: number; used: number; remaining: number };
  casual: { total: number; used: number; remaining: number };
}
