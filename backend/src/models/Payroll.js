const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    payPeriod: {
      type: String, // Format: YYYY-MM (e.g., 2026-08)
      required: [true, 'Pay period is required (e.g. 2026-08)'],
      index: true,
    },
    basicSalary: {
      type: Number,
      required: [true, 'Basic salary is required'],
      default: 0,
    },
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
    grossSalary: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processed', 'paid'],
      default: 'pending',
      index: true,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    salarySlipUrl: {
      type: String,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One payroll record per employee per pay period
payrollSchema.index({ employee: 1, payPeriod: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);

module.exports = Payroll;
