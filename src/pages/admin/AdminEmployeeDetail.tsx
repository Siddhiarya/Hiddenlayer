import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building,
  Shield,
  CreditCard,
  FileText,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  Eye,
  Download,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import { DataTable, Column } from '../../components/common/DataTable';
import { EditEmployeeModal } from '../../components/employees/EditEmployeeModal';
import { SalaryEditModal } from '../../components/payroll/SalaryEditModal';
import { LeaveApprovalModal } from '../../components/leave/LeaveApprovalModal';
import { SalarySlipModal } from '../../components/payroll/SalarySlipModal';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { LeaveRequest } from '../../types/leave';
import { PayslipRecord } from '../../types/payroll';
import { AttendanceRecord } from '../../types/attendance';
import { DocumentItem } from '../../types/employee';

export const AdminEmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getEmployeeById,
    getEmployeeAttendance,
    getUserLeaveRequests,
    getEmployeeLeaveBalance,
    getEmployeePayslips,
    updateEmployeeSalary,
    approveLeave,
    rejectLeave,
  } = useData();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'personal' | 'job' | 'attendance' | 'leave' | 'payroll' | 'documents'
  >('overview');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [selectedReviewLeave, setSelectedReviewLeave] = useState<LeaveRequest | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const employee = id ? getEmployeeById(id) : null;

  if (!employee) {
    return (
      <div className="p-12 text-center space-y-4">
        <h3 className="text-lg font-bold text-surface-900">Employee Not Found</h3>
        <p className="text-xs text-surface-500">The requested employee record does not exist.</p>
        <Button variant="secondary" onClick={() => navigate('/admin/employees')}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const attendanceRecords = getEmployeeAttendance(employee.employeeId);
  const leaveRecords = getUserLeaveRequests(employee.employeeId);
  const leaveBalance = getEmployeeLeaveBalance(employee.employeeId);
  const payslips = getEmployeePayslips(employee.employeeId);

  const grossSalary =
    employee.salary.basic + employee.salary.hra + employee.salary.allowances;
  const netSalary = Math.max(0, grossSalary - employee.salary.deductions);

  // Attendance Columns
  const attendanceColumns: Column<AttendanceRecord>[] = [
    { header: 'Date', render: r => formatDate(r.date) },
    { header: 'Check In', accessor: 'checkIn' },
    { header: 'Check Out', accessor: 'checkOut' },
    { header: 'Working Hours', render: r => `${r.workingHours} hrs` },
    {
      header: 'Status',
      render: r => (
        <Badge variant={r.status.toLowerCase() as any} size="sm" dot>
          {r.status}
        </Badge>
      ),
    },
  ];

  // Leave Columns
  const leaveColumns: Column<LeaveRequest>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Leave Type', accessor: 'leaveType' },
    {
      header: 'Dates',
      render: r => `${formatDate(r.startDate)} – ${formatDate(r.endDate)} (${r.days}d)`,
    },
    { header: 'Reason', accessor: 'reason' },
    {
      header: 'Status',
      render: r => (
        <Badge variant={r.status.toLowerCase() as any} size="sm" dot>
          {r.status}
        </Badge>
      ),
    },
    {
      header: 'Action',
      render: r =>
        r.status === 'Pending' ? (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setSelectedReviewLeave(r)}
          >
            Review
          </Button>
        ) : (
          <span className="text-xs text-surface-400">Decided</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back to directory button */}
      <button
        onClick={() => navigate('/admin/employees')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Employee Directory
      </button>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-surface-200/80 shadow-xs overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-purple-800 via-primary-700 to-indigo-800 relative" />

        <div className="px-6 sm:px-8 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Avatar
              src={employee.avatar}
              name={employee.name}
              size="2xl"
              status="online"
              className="ring-4 ring-white shadow-xl"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
                  {employee.name}
                </h1>
                <Badge variant={employee.status.toLowerCase() as any} size="sm" dot>
                  {employee.status}
                </Badge>
                <Badge variant={employee.role.toLowerCase() as any} size="sm">
                  {employee.role}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-surface-600 font-medium">
                {employee.jobTitle} • {employee.department}
              </p>
              <p className="text-xs text-surface-400 font-mono">
                Employee ID: {employee.employeeId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CreditCard className="w-4 h-4" />}
              onClick={() => setIsSalaryModalOpen(true)}
            >
              Edit Salary Structure
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 sm:px-8 border-t border-surface-100 flex gap-2 overflow-x-auto bg-surface-50/40">
          {[
            { key: 'overview', label: 'Overview', icon: User },
            { key: 'personal', label: 'Personal Details', icon: User },
            { key: 'job', label: 'Job Profile', icon: Briefcase },
            { key: 'attendance', label: 'Attendance', icon: Clock },
            { key: 'leave', label: 'Leave History', icon: Calendar },
            { key: 'payroll', label: 'Payroll & CTC', icon: CreditCard },
            { key: 'documents', label: 'Documents', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3.5 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                  isActive
                    ? 'border-primary-600 text-primary-600 bg-white shadow-2xs'
                    : 'border-transparent text-surface-500 hover:text-surface-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-surface-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Net Monthly Salary"
              value={formatCurrency(netSalary)}
              subtitle={`Gross: ${formatCurrency(grossSalary)}`}
              icon={<DollarSign className="w-5 h-5" />}
              colorScheme="emerald"
            />

            <StatCard
              title="Paid Leave Remaining"
              value={`${leaveBalance.paid.remaining} / ${leaveBalance.paid.total} Days`}
              subtitle={`${leaveBalance.paid.used} days utilized`}
              icon={<Calendar className="w-5 h-5" />}
              colorScheme="indigo"
            />

            <StatCard
              title="Attendance Rate"
              value="96.2%"
              subtitle="21 shifts logged"
              icon={<Clock className="w-5 h-5" />}
              colorScheme="primary"
            />

            <StatCard
              title="Documents Attached"
              value={`${employee.documents.length} Files`}
              subtitle="All verified on file"
              icon={<FileText className="w-5 h-5" />}
              colorScheme="sky"
            />
          </div>

          {/* Quick info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-surface-900 pb-2 border-b border-surface-100">
                Contact & Residential Details
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-surface-500">Corporate Email:</span>
                  <span className="font-bold text-surface-900">{employee.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Phone Number:</span>
                  <span className="font-semibold text-surface-900">{employee.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Address:</span>
                  <span className="font-semibold text-surface-900 text-right max-w-xs truncate">
                    {employee.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Date of Birth:</span>
                  <span className="font-semibold text-surface-900">{formatDate(employee.dob)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-surface-900 pb-2 border-b border-surface-100">
                Organizational Hierarchy
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-surface-500">Department:</span>
                  <span className="font-bold text-surface-900">{employee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Reports To:</span>
                  <span className="font-bold text-primary-600">{employee.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Employment Type:</span>
                  <span className="font-semibold text-surface-900">{employee.employmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Joining Date:</span>
                  <span className="font-semibold text-surface-900">{formatDate(employee.joiningDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Personal */}
      {activeTab === 'personal' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-surface-200/80 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-surface-100">
            <h3 className="text-base font-bold text-surface-900">Personal Information (Admin Editable)</h3>
            <Button size="sm" variant="primary" onClick={() => setIsEditModalOpen(true)}>
              Edit Info
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-surface-400 font-semibold uppercase">Full Legal Name</span>
              <p className="text-sm font-bold text-surface-900 mt-1">{employee.name}</p>
            </div>
            <div>
              <span className="text-surface-400 font-semibold uppercase">Email</span>
              <p className="text-sm font-bold text-surface-900 mt-1">{employee.email}</p>
            </div>
            <div>
              <span className="text-surface-400 font-semibold uppercase">Phone</span>
              <p className="text-sm font-bold text-surface-900 mt-1">{employee.phone}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-surface-400 font-semibold uppercase">Address</span>
              <p className="text-sm font-bold text-surface-900 mt-1">{employee.address}</p>
            </div>
            <div>
              <span className="text-surface-400 font-semibold uppercase">Date of Birth</span>
              <p className="text-sm font-bold text-surface-900 mt-1">{formatDate(employee.dob)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Job */}
      {activeTab === 'job' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-surface-200/80 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-surface-100">
            <h3 className="text-base font-bold text-surface-900">Job Specifications (Admin Editable)</h3>
            <Button size="sm" variant="primary" onClick={() => setIsEditModalOpen(true)}>
              Edit Job Details
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-surface-400 font-semibold uppercase">Employee ID</span>
              <p className="text-sm font-mono font-bold text-primary-600 mt-1">{employee.employeeId}</p>
            </div>
            <div>
              <span className="text-surface-400 font-semibold uppercase">Department</span>
              <p className="text-sm font-bold text-surface-900 mt-1">{employee.department}</p>
            </div>
            <div>
              <span className="text-surface-400 font-semibold uppercase">Job Title</span>
              <p className="text-sm font-bold text-surface-900 mt-1">{employee.jobTitle}</p>
            </div>
            <div>
              <span className="text-surface-400 font-semibold uppercase">Manager</span>
              <p className="text-sm font-bold text-surface-900 mt-1">{employee.manager}</p>
            </div>
            <div>
              <span className="text-surface-400 font-semibold uppercase">Employment Type</span>
              <p className="text-sm font-bold text-surface-900 mt-1">{employee.employmentType}</p>
            </div>
            <div>
              <span className="text-surface-400 font-semibold uppercase">Status</span>
              <p className="mt-1"><Badge variant={employee.status.toLowerCase() as any}>{employee.status}</Badge></p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Attendance */}
      {activeTab === 'attendance' && (
        <div className="space-y-4 animate-fadeIn">
          <DataTable
            data={attendanceRecords}
            columns={attendanceColumns}
            searchPlaceholder="Search attendance logs..."
            emptyTitle="No attendance records"
            emptyDescription="No attendance logs found for this employee."
            pageSize={6}
          />
        </div>
      )}

      {/* Tab 5: Leave */}
      {activeTab === 'leave' && (
        <div className="space-y-4 animate-fadeIn">
          <DataTable
            data={leaveRecords}
            columns={leaveColumns}
            searchPlaceholder="Search leave history..."
            emptyTitle="No leave records"
            emptyDescription="No leave requests filed by this employee."
            pageSize={6}
          />
        </div>
      )}

      {/* Tab 6: Payroll */}
      {activeTab === 'payroll' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-surface-900">Current Salary Package</h3>
              <p className="text-xs text-surface-500">Gross: {formatCurrency(grossSalary)} • Net: {formatCurrency(netSalary)}</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CreditCard className="w-4 h-4" />}
              onClick={() => setIsSalaryModalOpen(true)}
            >
              Update Salary Structure
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface-50 border">
              <span className="text-[11px] text-surface-400 uppercase font-bold">Basic</span>
              <p className="text-base font-bold text-surface-900 mt-1">{formatCurrency(employee.salary.basic)}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-50 border">
              <span className="text-[11px] text-surface-400 uppercase font-bold">HRA</span>
              <p className="text-base font-bold text-surface-900 mt-1">{formatCurrency(employee.salary.hra)}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-50 border">
              <span className="text-[11px] text-surface-400 uppercase font-bold">Allowances</span>
              <p className="text-base font-bold text-surface-900 mt-1">{formatCurrency(employee.salary.allowances)}</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
              <span className="text-[11px] text-rose-500 uppercase font-bold">Deductions</span>
              <p className="text-base font-bold text-rose-700 mt-1">- {formatCurrency(employee.salary.deductions)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Documents */}
      {activeTab === 'documents' && (
        <div className="p-6 rounded-3xl bg-white border border-surface-200/80 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-surface-100">
            <h3 className="text-base font-bold text-surface-900">Stored Employee Documents</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {employee.documents.length} Files
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {employee.documents.map(doc => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl border border-surface-200 bg-surface-50/50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-6 h-6 text-primary-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-surface-900 truncate">{doc.name}</p>
                    <p className="text-[11px] text-surface-500">{doc.type} • {doc.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 text-surface-500 hover:text-primary-600 rounded-lg hover:bg-surface-100"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={employee}
      />

      <SalaryEditModal
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
        employee={employee}
        onSave={(empId, sal) => updateEmployeeSalary(empId, sal)}
      />

      <LeaveApprovalModal
        isOpen={!!selectedReviewLeave}
        onClose={() => setSelectedReviewLeave(null)}
        request={selectedReviewLeave}
        onApprove={(reqId, comm) => approveLeave(reqId, comm)}
        onReject={(reqId, comm) => rejectLeave(reqId, comm)}
      />
    </div>
  );
};
