const Payroll = require('../models/Payroll');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Get logged-in user's salary structure and payroll history
 * @route   GET /api/payroll/me
 * @access  Private (Employee, HR, Admin)
 */
const getMyPayroll = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('salary salaryStructure employeeId firstName lastName department jobTitle');
    const payrollHistory = await Payroll.find({ employee: req.user._id }).sort({ payPeriod: -1 });

    res.status(200).json({
      success: true,
      message: 'Payroll details retrieved successfully',
      data: {
        salaryStructure: user.salaryStructure,
        currentSalary: user.salary,
        payrollHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all employee payroll records (HR/Admin)
 * @route   GET /api/payroll
 * @access  Private (HR, Admin)
 */
const getAllPayrolls = async (req, res, next) => {
  try {
    const {
      payPeriod,
      paymentStatus,
      employeeId,
      department,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};
    if (payPeriod) query.payPeriod = payPeriod;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (employeeId) query.employeeId = employeeId.toUpperCase();

    if (department) {
      const userIds = await User.find({ department }).select('_id');
      query.employee = { $in: userIds };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [payrolls, total] = await Promise.all([
      Payroll.find(query)
        .sort({ payPeriod: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('employee', 'firstName lastName email department jobTitle')
        .populate('updatedBy', 'firstName lastName employeeId'),
      Payroll.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Payroll records retrieved successfully',
      data: {
        payrolls,
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
 * @desc    Get payroll details and history of a specific employee (HR/Admin)
 * @route   GET /api/payroll/employee/:employeeId
 * @access  Private (HR, Admin)
 */
const getEmployeePayroll = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

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

    const payrollHistory = await Payroll.find({ employee: user._id }).sort({ payPeriod: -1 });

    res.status(200).json({
      success: true,
      message: `Payroll details for ${user.firstName} ${user.lastName} (${user.employeeId})`,
      data: {
        employee: {
          _id: user._id,
          employeeId: user.employeeId,
          firstName: user.firstName,
          lastName: user.lastName,
          department: user.department,
          jobTitle: user.jobTitle,
        },
        salaryStructure: user.salaryStructure,
        currentSalary: user.salary,
        payrollHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee salary structure (HR/Admin)
 * @route   PUT /api/payroll/employee/:employeeId
 * @access  Private (HR, Admin)
 */
const updateSalaryStructure = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { basicSalary, allowances, deductions } = req.body;

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

    if (basicSalary !== undefined) {
      user.salaryStructure.basicSalary = Number(basicSalary);
    }
    if (allowances !== undefined) {
      user.salaryStructure.allowances = {
        ...user.salaryStructure.allowances.toObject(),
        ...allowances,
      };
    }
    if (deductions !== undefined) {
      user.salaryStructure.deductions = {
        ...user.salaryStructure.deductions.toObject(),
        ...deductions,
      };
    }

    user.calculateSalary();
    await user.save();

    // Create notification
    await createNotification(
      user._id,
      'Salary Structure Updated',
      `Your salary structure has been updated by HR. Net monthly salary: $${user.salary}`,
      'payroll',
      '/payroll'
    );

    res.status(200).json({
      success: true,
      message: 'Salary structure updated successfully',
      data: {
        employeeId: user.employeeId,
        salaryStructure: user.salaryStructure,
        netSalary: user.salary,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate monthly payroll record(s) (HR/Admin)
 * @route   POST /api/payroll/generate
 * @access  Private (HR, Admin)
 */
const generatePayroll = async (req, res, next) => {
  try {
    const { payPeriod, employeeId, paymentStatus = 'processed', paymentDate, remarks } = req.body;

    if (!payPeriod) {
      return res.status(400).json({
        success: false,
        message: 'Pay period (YYYY-MM) is required.',
      });
    }

    const query = { employmentStatus: { $in: ['active', 'on_leave'] } };
    if (employeeId) {
      query.employeeId = employeeId.toUpperCase();
    }

    const targetEmployees = await User.find(query);
    if (!targetEmployees.length) {
      return res.status(404).json({
        success: false,
        message: 'No eligible employees found for payroll generation.',
      });
    }

    const createdRecords = [];

    for (const emp of targetEmployees) {
      const basic = emp.salaryStructure?.basicSalary || emp.salary || 0;
      const allowances = emp.salaryStructure?.allowances || {};
      const deductions = emp.salaryStructure?.deductions || {};

      const totalAllowances =
        (Number(allowances.hra) || 0) +
        (Number(allowances.da) || 0) +
        (Number(allowances.specialAllowance) || 0) +
        (Number(allowances.other) || 0);

      const totalDeductions =
        (Number(deductions.pf) || 0) +
        (Number(deductions.tax) || 0) +
        (Number(deductions.insurance) || 0) +
        (Number(deductions.other) || 0);

      const grossSalary = basic + totalAllowances;
      const netSalary = Math.max(0, grossSalary - totalDeductions);

      const record = await Payroll.findOneAndUpdate(
        { employee: emp._id, payPeriod },
        {
          $set: {
            employee: emp._id,
            employeeId: emp.employeeId,
            payPeriod,
            basicSalary: basic,
            allowances,
            deductions,
            grossSalary,
            netSalary,
            paymentStatus,
            paymentDate: paymentDate || new Date(),
            remarks: remarks || `Payroll for ${payPeriod}`,
            updatedBy: req.user._id,
          },
        },
        { upsert: true, new: true }
      );

      // Notify employee
      await createNotification(
        emp._id,
        `Payslip Available for ${payPeriod}`,
        `Your salary slip for ${payPeriod} has been generated. Net Salary: $${netSalary}`,
        'payroll',
        '/payroll'
      );

      createdRecords.push(record);
    }

    res.status(200).json({
      success: true,
      message: `Generated ${createdRecords.length} payroll record(s) for period ${payPeriod}.`,
      data: createdRecords,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyPayroll,
  getAllPayrolls,
  getEmployeePayroll,
  updateSalaryStructure,
  generatePayroll,
};
