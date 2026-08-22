const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// Helper to get formatted YYYY-MM-DD
const getTodayDateString = (dateObj = new Date()) => {
  return dateObj.toISOString().split('T')[0];
};

/**
 * @desc    Employee Check-in for today
 * @route   POST /api/attendance/check-in
 * @access  Private (Employee, HR, Admin)
 */
const checkIn = async (req, res, next) => {
  try {
    const today = req.body.date || getTodayDateString();
    const remarks = req.body.remarks || '';

    // Check if record already exists for this day
    const existing = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    if (existing && existing.checkIn) {
      return res.status(400).json({
        success: false,
        message: `You have already checked in for today (${today}) at ${existing.checkIn.toLocaleTimeString()}`,
        data: existing,
      });
    }

    const now = new Date();
    let attendanceRecord;

    if (existing) {
      // Update record if created previously by leave or admin
      existing.checkIn = now;
      existing.status = 'present';
      if (remarks) existing.remarks = remarks;
      attendanceRecord = await existing.save();
    } else {
      attendanceRecord = await Attendance.create({
        employee: req.user._id,
        employeeId: req.user.employeeId,
        date: today,
        checkIn: now,
        status: 'present',
        remarks,
      });
    }

    res.status(201).json({
      success: true,
      message: `Checked in successfully at ${now.toLocaleTimeString()}`,
      data: attendanceRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Employee Check-out for today
 * @route   POST /api/attendance/check-out
 * @access  Private (Employee, HR, Admin)
 */
const checkOut = async (req, res, next) => {
  try {
    const today = req.body.date || getTodayDateString();
    const remarks = req.body.remarks || '';

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today. Please check in first.',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: `You have already checked out for today (${today}) at ${attendance.checkOut.toLocaleTimeString()}`,
        data: attendance,
      });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.checkIn);
    const diffMs = checkOutTime - checkInTime;
    const workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // 2 decimal places

    attendance.checkOut = checkOutTime;
    attendance.totalWorkingHours = workingHours;
    if (remarks) {
      attendance.remarks = attendance.remarks ? `${attendance.remarks}; ${remarks}` : remarks;
    }

    // Determine status based on hours
    if (workingHours < 4) {
      attendance.status = 'half-day';
    } else {
      attendance.status = 'present';
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Checked out successfully. Total working hours: ${workingHours}h`,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's attendance records
 * @route   GET /api/attendance/me
 * @access  Private
 */
const getMyAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate, month, year, page = 1, limit = 31 } = req.query;

    const query = { employee: req.user._id };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (month && year) {
      const formattedMonth = String(month).padStart(2, '0');
      const start = `${year}-${formattedMonth}-01`;
      const end = `${year}-${formattedMonth}-31`;
      query.date = { $gte: start, $lte: end };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 31;
    const skip = (pageNum - 1) * limitNum;

    const [attendance, total] = await Promise.all([
      Attendance.find(query).sort({ date: -1 }).skip(skip).limit(limitNum),
      Attendance.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Attendance retrieved successfully',
      data: {
        attendance,
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
 * @desc    Get logged-in user's weekly attendance
 * @route   GET /api/attendance/me/weekly
 * @access  Private
 */
const getMyWeeklyAttendance = async (req, res, next) => {
  try {
    const referenceDate = req.query.date ? new Date(req.query.date) : new Date();

    // Calculate Monday of current week
    const dayOfWeek = referenceDate.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(referenceDate);
    monday.setDate(referenceDate.getDate() + distanceToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startDate = getTodayDateString(monday);
    const endDate = getTodayDateString(sunday);

    const records = await Attendance.find({
      employee: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const totalHours = records.reduce((sum, item) => sum + (item.totalWorkingHours || 0), 0);
    const daysPresent = records.filter((item) => item.status === 'present').length;
    const daysHalfDay = records.filter((item) => item.status === 'half-day').length;

    res.status(200).json({
      success: true,
      message: 'Weekly attendance retrieved successfully',
      data: {
        weekStart: startDate,
        weekEnd: endDate,
        totalWorkingHours: Math.round(totalHours * 100) / 100,
        daysPresent,
        daysHalfDay,
        records,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all attendance records (HR/Admin)
 * @route   GET /api/attendance
 * @access  Private (HR, Admin)
 */
const getAllAttendance = async (req, res, next) => {
  try {
    const {
      date,
      startDate,
      endDate,
      status,
      employeeId,
      department,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (status) {
      query.status = status;
    }

    if (employeeId) {
      query.employeeId = employeeId.toUpperCase();
    }

    // Filter by department through User relation if requested
    if (department) {
      const userIds = await User.find({ department }).select('_id');
      query.employee = { $in: userIds };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('employee', 'firstName lastName email department jobTitle profilePicture'),
      Attendance.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Attendance records retrieved successfully',
      data: {
        attendance,
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
 * @desc    Get attendance for a specific employee (HR/Admin)
 * @route   GET /api/attendance/employee/:employeeId
 * @access  Private (HR, Admin)
 */
const getEmployeeAttendance = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, month, year, page = 1, limit = 31 } = req.query;

    const user = await User.findOne({
      $or: [
        { employeeId: employeeId.toUpperCase() },
        ...(employeeId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: employeeId }] : []),
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const query = { employee: user._id };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (month && year) {
      const formattedMonth = String(month).padStart(2, '0');
      const start = `${year}-${formattedMonth}-01`;
      const end = `${year}-${formattedMonth}-31`;
      query.date = { $gte: start, $lte: end };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 31;
    const skip = (pageNum - 1) * limitNum;

    const [attendance, total] = await Promise.all([
      Attendance.find(query).sort({ date: -1 }).skip(skip).limit(limitNum),
      Attendance.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: `Attendance records for ${user.firstName} ${user.lastName} (${user.employeeId})`,
      data: {
        employee: {
          _id: user._id,
          employeeId: user.employeeId,
          firstName: user.firstName,
          lastName: user.lastName,
          department: user.department,
        },
        attendance,
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
 * @desc    Update attendance record (HR/Admin manual adjustment)
 * @route   PUT /api/attendance/:id
 * @access  Private (HR, Admin)
 */
const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, checkIn, checkOut, totalWorkingHours, remarks } = req.body;

    const record = await Attendance.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    if (status !== undefined) record.status = status;
    if (checkIn !== undefined) record.checkIn = checkIn;
    if (checkOut !== undefined) record.checkOut = checkOut;
    if (totalWorkingHours !== undefined) record.totalWorkingHours = totalWorkingHours;
    if (remarks !== undefined) record.remarks = remarks;

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getMyWeeklyAttendance,
  getAllAttendance,
  getEmployeeAttendance,
  updateAttendance,
};
