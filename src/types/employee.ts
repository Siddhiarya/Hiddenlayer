import { UserRole } from './auth';

export type EmploymentStatus = 'Active' | 'On Leave' | 'Probation' | 'Terminated';
export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';

export interface DocumentItem {
  id: string;
  name: string;
  type: 'Offer Letter' | 'ID Proof' | 'Employment Contract' | 'Salary Slip' | 'Certificate';
  uploadedAt: string;
  size: string;
  url?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  dob: string;
  department: string;
  jobTitle: string;
  joiningDate: string;
  manager: string;
  employmentType: EmploymentType;
  status: EmploymentStatus;
  role: UserRole;
  salary: {
    basic: number;
    hra: number;
    allowances: number;
    deductions: number;
  };
  documents: DocumentItem[];
}
