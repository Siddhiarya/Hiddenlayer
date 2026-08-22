import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Download,
  Building,
  Briefcase,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable, Column } from '../../components/common/DataTable';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { AddEmployeeModal } from '../../components/employees/AddEmployeeModal';
import { EditEmployeeModal } from '../../components/employees/EditEmployeeModal';
import { Employee } from '../../types/employee';
import { formatDate } from '../../utils/dateUtils';
import { exportToCSV } from '../../utils/exportUtils';

export const AdminEmployees: React.FC = () => {
  const { employees, deleteEmployee } = useData();
  const { success } = useToast();
  const navigate = useNavigate();

  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchDept = departmentFilter === 'all' || emp.department === departmentFilter;
      const matchStatus = statusFilter === 'all' || emp.status.toLowerCase() === statusFilter.toLowerCase();
      const matchRole = roleFilter === 'all' || emp.role.toLowerCase() === roleFilter.toLowerCase();
      return matchDept && matchStatus && matchRole;
    });
  }, [employees, departmentFilter, statusFilter, roleFilter]);

  const handleExportCSV = () => {
    const exportData = employees.map(e => ({
      'Employee ID': e.employeeId,
      'Full Name': e.name,
      'Email': e.email,
      'Phone': e.phone,
      'Department': e.department,
      'Job Title': e.jobTitle,
      'Role': e.role,
      'Status': e.status,
      'Joining Date': e.joiningDate,
      'Basic Salary': e.salary.basic,
    }));
    exportToCSV('Dayflow_Employees_Directory.csv', exportData);
    success('Employees Exported', 'Downloaded employee directory CSV.');
  };

  const handleConfirmDelete = () => {
    if (deletingEmployeeId) {
      deleteEmployee(deletingEmployeeId);
      success('Employee Removed', 'The employee record has been removed.');
      setDeletingEmployeeId(null);
    }
  };

  const columns: Column<Employee>[] = [
    {
      header: 'Employee',
      render: row => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} name={row.name} size="md" status="online" />
          <div className="min-w-0">
            <p className="font-bold text-surface-900 truncate hover:text-primary-600 transition-colors">
              {row.name}
            </p>
            <p className="text-xs text-surface-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      render: row => (
        <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50/70 px-2 py-0.5 rounded-md border border-primary-200">
          {row.employeeId}
        </span>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      render: row => (
        <span className="font-semibold text-surface-800">{row.department}</span>
      ),
    },
    {
      header: 'Job Title',
      accessor: 'jobTitle',
      render: row => (
        <span className="text-xs font-medium text-surface-700">{row.jobTitle}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: row => (
        <Badge variant={row.status.toLowerCase() as any} size="sm" dot>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Joining Date',
      accessor: 'joiningDate',
      render: row => (
        <span className="text-xs text-surface-500">{formatDate(row.joiningDate)}</span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/admin/employees/${row.id}`)}
            className="p-1.5 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="View Full Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingEmployee(row)}
            className="p-1.5 text-surface-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Edit Details"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingEmployeeId(row.id)}
            className="p-1.5 text-surface-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Employee Directory
            </h1>
            <span className="text-xs font-bold px-2.5 py-1 bg-surface-200 text-surface-800 rounded-full">
              {employees.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Manage organizational staff records, job roles, departments, and payroll profiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add Employee
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={filteredEmployees}
        columns={columns}
        searchPlaceholder="Search by name, ID, title, or email..."
        searchFilter={(item, q) =>
          item.name.toLowerCase().includes(q) ||
          item.employeeId.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.jobTitle.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q)
        }
        onRowClick={row => navigate(`/admin/employees/${row.id}`)}
        filterControls={
          <div className="flex flex-wrap items-center gap-2">
            {/* Department */}
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="text-xs bg-white border border-surface-200 rounded-xl px-3 py-1.5 text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-surface-200 rounded-xl px-3 py-1.5 text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="probation">Probation</option>
              <option value="on leave">On Leave</option>
            </select>

            {/* Role */}
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="text-xs bg-white border border-surface-200 rounded-xl px-3 py-1.5 text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="employee">Employee</option>
              <option value="hr">HR Lead</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        }
        emptyTitle="No employees found"
        emptyDescription="Try adjusting your filters or search keywords."
        pageSize={8}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        employee={editingEmployee}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingEmployeeId}
        onClose={() => setDeletingEmployeeId(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Employee Record"
        message="Are you sure you want to permanently delete this employee from the Dayflow system? This action cannot be reverted."
        confirmText="Yes, Delete Record"
        variant="danger"
      />
    </div>
  );
};
