import React, { useState } from 'react';
import {
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
  Download,
  Eye,
  Edit3,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EditEmployeeModal } from '../../components/employees/EditEmployeeModal';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { useToast } from '../../context/ToastContext';
import { DocumentItem } from '../../types/employee';

export const EmployeeProfile: React.FC = () => {
  const { user } = useAuth();
  const { getEmployeeById } = useData();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<'personal' | 'job' | 'salary' | 'documents'>('personal');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const currentEmployee = user ? getEmployeeById(user.employeeId) || getEmployeeById(user.id) : null;

  if (!currentEmployee) {
    return <div className="p-8 text-center text-surface-500">Loading profile data...</div>;
  }

  const grossSalary =
    currentEmployee.salary.basic +
    currentEmployee.salary.hra +
    currentEmployee.salary.allowances;
  const netSalary = Math.max(0, grossSalary - currentEmployee.salary.deductions);

  const handleDownloadDoc = (docName: string) => {
    success('Download Started', `Downloading ${docName}`);
  };

  return (
    <div className="space-y-6">
      {/* Profile Top Banner Card */}
      <div className="bg-white rounded-3xl border border-surface-200/80 shadow-xs overflow-hidden">
        {/* Banner Cover Gradient */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-primary-700 via-brand-600 to-indigo-800 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-white/80 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full">
              Employee Portal
            </span>
          </div>
        </div>

        {/* Profile Details Header */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative">
              <Avatar
                src={currentEmployee.avatar}
                name={currentEmployee.name}
                size="2xl"
                status="online"
                className="ring-4 ring-white shadow-xl"
              />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
                  {currentEmployee.name}
                </h1>
                <Badge variant="active" size="sm" dot>
                  {currentEmployee.status}
                </Badge>
                <Badge variant="employee" size="sm">
                  {currentEmployee.role}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-surface-600 font-medium">
                {currentEmployee.jobTitle} • {currentEmployee.department} Department
              </p>
              <p className="text-xs text-surface-400 font-mono">
                ID: {currentEmployee.employeeId}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Edit3 className="w-4 h-4" />}
            onClick={() => setIsEditModalOpen(true)}
            className="self-start sm:self-auto shadow-sm"
          >
            Edit Profile
          </Button>
        </div>

        {/* Section Tabs */}
        <div className="px-6 sm:px-8 border-t border-surface-100 flex gap-2 overflow-x-auto bg-surface-50/40">
          {[
            { key: 'personal', label: 'Personal Information', icon: User },
            { key: 'job', label: 'Job & Organization', icon: Briefcase },
            { key: 'salary', label: 'Salary Structure', icon: CreditCard },
            { key: 'documents', label: 'Documents & Files', icon: FileText },
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

      {/* Tab 1: Personal Information */}
      {activeTab === 'personal' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-surface-200/80 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-surface-100">
            <div>
              <h3 className="text-base font-bold text-surface-900">
                Personal Contact & Address
              </h3>
              <p className="text-xs text-surface-500">
                Your personal details used for communication and tax reporting.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Update Info
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary-500" /> Full Legal Name
              </span>
              <p className="text-sm font-bold text-surface-900">{currentEmployee.name}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary-500" /> Email Address
              </span>
              <p className="text-sm font-bold text-surface-900">{currentEmployee.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary-500" /> Phone Number
              </span>
              <p className="text-sm font-bold text-surface-900">{currentEmployee.phone}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary-500" /> Date of Birth
              </span>
              <p className="text-sm font-bold text-surface-900">{formatDate(currentEmployee.dob)}</p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-500" /> Residential Address
              </span>
              <p className="text-sm font-bold text-surface-900">{currentEmployee.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Job Information (Read-only for Employee) */}
      {activeTab === 'job' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-surface-200/80 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-surface-100">
            <div>
              <h3 className="text-base font-bold text-surface-900">
                Job & Employment Details
              </h3>
              <p className="text-xs text-surface-500">
                Official role specifications and reporting hierarchy.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-surface-400 bg-surface-100 px-3 py-1 rounded-full font-medium">
              <Lock className="w-3.5 h-3.5" /> Read-Only for Employees
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Employee ID
              </span>
              <p className="text-sm font-mono font-bold text-primary-600">
                {currentEmployee.employeeId}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Department
              </span>
              <p className="text-sm font-bold text-surface-900">
                {currentEmployee.department}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Designation / Title
              </span>
              <p className="text-sm font-bold text-surface-900">
                {currentEmployee.jobTitle}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Joining Date
              </span>
              <p className="text-sm font-bold text-surface-900">
                {formatDate(currentEmployee.joiningDate)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Reporting Manager
              </span>
              <p className="text-sm font-bold text-surface-900">
                {currentEmployee.manager}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Employment Type
              </span>
              <p className="text-sm font-bold text-surface-900">
                {currentEmployee.employmentType}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Salary Structure (Read-only for Employee) */}
      {activeTab === 'salary' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-surface-200/80 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-surface-100">
            <div>
              <h3 className="text-base font-bold text-surface-900">
                Monthly Compensation Breakdown
              </h3>
              <p className="text-xs text-surface-500">
                Your fixed monthly CTC structure and standard deductions.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-surface-400 bg-surface-100 px-3 py-1 rounded-full font-medium">
              <Lock className="w-3.5 h-3.5" /> Managed by HR
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                Basic Pay
              </span>
              <p className="text-xl font-extrabold text-surface-900 mt-1">
                {formatCurrency(currentEmployee.salary.basic)}
              </p>
              <span className="text-[10px] text-surface-500">Base salary / month</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                House Rent (HRA)
              </span>
              <p className="text-xl font-extrabold text-surface-900 mt-1">
                {formatCurrency(currentEmployee.salary.hra)}
              </p>
              <span className="text-[10px] text-surface-500">40% of Basic</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                Special Allowances
              </span>
              <p className="text-xl font-extrabold text-surface-900 mt-1">
                {formatCurrency(currentEmployee.salary.allowances)}
              </p>
              <span className="text-[10px] text-surface-500">Travel & Internet</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                Total Deductions
              </span>
              <p className="text-xl font-extrabold text-rose-700 mt-1">
                - {formatCurrency(currentEmployee.salary.deductions)}
              </p>
              <span className="text-[10px] text-rose-600">PF + Income Tax</span>
            </div>
          </div>

          {/* Net Salary Highlight */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-700 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-200">
                Net Take-Home Salary
              </span>
              <h4 className="text-2xl sm:text-3xl font-extrabold mt-0.5">
                {formatCurrency(netSalary)} / month
              </h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-primary-200 block">Annualized CTC</span>
              <span className="text-base font-bold">{formatCurrency(grossSalary * 12)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Documents */}
      {activeTab === 'documents' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-surface-200/80 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-surface-100">
            <div>
              <h3 className="text-base font-bold text-surface-900">
                Official Documents & Certifications
              </h3>
              <p className="text-xs text-surface-500">
                Access and download your verified onboarding documents and agreements.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {currentEmployee.documents.length} Files Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentEmployee.documents.map(doc => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl border border-surface-200 hover:border-primary-300 hover:shadow-card-hover transition-all duration-200 bg-surface-50/40 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-surface-900 truncate">
                      {doc.name}
                    </h4>
                    <p className="text-[11px] text-surface-500 mt-0.5">
                      {doc.type} • {doc.size} • {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                    title="Preview Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadDoc(doc.name)}
                    className="p-2 text-surface-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    title="Download Document"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={currentEmployee}
      />

      {/* Preview Document Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Document Preview: ${previewDoc.name}`}
          description={`${previewDoc.type} • Uploaded on ${formatDate(previewDoc.uploadedAt)}`}
          size="lg"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => {
                  handleDownloadDoc(previewDoc.name);
                  setPreviewDoc(null);
                }}
              >
                Download File
              </Button>
            </>
          }
        >
          <div className="p-8 bg-surface-100/70 rounded-2xl border border-surface-200 flex flex-col items-center justify-center text-center space-y-4 min-h-[260px]">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary-600">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-surface-900">{previewDoc.name}</h4>
              <p className="text-xs text-surface-500">
                Verified Cryptographic Signature — Secure Document Vault
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Authentic Digital Copy on File</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
