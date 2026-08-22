import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { EmployeeProfile } from '../../../types/employee';
import { employeeApi } from '../services/employeeApi';
import { 
  Phone, 
  MapPin, 
  Image as ImageIcon, 
  Lock, 
  Loader2, 
  Save, 
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: EmployeeProfile;
  onSuccess: (updated: EmployeeProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSuccess
}) => {
  const [phone, setPhone] = useState<string>(profile.phone || '');
  const [address, setAddress] = useState<string>(profile.address || '');
  const [profilePicture, setProfilePicture] = useState<string>(profile.profilePicture || '');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!phone || phone.trim().length < 7) {
      setError('Please provide a valid phone number (minimum 7 characters).');
      return;
    }

    if (!address || address.trim().length < 5) {
      setError('Please provide a valid home address (minimum 5 characters).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await employeeApi.updateProfile({
        phone: phone.trim(),
        address: address.trim(),
        profilePicture: profilePicture.trim()
      });

      setIsLoading(false);

      if (res.success && res.data) {
        setSuccess('Profile updated successfully!');
        onSuccess(res.data);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'An unexpected error occurred while saving.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Employee Profile"
      subtitle="Update your personal contact details and avatar."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error / Success Feedback */}
        {error && (
          <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Avatar preview and URL input */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Profile Photo
          </label>
          <div className="flex items-center space-x-4">
            <img
              src={profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0284c7&color=fff`}
              alt="Avatar preview"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-brand-500/30 border border-white shadow-sm"
              onError={(e) => {
                // fallback if invalid image URL
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0284c7&color=fff`;
              }}
            />
            <div className="flex-1">
              <div className="relative">
                <ImageIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Provide an image URL for your profile avatar.</p>
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Residential Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full Street Address, City, State, ZIP"
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Non-Editable Admin Controlled Fields Notice */}
        <div className="rounded-xl bg-slate-100/80 p-3.5 border border-slate-200">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-2">
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            <span>Admin-Controlled Fields (Read-Only)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block text-[10px]">Employee ID</span>
              <span className="font-semibold text-slate-800">{profile.employeeId}</span>
            </div>
            <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block text-[10px]">Work Email</span>
              <span className="font-semibold text-slate-800 truncate block">{profile.email}</span>
            </div>
            <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block text-[10px]">Department</span>
              <span className="font-semibold text-slate-800">{profile.department}</span>
            </div>
            <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block text-[10px]">Designation</span>
              <span className="font-semibold text-slate-800">{profile.designation}</span>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-slate-500 italic">
            To change job title, department, salary, or employee ID, please contact HR/Admin.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
