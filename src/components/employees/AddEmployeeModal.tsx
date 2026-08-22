import React, { useState } from 'react';
import { UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { Employee, EmploymentStatus, EmploymentType } from '../../types/employee';
import { UserRole } from '../../types/auth';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { getTodayDateString } from '../../utils/dateUtils';

export interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose }) => {
  const { addEmployee, employees } = useData();
  const { success } = useToast();

  const nextEmpIdNum = employees.length + 1001;
  const suggestedId = `DF-${nextEmpIdNum}`;

  const [formData, setFormData] = useState({
    name: '',
    employeeId: suggestedId,
    email: '',
    phone: '+1 (555) 000-0000',
    address: '100 Howard St, San Francisco, CA',
    dob: '1995-01-01',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    joiningDate: getTodayDateString(),
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time' as EmploymentType,
    status: 'Active' as EmploymentStatus,
    role: 'Employee' as UserRole,
    basicSalary: 6000,
    hra: 2400,
    allowances: 1200,
    deductions: 800,
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.jobTitle.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    // Check duplicate email
    if (employees.some(emp => emp.email.toLowerCase() === formData.email.trim().toLowerCase())) {
      setError('An employee with this email already exists.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newEmp = await addEmployee({
        employeeId: formData.employeeId || suggestedId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        dob: formData.dob,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + (employees.length % 10)}?w=150&auto=format&fit=crop&q=80`,
        department: formData.department,
        jobTitle: formData.jobTitle.trim(),
        joiningDate: formData.joiningDate,
        manager: formData.manager,
        employmentType: formData.employmentType,
        status: formData.status,
        role: formData.role,
        salary: {
          basic: Number(formData.basicSalary) || 5000,
          hra: Number(formData.hra) || 2000,
          allowances: Number(formData.allowances) || 1000,
          deductions: Number(formData.deductions) || 700,
        },
        documents: [
          {
            id: `doc-${Date.now()}-1`,
            name: `Offer_Letter_${formData.name.replace(/\s+/g, '')}.pdf`,
            type: 'Offer Letter',
            uploadedAt: formData.joiningDate,
            size: '1.2 MB',
          },
          {
            id: `doc-${Date.now()}-2`,
            name: 'Employment_Agreement.pdf',
            type: 'Employment Contract',
            uploadedAt: formData.joiningDate,
            size: '2.4 MB',
          },
        ],
      });

      if (newEmp) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Employee"
      description="Register a new team member and configure their job & salary details."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Personal Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400">
            1. Personal & Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name *"
              placeholder="e.g. Jordan Miller"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              required
            />
            <Input
              label="Work Email *"
              type="email"
              placeholder="jordan.m@dayflow.com"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={e => handleChange('phone', e.target.value)}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={e => handleChange('dob', e.target.value)}
            />
          </div>
          <Input
            label="Residential Address"
            placeholder="123 Main Street, San Francisco, CA"
            value={formData.address}
            onChange={e => handleChange('address', e.target.value)}
          />
        </div>

        {/* Job Information */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400">
            2. Job & Organizational Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Employee ID *"
              value={formData.employeeId}
              onChange={e => handleChange('employeeId', e.target.value)}
              required
            />
            <Select
              label="Department *"
              value={formData.department}
              onChange={e => handleChange('department', e.target.value)}
              options={[
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Design', label: 'Design' },
                { value: 'HR', label: 'HR' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Sales', label: 'Sales' },
              ]}
            />
            <Input
              label="Job Title *"
              placeholder="e.g. Frontend Engineer"
              value={formData.jobTitle}
              onChange={e => handleChange('jobTitle', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              label="Joining Date"
              type="date"
              value={formData.joiningDate}
              onChange={e => handleChange('joiningDate', e.target.value)}
            />
            <Select
              label="Employment Type"
              value={formData.employmentType}
              onChange={e => handleChange('employmentType', e.target.value as EmploymentType)}
              options={[
                { value: 'Full-Time', label: 'Full-Time' },
                { value: 'Part-Time', label: 'Part-Time' },
                { value: 'Contract', label: 'Contract' },
                { value: 'Intern', label: 'Intern' },
              ]}
            />
            <Select
              label="System Role"
              value={formData.role}
              onChange={e => handleChange('role', e.target.value as UserRole)}
              options={[
                { value: 'Employee', label: 'Employee' },
                { value: 'HR', label: 'HR Lead' },
                { value: 'Admin', label: 'Admin' },
              ]}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={e => handleChange('status', e.target.value as EmploymentStatus)}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Probation', label: 'Probation' },
                { value: 'On Leave', label: 'On Leave' },
              ]}
            />
          </div>
        </div>

        {/* Salary Information */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400">
            3. Initial Monthly Compensation
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Basic ($/mo)"
              type="number"
              value={formData.basicSalary}
              onChange={e => handleChange('basicSalary', Number(e.target.value))}
            />
            <Input
              label="HRA ($/mo)"
              type="number"
              value={formData.hra}
              onChange={e => handleChange('hra', Number(e.target.value))}
            />
            <Input
              label="Allowances ($/mo)"
              type="number"
              value={formData.allowances}
              onChange={e => handleChange('allowances', Number(e.target.value))}
            />
            <Input
              label="Deductions ($/mo)"
              type="number"
              value={formData.deductions}
              onChange={e => handleChange('deductions', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" />}
            isLoading={isSubmitting}
          >
            Create Employee Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};
