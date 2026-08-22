const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { createNotification, notifyAdmins } = require('../services/notificationService');

/**
 * Helper to calculate working days between two dates
 */
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

/**
 * Helper to get all dates between startDate and endDate in YYYY-MM-DD
 */
const getDateRangeArray = (startDate, endDate) => {
  const dates = [];
  const curr = new Date(startDate);
  const end = new Date(endDate);

  while (curr <= end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

/**
 * @desc    Apply for leave (Employee)
 * @route   POST /api/leaves
 * @access  Private
 */
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, remarks = '' } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    const numberOfDays = calculateDays(startDate, endDate);

    // Check for overlapping leaves for the same employee
    const overlapping = await Leave.findOne({
      employee: req.user._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${overlapping.status} leave request from ${overlapping.startDate.toISOString().split('T')[0]} to ${overlapping.endDate.toISOString().split('T')[0]}.`,
      });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      employeeId: req.user.employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays,
      remarks,
      status: 'pending',
    });

    // Notify HR / Admins
    await notifyAdmins(
      'New Leave Request',
      `${req.user.firstName || req.user.employeeId} applied for ${numberOfDays} day(s) of ${leaveType} leave.`,
      'leave_applied',
      `/leaves/${leave._id}`
    );

    // Notify Employee
    await createNotification(
      req.user._id,
      'Leave Application Submitted',
      `Your request for ${numberOfDays} day(s) of ${leaveType} leave has been submitted for approval.`,
      'leave_applied'
    );

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's leave requests
 * @route   GET /api/leaves/me
 * @access  Private
 */
const getMyLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, page = 1, limit = 20 } = req.query;

    const query = { employee: req.user._id };
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [leaves, total] = await Promise.all([
      Leave.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('reviewedBy', 'firstName lastName employeeId'),
      Leave.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Leave requests retrieved successfully',
      data: {
        leaves,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single leave request details
 * @route   GET /api/leaves/:id
 * @access  Private
 */
const getLeaveById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id)
      .populate('employee', 'firstName lastName email department jobTitle profilePicture')
      .populate('reviewedBy', 'firstName lastName employeeId email');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    // Restrict employee from viewing other users' leaves
    if (req.user.role === 'employee' && leave.employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own leave requests.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Leave request details retrieved successfully',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel / delete pending leave request (Employee)
 * @route   DELETE /api/leaves/:id
 * @access  Private
 */
const deleteLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    // Verify ownership
    if (req.user.role === 'employee' && leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own leave requests.',
      });
    }

    if (leave.status !== 'pending' && req.user.role === 'employee') {
      return res.status(400).json({
        success: false,
        message: 'You can only cancel leave requests that are in pending status.',
      });
    }

    await Leave.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all leave requests (HR/Admin)
 * @route   GET /api/leaves
 * @access  Private (HR, Admin)
 */
const getAllLeaves = async (req, res, next) => {
  try {
    const {
      status,
      leaveType,
      employeeId,
      department,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (employeeId) query.employeeId = employeeId.toUpperCase();

    if (department) {
      const userIds = await User.find({ department }).select('_id');
      query.employee = { $in: userIds };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [leaves, total] = await Promise.all([
      Leave.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('employee', 'firstName lastName email department jobTitle profilePicture')
        .populate('reviewedBy', 'firstName lastName employeeId'),
      Leave.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'All leave requests retrieved successfully',
      data: {
        leaves,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or Reject leave request (HR/Admin)
 * @route   PUT /api/leaves/:id/status (or /api/leaves/:id/approve, /api/leaves/:id/reject)
 * @access  Private (HR, Admin)
 */
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminComment = '' } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected.',
      });
    }

    const leave = await Leave.findById(id).populate('employee', 'firstName lastName email employeeId');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    // Prevent approving/rejecting own leave request if logged in user is the employee
    if (leave.employee._id.toString() === req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You cannot approve or reject your own leave request.',
      });
    }

    const previousStatus = leave.status;
    leave.status = status;
    leave.adminComment = adminComment;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    const dateList = getDateRangeArray(leave.startDate, leave.endDate);

    // If Approved, reflect in attendance records
    if (status === 'approved') {
      for (const dateStr of dateList) {
        await Attendance.findOneAndUpdate(
          { employee: leave.employee._id, date: dateStr },
          {
            $set: {
              employee: leave.employee._id,
              employeeId: leave.employeeId,
              date: dateStr,
              status: 'leave',
              remarks: `Approved Leave: ${leave.leaveType.toUpperCase()} - ${adminComment || 'Authorized'}`,
            },
          },
          { upsert: true, new: true }
        );
      }
    } else if (status === 'rejected' && previousStatus === 'approved') {
      // If changed from approved to rejected, remove 'leave' status from attendance
      for (const dateStr of dateList) {
        const att = await Attendance.findOne({ employee: leave.employee._id, date: dateStr });
        if (att && att.status === 'leave') {
          await Attendance.findByIdAndDelete(att._id);
        }
      }
    }

    // Send notification to employee
    await createNotification(
      leave.employee._id,
      `Leave Request ${status.toUpperCase()}`,
      `Your ${leave.leaveType} leave request for ${dateList.length} day(s) has been ${status}.${adminComment ? ` Remark: ${adminComment}` : ''}`,
      'leave_status',
      `/leaves/${leave._id}`
    );

    res.status(200).json({
      success: true,
      message: `Leave request has been ${status} successfully.`,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Convenient aliases for approve and reject
 */
const approveLeave = async (req, res, next) => {
  req.body.status = 'approved';
  return updateLeaveStatus(req, res, next);
};

const rejectLeave = async (req, res, next) => {
  req.body.status = 'rejected';
  return updateLeaveStatus(req, res, next);
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getLeaveById,
  deleteLeave,
  getAllLeaves,
  updateLeaveStatus,
  approveLeave,
  rejectLeave,
};
