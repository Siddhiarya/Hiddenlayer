import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  Printer,
  Edit3,
  Search,
  Filter,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/common/StatCard';
import { DataTable, Column } from '../../components/common/DataTable';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SalaryEditModal } from '../../components/payroll/SalaryEditModal';
import { Employee } from '../../types/employee';
import { formatCurrency } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';

export const AdminPayroll: React.FC = () => {
  const { employees, updateEmployeeSalary } = useData();
  const { success } = useToast();

  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Overall Payroll Computations
  const stats = useMemo(() => {
    let totalGross = 0;
    let totalNet = 0;
    let highestNet = 0;

    employees.forEach(emp => {
      const gross = emp.salary.basic + emp.salary.hra + emp.salary.allowances;
      const net = Math.max(0, gross - emp.salary.deductions);
      totalGross += gross;
      totalNet += net;
      if (net > highestNet) highestNet = net;
    });

    const averageNet = employees.length > 0 ? totalNet / employees.length : 0;

    return { totalGross, totalNet, highestNet, averageNet };
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    if (departmentFilter === 'all') return employees;
    return employees.filter(emp => emp.department === departmentFilter);
  }, [employees, departmentFilter]);

  const handleExportCSV = () => {
    const exportData = filteredEmployees.map(e => {
      const gross = e.salary.basic + e.salary.hra + e.salary.allowances;
      const net = Math.max(0, gross - e.salary.deductions);
      return {
        'Employee ID': e.employeeId,
        'Full Name': e.name,
        'Department': e.department,
        'Designation': e.jobTitle,
        'Basic Salary': e.salary.basic,
        'HRA': e.salary.hra,
        'Allowances': e.salary.allowances,
        'Deductions': e.salary.deductions,
        'Gross Salary': gross,
        'Net Salary': net,
      };
    });

    exportToCSV('Company_Payroll_Summary.csv', exportData);
    success('Payroll Exported', 'Payroll master summary downloaded.');
  };

  const columns: Column<Employee>[] = [
    {
      header: 'Employee',
      render: row => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} name={row.name} size="sm" />
          <div className="min-w-0">
            <p className="font-bold text-surface-900 truncate">{row.name}</p>
            <p className="text-xs text-surface-500">{row.department} • {row.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Basic ($/mo)',
      accessor: 'salary',
      render: row => (
        <span className="font-semibold text-surface-900">
          {formatCurrency(row.salary.basic)}
        </span>
      ),
    },
    {
      header: 'HRA ($/mo)',
      accessor: 'salary',
      render: row => (
        <span className="font-medium text-surface-700">
          {formatCurrency(row.salary.hra)}
        </span>
      ),
    },
    {
      header: 'Allowances',
      accessor: 'salary',
      render: row => (
        <span className="font-medium text-surface-700">
          {formatCurrency(row.salary.allowances)}
        </span>
      ),
    },
    {
      header: 'Deductions',
      accessor: 'salary',
      render: row => (
        <span className="font-semibold text-rose-600">
          - {formatCurrency(row.salary.deductions)}
        </span>
      ),
    },
    {
      header: 'Net Take-Home',
      render: row => {
        const gross = row.salary.basic + row.salary.hra + row.salary.allowances;
        const net = Math.max(0, gross - row.salary.deductions);
        return (
          <span className="font-extrabold text-emerald-600 text-sm">
            {formatCurrency(net)}
          </span>
        );
      },
    },
    {
      header: 'Action',
      align: 'right',
      render: row => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          onClick={() => setEditingEmployee(row)}
        >
          Edit Salary
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Payroll & Compensation Control
            </h1>
            <Badge variant="admin" size="sm">
              Finance Admin
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Configure compensation packages, revise employee CTC structures, and disburse paychecks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Print Summary
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export Payroll CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Monthly Payroll"
          value={formatCurrency(stats.totalNet)}
          subtitle={`Gross: ${formatCurrency(stats.totalGross)}`}
          icon={<DollarSign className="w-5 h-5" />}
          colorScheme="primary"
        />

        <StatCard
          title="Average Net Salary"
          value={formatCurrency(stats.averageNet)}
          subtitle="Per employee / month"
          icon={<CreditCard className="w-5 h-5" />}
          colorScheme="emerald"
        />

        <StatCard
          title="Highest Compensation"
          value={formatCurrency(stats.highestNet)}
          subtitle="Executive tier"
          icon={<TrendingUp className="w-5 h-5" />}
          colorScheme="indigo"
        />

        <StatCard
          title="Active Payees"
          value={`${employees.length} Members`}
          subtitle="100% direct deposit ready"
          icon={<CheckCircle2 className="w-5 h-5" />}
          colorScheme="sky"
        />
      </div>

      {/* Payroll Table */}
      <DataTable
        data={filteredEmployees}
        columns={columns}
        searchPlaceholder="Search employee by name, ID, or title..."
        searchFilter={(item, q) =>
          item.name.toLowerCase().includes(q) ||
          item.employeeId.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q) ||
          item.jobTitle.toLowerCase().includes(q)
        }
        filterControls={
          <div className="flex items-center gap-2">
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
          </div>
        }
        emptyTitle="No employee payroll records"
        emptyDescription="No employees matching the selected department."
        pageSize={8}
      />

      {/* Salary Edit Modal */}
      <SalaryEditModal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        employee={editingEmployee}
        onSave={(empId, salary) => updateEmployeeSalary(empId, salary)}
      />
    </div>
  );
};
