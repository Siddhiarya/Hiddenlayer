import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { employeeApi } from '../services/employeeApi';
import { EmployeeProfile as IEmployeeProfile } from '../../../types/employee';
import { EditProfileModal } from '../components/EditProfileModal';
import { LoadingSkeleton } from '../../../components/common/LoadingSkeleton';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  DollarSign, 
  FileText, 
  Download, 
  Edit3, 
  Lock
} from 'lucide-react';
import { Badge } from '../../../components/common/Badge';

export const EmployeeProfile: React.FC = () => {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState<IEmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await employeeApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      } else if (authUser) {
        setProfile(authUser);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      if (authUser) setProfile(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdated = (updated: IEmployeeProfile) => {
    setProfile(updated);
    updateUser(updated);
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  const p = profile || authUser;

  if (!p) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">Employee profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Avatar & Primary Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <img
                src={p.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=0284c7&color=fff`}
                alt={p.name}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-4 ring-slate-100 shadow-md"
              />
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {p.name}
                </h1>
                <Badge variant="Present">{p.status || 'Active'}</Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {p.designation} • {p.department}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono font-semibold text-slate-700">
                  {p.employeeId}
                </span>
                <span>•</span>
                <span>Role: <strong className="uppercase text-slate-700">{p.role}</strong></span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center space-x-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Personal Details & Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <User className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Personal Details</h2>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5" />
                <span>Work Email</span>
              </span>
              <span className="font-semibold text-slate-800 text-right">{p.email}</span>
            </div>

            <div className="flex items-start justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5" />
                <span>Phone Number</span>
              </span>
              <span className="font-semibold text-slate-800 text-right">{p.phone}</span>
            </div>

            <div className="flex items-start justify-between py-1">
              <span className="text-slate-400 flex items-center space-x-2 shrink-0">
                <MapPin className="h-3.5 w-3.5" />
                <span>Residential Address</span>
              </span>
              <span className="font-semibold text-slate-800 text-right max-w-xs">{p.address}</span>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Briefcase className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Job & Employment Details</h2>
            </div>
            <div className="flex items-center space-x-1 text-[10px] font-semibold text-slate-400">
              <Lock className="h-3 w-3" />
              <span>Admin Managed</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 flex items-center space-x-2">
                <Building2 className="h-3.5 w-3.5" />
                <span>Department</span>
              </span>
              <span className="font-semibold text-slate-800">{p.department}</span>
            </div>

            <div className="flex items-start justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 flex items-center space-x-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Designation</span>
              </span>
              <span className="font-semibold text-slate-800">{p.designation}</span>
            </div>

            <div className="flex items-start justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 flex items-center space-x-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joining Date</span>
              </span>
              <span className="font-semibold text-slate-800">{p.joiningDate}</span>
            </div>

            <div className="flex items-start justify-between py-1">
              <span className="text-slate-400 flex items-center space-x-2">
                <UserCheck className="h-3.5 w-3.5" />
                <span>Reporting Manager</span>
              </span>
              <span className="font-semibold text-brand-600">{p.manager}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Overview & Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salary Details Card */}
        <div className="lg:col-span-1 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-4 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Salary Summary</h2>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Basic Salary</span>
                <span className="font-semibold text-slate-800">${p.salary?.basic?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Total Allowances</span>
                <span className="font-semibold text-emerald-600">+${p.salary?.allowances?.total?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Total Deductions</span>
                <span className="font-semibold text-rose-600">-${p.salary?.deductions?.total?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-900 p-4 text-white">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Net Take-Home Pay</span>
            <p className="text-2xl font-extrabold tracking-tight mt-1 text-emerald-400">
              ${p.salary?.netSalary?.toLocaleString() || 0} <span className="text-xs text-slate-400 font-normal">/ mo</span>
            </p>
          </div>
        </div>

        {/* Documents Section */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Employee Documents</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {p.documents?.length || 0} files stored
            </span>
          </div>

          <div className="space-y-3">
            {p.documents && p.documents.length > 0 ? (
              p.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-brand-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{doc.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {doc.type} • {doc.size} • Uploaded on {doc.uploadDate}
                      </p>
                    </div>
                  </div>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No official documents on record yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {p && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={p}
          onSuccess={handleProfileUpdated}
        />
      )}
    </div>
  );
};
