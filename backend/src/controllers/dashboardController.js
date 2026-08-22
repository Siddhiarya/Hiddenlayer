const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Notification = require('../models/Notification');

const getTodayDateString = (dateObj = new Date()) => {
  return dateObj.toISOString().split('T')[0];
};

/**
 * @desc    Get Employee Dashboard overview
 * @route   GET /api/dashboard/employee
 * @access  Private (Employee, HR, Admin)
 */
const getEmployeeDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = getTodayDateString();

    // 1. Get user profile details
    const user = await User.findById(userId).select(
      'firstName lastName employeeId email jobTitle department joiningDate profilePicture salary salaryStructure'
    );

    // 2. Get today's attendance record
    const todayAttendance = await Attendance.findOne({ employee: userId, date: today });

    // 3. Weekly attendance summary
    const now = new Date();
    const dayOfWeek = now.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);
    const startDate = getTodayDateString(monday);

    const weeklyRecords = await Attendance.find({
      employee: userId,
      date: { $gte: startDate, $lte: today },
    });

    const weeklyHours = weeklyRecords.reduce((sum, r) => sum + (r.totalWorkingHours || 0), 0);
    const daysPresentThisWeek = weeklyRecords.filter((r) => r.status === 'present').length;

    // 4. Leave summary
    const [pendingLeavesCount, recentLeaves] = await Promise.all([
      Leave.countDocuments({ employee: userId, status: 'pending' }),
      Leave.find({ employee: userId }).sort({ createdAt: -1 }).limit(5),
    ]);

    // 5. Notifications
    const [unreadNotificationsCount, recentNotifications] = await Promise.all([
      Notification.countDocuments({ user: userId, isRead: false }),
      Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
    ]);

    res.status(200).json({
      success: true,
      message: 'Employee dashboard data retrieved successfully',
      data: {
        profile: user,
        attendanceToday: {
          date: today,
          isCheckedIn: !!todayAttendance?.checkIn,
          checkInTime: todayAttendance?.checkIn || null,
          isCheckedOut: !!todayAttendance?.checkOut,
          checkOutTime: todayAttendance?.checkOut || null,
          status: todayAttendance?.status || 'not_checked_in',
          workingHours: todayAttendance?.totalWorkingHours || 0,
        },
        weeklySummary: {
          weekStartDate: startDate,
          totalWorkingHours: Math.round(weeklyHours * 100) / 100,
          daysPresent: daysPresentThisWeek,
        },
        leaves: {
          pendingCount: pendingLeavesCount,
          recent: recentLeaves,
        },
        payroll: {
          currentSalary: user.salary,
          salaryStructure: user.salaryStructure,
        },
        notifications: {
          unreadCount: unreadNotificationsCount,
          recent: recentNotifications,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Admin/HR Dashboard overview
 * @route   GET /api/dashboard/admin
 * @access  Private (HR, Admin)
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const currentPayPeriod = today.substring(0, 7); // YYYY-MM

    // 1. Employee stats
    const [totalEmployees, activeEmployees, inactiveEmployees, onLeaveEmployees] = await Promise.all([
      User.countDocuments({ role: { $in: ['employee', 'hr'] } }),
      User.countDocuments({ employmentStatus: 'active', role: { $in: ['employee', 'hr'] } }),
      User.countDocuments({ employmentStatus: 'inactive' }),
      User.countDocuments({ employmentStatus: 'on_leave' }),
    ]);

    // Department breakdown
    const departmentStats = await User.aggregate([
      { $match: { employmentStatus: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $project: { department: '$_id', count: 1, _id: 0 } },
    ]);

    // 2. Today's Attendance stats
    const todayRecords = await Attendance.find({ date: today });
    const presentToday = todayRecords.filter((r) => r.status === 'present').length;
    const halfDayToday = todayRecords.filter((r) => r.status === 'half-day').length;
    const onLeaveToday = todayRecords.filter((r) => r.status === 'leave').length;
    const totalPresent = presentToday + halfDayToday;
    const absentToday = Math.max(0, activeEmployees - totalPresent - onLeaveToday);

    const attendanceRate = activeEmployees > 0 ? Math.round((totalPresent / activeEmployees) * 100) : 0;

    // 3. Leave approvals summary
    const [pendingLeavesCount, recentPendingLeaves] = await Promise.all([
      Leave.countDocuments({ status: 'pending' }),
      Leave.find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('employee', 'firstName lastName employeeId department profilePicture'),
    ]);

    // 4. Current Month Payroll overview
    const payrollRecords = await Payroll.find({ payPeriod: currentPayPeriod });
    const totalGrossPayout = payrollRecords.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
    const totalNetPayout = payrollRecords.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const processedPayrolls = payrollRecords.filter((p) => p.paymentStatus !== 'pending').length;

    // 5. Recent System Activities / Notifications
    const recentActivities = await Notification.find().sort({ createdAt: -1 }).limit(10).populate('user', 'firstName lastName employeeId');

    res.status(200).json({
      success: true,
      message: 'Admin dashboard data retrieved successfully',
      data: {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
          onLeave: onLeaveEmployees,
          byDepartment: departmentStats,
        },
        todayAttendance: {
          date: today,
          totalEmployees: activeEmployees,
          present: presentToday,
          halfDay: halfDayToday,
          onLeave: onLeaveToday,
          absent: absentToday,
          attendanceRate: `${attendanceRate}%`,
        },
        leaves: {
          pendingCount: pendingLeavesCount,
          recentPending: recentPendingLeaves,
        },
        payrollOverview: {
          payPeriod: currentPayPeriod,
          totalGrossPayout,
          totalNetPayout,
          processedPayrollsCount: processedPayrolls,
          totalEligibleEmployees: activeEmployees,
        },
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployeeDashboard,
  getAdminDashboard,
};
