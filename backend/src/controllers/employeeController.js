const User = require('../models/User');

/**
 * @desc    Get current authenticated user's full profile
 * @route   GET /api/employees/me
 * @access  Private (Employee, HR, Admin)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('manager', 'firstName lastName employeeId email jobTitle');
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user's profile (restricted fields for employees)
 * @route   PUT /api/employees/me
 * @access  Private (Employee, HR, Admin)
 */
const updateMe = async (req, res, next) => {
  try {
    const { phone, address, gender, dateOfBirth, firstName, lastName, profilePicture } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Only allow updating safe fields
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    if (address !== undefined) {
      if (typeof address === 'object') {
        user.address = { ...user.address.toObject(), ...address };
      } else if (typeof address === 'string') {
        user.address.street = address;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload profile picture / avatar
 * @route   POST /api/employees/me/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file.',
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findById(req.user._id);
    user.profilePicture = avatarUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all employees (with filters, search & pagination)
 * @route   GET /api/employees
 * @access  Private (HR, Admin)
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const {
      search,
      department,
      role,
      employmentStatus,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by employmentStatus
    if (employmentStatus) {
      query.employmentStatus = employmentStatus;
    }

    // Search by name, email, or employeeId
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { jobTitle: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [employees, total] = await Promise.all([
      User.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate('manager', 'firstName lastName employeeId email'),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Employees retrieved successfully',
      data: {
        employees,
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
 * @desc    Get single employee details
 * @route   GET /api/employees/:id
 * @access  Private (HR, Admin, or Self)
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Allow employee to view self if ID matches their own
    if (req.user.role === 'employee' && req.user._id.toString() !== id && req.user.employeeId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.',
      });
    }

    let employee;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await User.findById(id).populate('manager', 'firstName lastName employeeId email jobTitle');
    } else {
      employee = await User.findOne({ employeeId: id.toUpperCase() }).populate('manager', 'firstName lastName employeeId email jobTitle');
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee details retrieved successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee details by HR/Admin
 * @route   PUT /api/employees/:id
 * @access  Private (HR, Admin)
 */
const updateEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      gender,
      dateOfBirth,
      jobTitle,
      department,
      joiningDate,
      employmentStatus,
      role,
      manager,
      salary,
      salaryStructure,
      emailVerified,
    } = req.body;

    let user;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(id);
    } else {
      user = await User.findOne({ employeeId: id.toUpperCase() });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Only admin can change roles or promote to admin
    if (role && role !== user.role) {
      if (req.user.role !== 'admin' && role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only Administrators can assign the Admin role.',
        });
      }
      user.role = role;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (department !== undefined) user.department = department;
    if (joiningDate !== undefined) user.joiningDate = joiningDate;
    if (employmentStatus !== undefined) user.employmentStatus = employmentStatus;
    if (manager !== undefined) user.manager = manager || null;
    if (emailVerified !== undefined) user.emailVerified = emailVerified;

    if (address !== undefined) {
      if (typeof address === 'object') {
        user.address = { ...user.address.toObject(), ...address };
      } else if (typeof address === 'string') {
        user.address.street = address;
      }
    }

    if (salaryStructure !== undefined) {
      user.salaryStructure = {
        ...user.salaryStructure.toObject(),
        ...salaryStructure,
      };
      user.calculateSalary();
    } else if (salary !== undefined) {
      user.salary = salary;
      user.salaryStructure.basicSalary = salary;
      user.calculateSalary();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete / Deactivate employee
 * @route   DELETE /api/employees/:id
 * @access  Private (Admin only)
 */
const deleteEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Prevent admin from deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Employee ${user.employeeId} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  uploadAvatar,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeById,
  deleteEmployeeById,
};
