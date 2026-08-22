import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Sparkles } from 'lucide-react';
import { Employee, EmploymentStatus, EmploymentType } from '../../types/employee';
import { UserRole } from '../../types/auth';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const { user } = useAuth();
  const { updateEmployee } = useData();
  const { success } = useToast();

  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: '',
    department: '',
    jobTitle: '',
    employmentType: 'Full-Time' as EmploymentType,
    status: 'Active' as EmploymentStatus,
    role: 'Employee' as UserRole,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        phone: employee.phone,
        address: employee.address,
        avatar: employee.avatar,
        department: employee.department,
        jobTitle: employee.jobTitle,
        employmentType: employee.employmentType,
        status: employee.status,
        role: employee.role,
      });
      setError('');
    }
  }, [employee]);

  if (!employee) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminOrHR && !formData.name.trim()) {
      setError('Employee name cannot be empty.');
      return;
    }

    const updates: Partial<Employee> = isAdminOrHR
      ? {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          avatar: formData.avatar.trim() || employee.avatar,
          department: formData.department,
          jobTitle: formData.jobTitle.trim(),
          employmentType: formData.employmentType,
          status: formData.status,
          role: formData.role,
        }
      : {
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          avatar: formData.avatar.trim() || employee.avatar,
        };

    updateEmployee(employee.id, updates);
    success('Profile Updated', `Changes for ${employee.name} saved successfully.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAdminOrHR ? `Edit Employee: ${employee.name}` : 'Edit My Profile'}
      description={
        isAdminOrHR
          ? `Modify organizational or personal records for ID: ${employee.employeeId}`
          : 'You can update your personal contact info and profile image.'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Name (Admin only editable) */}
        {isAdminOrHR ? (
          <Input
            label="Full Name"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            required
          />
        ) : (
          <div className="text-xs text-surface-500 bg-surface-50 p-3 rounded-xl border border-surface-200">
            Name: <strong className="text-surface-800">{employee.name}</strong> (Read-only)
          </div>
        )}

        {/* Contact info (Editable by both) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={e => handleChange('phone', e.target.value)}
          />
          <Input
            label="Avatar Image URL"
            value={formData.avatar}
            placeholder="https://..."
            onChange={e => handleChange('avatar', e.target.value)}
          />
        </div>

        <Input
          label="Residential Address"
          value={formData.address}
          onChange={e => handleChange('address', e.target.value)}
        />

        {/* Admin only fields */}
        {isAdminOrHR && (
          <div className="space-y-3 pt-2 border-t border-surface-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Department"
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
                label="Job Title"
                value={formData.jobTitle}
                onChange={e => handleChange('jobTitle', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Role"
                value={formData.role}
                onChange={e => handleChange('role', e.target.value as UserRole)}
                options={[
                  { value: 'Employee', label: 'Employee' },
                  { value: 'HR', label: 'HR Lead' },
                  { value: 'Admin', label: 'Admin' },
                ]}
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
        )}

        {/* Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" leftIcon={<Check className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
