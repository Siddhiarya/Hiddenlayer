const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['employee', 'hr', 'admin'],
      default: 'employee',
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpiry: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say', ''],
      default: '',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    jobTitle: {
      type: String,
      trim: true,
      default: 'Team Member',
    },
    department: {
      type: String,
      trim: true,
      default: 'Engineering',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    employmentStatus: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'terminated'],
      default: 'active',
      index: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    salary: {
      type: Number,
      default: 0,
    },
    salaryStructure: {
      basicSalary: { type: Number, default: 0 },
      allowances: {
        hra: { type: Number, default: 0 },
        da: { type: Number, default: 0 },
        specialAllowance: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
      },
      deductions: {
        pf: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        insurance: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
      },
      grossSalary: { type: Number, default: 0 },
      netSalary: { type: Number, default: 0 },
    },
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.verificationToken;
        delete ret.verificationTokenExpiry;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpiry;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate gross and net salary
userSchema.methods.calculateSalary = function () {
  const basic = Number(this.salaryStructure?.basicSalary) || 0;
  const allowances = this.salaryStructure?.allowances || {};
  const deductions = this.salaryStructure?.deductions || {};

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

  this.salaryStructure.grossSalary = grossSalary;
  this.salaryStructure.netSalary = netSalary;
  this.salary = netSalary;

  return { grossSalary, netSalary };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
