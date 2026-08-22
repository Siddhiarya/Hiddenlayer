export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'Leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // e.g. "09:15 AM"
  checkOut: string | null; // e.g. "05:45 PM"
  workingHours: number; // e.g. 8.5
  status: AttendanceStatus;
  notes?: string;
}

export interface DailyAttendanceSummary {
  present: number;
  absent: number;
  halfDay: number;
  onLeave: number;
  total: number;
}
