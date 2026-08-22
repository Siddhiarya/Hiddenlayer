export interface SalaryStructure {
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
}

export interface PayslipRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  month: string; // e.g. "October 2026"
  year: number;
  paymentDate: string;
  basic: number;
  hra: number;
  allowances: number;
  grossSalary: number;
  pfDeduction: number;
  taxDeduction: number;
  totalDeductions: number;
  netSalary: number;
  status: 'Paid' | 'Processed' | 'Pending';
  paymentMethod: string;
  bankAccount: string;
}
