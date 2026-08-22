import { Request, Response } from 'express';
import { db } from '../data/db.js';
import { LeaveType, WeeklyAttendanceSummary } from '../models/types.js';

/**
 * Helper to get authenticated employee ID from request.
 */
const getAuthEmployeeId = (req: Request): string => {
  return req.user?.employeeId || '';
};

// ==========================================
// PROFILE MANAGEMENT
// ==========================================

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = getAuthEmployeeId(req);
    const employee = db.getEmployeeById(employeeId);

    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee profile not found.' });
      return;
    }

    const { password: _, ...safeProfile } = employee;

    res.status(200).json({
      success: true,
      data: safeProfile
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee profile.',
      error: error.message
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = getAuthEmployeeId(req);
    const { phone, address, profilePicture } = req.body;

    // Strict validation: Only phone, address, profilePicture can be updated by employee
    if (phone === undefined && address === undefined && profilePicture === undefined) {
      res.status(400).json({
        success: false,
        message: 'No valid fields provided for update. Allowed fields: phone, address, profilePicture.'
      });
      return;
    }

    if (phone !== undefined && (typeof phone !== 'string' || phone.trim().length < 7)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number (minimum 7 characters).'
      });
      return;
    }

    if (address !== undefined && (typeof address !== 'string' || address.trim().length < 5)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid address (minimum 5 characters).'
      });
      return;
    }

    const updatedEmployee = db.updateEmployeeProfile(employeeId, {
      phone,
      address,
      profilePicture
    });

    if (!updatedEmployee) {
      res.status(404).json({ success: false, message: 'Employee not found.' });
      return;
    }

    const { password: _, ...safeProfile } = updatedEmployee;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: safeProfile
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update employee profile.',
      error: error.message
    });
  }
};

// ==========================================
// ATTENDANCE MANAGEMENT
// ==========================================

export const checkIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = getAuthEmployeeId(req);
    const today = new Date().toISOString().split('T')[0];
    const checkInTime = new Date().toISOString();

    const record = db.checkIn(employeeId, today, checkInTime);

    res.status(200).json({
      success: true,
      message: 'Checked in successfully. Have a productive workday!',
      data: record
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Check-in failed.'
    });
  }
};

export const checkOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = getAuthEmployeeId(req);
    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date().toISOString();

    const record = db.checkOut(employeeId, today, checkOutTime);

    res.status(200).json({
      success: true,
      message: `Checked out successfully! Total working hours: ${record.workingHours} hrs.`,
      data: record
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Check-out failed.'
    });
  }
};

export const deleteTodayAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = getAuthEmployeeId(req);
    const today = new Date().toISOString().split('T')[0];
    db.deleteAttendanceForDate(employeeId, today);
    res.status(200).json({ success: true, message: 'Today attendance reset.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = getAuthEmployeeId(req);
    const records = db.getAttendanceByEmployee(employeeId);
    
    // Sort descending by date
    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Get today's record if any
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = records.find(r => r.date === todayStr);

    res.status(200).json({
      success: true,
      data: {
        records: sorted,
        today: todayRecord || null
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance history.',
      error: error.message
    });
  }
};

export const getWeeklyAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = getAuthEmployeeId(req);
    const records = db.getAttendanceByEmployee(employeeId);

    // Calculate current week's Monday to Friday/Sunday
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = (currentDay + 6) % 7;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const mondayStr = monday.toISOString().split('T')[0];
    const sundayStr = sunday.toISOString().split('T')[0];

    const weekRecords = records.filter(r => r.date >= mondayStr && r.date <= sundayStr);

    let presentDays = 0;
    let absentDays = 0;
    let halfDays = 0;
    let leaveDays = 0;
    let totalWorkingHours = 0;

    weekRecords.forEach(r => {
      if (r.status === 'Present') presentDays++;
      else if (r.status === 'Absent') absentDays++;
      else if (r.status === 'Half-day') halfDays++;
      else if (r.status === 'Leave') leaveDays++;

      if (r.workingHours) {
        totalWorkingHours += r.workingHours;
      }
    });

    const summary: WeeklyAttendanceSummary = {
      weekStart: mondayStr,
      weekEnd: sundayStr,
      totalWorkingDays: 5,
      presentDays,
      absentDays,
      halfDays,
      leaveDays,
      totalWorkingHours: Number(totalWorkingHours.toFixed(1))
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate weekly attendance summary.',
      error: error.message
    });
  }
};

// ==========================================
// LEAVE MANAGEMENT
// ==========================================

export const getLeaves = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = getAuthEmployeeId(req);
    const leaves = db.getLeavesByEmployee(employeeId);
    const balance = db.getLeaveBalance(employeeId);

    // Sort descending by createdAt
    const sorted = [...leaves].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      success: true,
      data: {
        leaves: sorted,
        balance
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave records.',
      error: error.message
    });
  }
};

export const applyLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = getAuthEmployeeId(req);
    const employee = db.getEmployeeById(employeeId);
    const { leaveType, startDate, endDate, remarks } = req.body;

    // Validate inputs
    const validLeaveTypes: LeaveType[] = ['Paid Leave', 'Sick Leave', 'Unpaid Leave'];
    if (!validLeaveTypes.includes(leaveType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid leave type. Must be Paid Leave, Sick Leave, or Unpaid Leave.'
      });
      return;
    }

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Start date and end date are required.'
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format provided.'
      });
      return;
    }

    if (start > end) {
      res.status(400).json({
        success: false,
        message: 'Start date cannot be after the end date.'
      });
      return;
    }

    if (!remarks || remarks.trim().length < 5) {
      res.status(400).json({
        success: false,
        message: 'Please provide a clear reason / remarks (minimum 5 characters).'
      });
      return;
    }

    // Check for overlapping active leaves
    const existingLeaves = db.getLeavesByEmployee(employeeId);
    const hasOverlap = existingLeaves.some(l => {
      if (l.status === 'Rejected') return false;
      const lStart = new Date(l.startDate);
      const lEnd = new Date(l.endDate);
      return (start <= lEnd && end >= lStart);
    });

    if (hasOverlap) {
      res.status(400).json({
        success: false,
        message: 'You already have an active (Pending or Approved) leave request overlapping with the selected dates.'
      });
      return;
    }

    // Calculate number of working days between start and end (excluding weekends)
    let daysCount = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        daysCount++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (daysCount === 0) {
      daysCount = 1; // Default minimum 1 day if single day or weekend specified
    }

    const newLeave = db.createLeaveRequest({
      employeeId,
      employeeName: employee?.name || 'Employee',
      leaveType,
      startDate,
      endDate,
      numberOfDays: daysCount,
      remarks: remarks.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully. Pending HR/Admin review.',
      data: newLeave
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit leave request.',
      error: error.message
    });
  }
};

// ==========================================
// PAYROLL MANAGEMENT (READ ONLY)
// ==========================================

export const getPayroll = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = getAuthEmployeeId(req);
    const employee = db.getEmployeeById(employeeId);

    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found.' });
      return;
    }

    const records = db.getPayrollsByEmployee(employeeId);

    res.status(200).json({
      success: true,
      data: {
        salaryStructure: employee.salary,
        payrolls: records
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll details.',
      error: error.message
    });
  }
};
