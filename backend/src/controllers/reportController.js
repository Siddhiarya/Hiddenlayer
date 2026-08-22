const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');

/**
 * @desc    Get Attendance Analytics & Reports
 * @route   GET /api/reports/attendance
 * @access  Private (HR, Admin)
 */
const getAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department, employeeId } = req.query;

    const matchQuery = {};

    if (startDate && endDate) {
      matchQuery.date = { $gte: startDate, $lte: endDate };
    }

    if (employeeId) {
      matchQuery.employeeId = employeeId.toUpperCase();
    }

    if (department) {
      const users = await User.find({ department }).select('_id');
      matchQuery.employee = { $in: users.map((u) => u._id) };
    }

    // Status breakdown
    const statusSummary = await Attendance.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 }, totalHours: { $sum: '$totalWorkingHours' } } },
      { $project: { status: '$_id', count: 1, totalHours: { $round: ['$totalHours', 2] }, _id: 0 } },
    ]);

    // Daily attendance trend
    const dailyTrend = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$date',
          presentCount: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          halfDayCount: { $sum: { $cond: [{ $eq: ['$status', 'half-day'] }, 1, 0] } },
          leaveCount: { $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] } },
          totalHours: { $sum: '$totalWorkingHours' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          presentCount: 1,
          halfDayCount: 1,
          leaveCount: 1,
          totalHours: { $round: ['$totalHours', 2] },
          _id: 0,
        },
      },
    ]);

    // Total records count
    const totalRecords = await Attendance.countDocuments(matchQuery);

    res.status(200).json({
      success: true,
      message: 'Attendance report generated successfully',
      data: {
        filter: { startDate, endDate, department, employeeId },
        totalRecords,
        statusSummary,
        dailyTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Leave Analytics & Reports
 * @route   GET /api/reports/leave
 * @access  Private (HR, Admin)
 */
const getLeaveReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department, status } = req.query;

    const matchQuery = {};

    if (startDate && endDate) {
      matchQuery.startDate = { $gte: new Date(startDate) };
      matchQuery.endDate = { $lte: new Date(endDate) };
    }

    if (status) {
      matchQuery.status = status;
    }

    if (department) {
      const users = await User.find({ department }).select('_id');
      matchQuery.employee = { $in: users.map((u) => u._id) };
    }

    // Leave type breakdown
    const byType = await Leave.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' },
        },
      },
      { $project: { leaveType: '$_id', count: 1, totalDays: 1, _id: 0 } },
    ]);

    // Leave status breakdown
    const byStatus = await Leave.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' },
        },
      },
      { $project: { status: '$_id', count: 1, totalDays: 1, _id: 0 } },
    ]);

    const totalRequests = await Leave.countDocuments(matchQuery);

    res.status(200).json({
      success: true,
      message: 'Leave report generated successfully',
      data: {
        filter: { startDate, endDate, department, status },
        totalRequests,
        byType,
        byStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Payroll Analytics & Reports
 * @route   GET /api/reports/payroll
 * @access  Private (HR, Admin)
 */
const getPayrollReport = async (req, res, next) => {
  try {
    const { payPeriod, department } = req.query;

    const matchQuery = {};
    if (payPeriod) matchQuery.payPeriod = payPeriod;

    if (department) {
      const users = await User.find({ department }).select('_id');
      matchQuery.employee = { $in: users.map((u) => u._id) };
    }

    const payrollSummary = await Payroll.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$payPeriod',
          totalGrossSalary: { $sum: '$grossSalary' },
          totalNetSalary: { $sum: '$netSalary' },
          totalBasicSalary: { $sum: '$basicSalary' },
          count: { $sum: 1 },
          avgNetSalary: { $avg: '$netSalary' },
        },
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          payPeriod: '$_id',
          totalGrossSalary: 1,
          totalNetSalary: 1,
          totalBasicSalary: 1,
          count: 1,
          avgNetSalary: { $round: ['$avgNetSalary', 2] },
          _id: 0,
        },
      },
    ]);

    // Payment Status breakdown
    const byStatus = await Payroll.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalNetSalary: { $sum: '$netSalary' },
        },
      },
      { $project: { status: '$_id', count: 1, totalNetSalary: 1, _id: 0 } },
    ]);

    res.status(200).json({
      success: true,
      message: 'Payroll report generated successfully',
      data: {
        filter: { payPeriod, department },
        payrollSummary,
        byStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Employee Demographic and Headcount Summary
 * @route   GET /api/reports/employee-summary
 * @access  Private (HR, Admin)
 */
const getEmployeeSummaryReport = async (req, res, next) => {
  try {
    const [departmentSummary, statusSummary, roleSummary, genderSummary, totalEmployees] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $project: { department: '$_id', count: 1, _id: 0 } },
      ]),
      User.aggregate([
        { $group: { _id: '$employmentStatus', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $project: { role: '$_id', count: 1, _id: 0 } },
      ]),
      User.aggregate([
        { $group: { _id: { $ifNull: ['$gender', 'unspecified'] }, count: { $sum: 1 } } },
        { $project: { gender: '$_id', count: 1, _id: 0 } },
      ]),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      message: 'Employee summary report generated successfully',
      data: {
        totalEmployees,
        departmentSummary,
        statusSummary,
        roleSummary,
        genderSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getEmployeeSummaryReport,
};
