import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { User, Mail, Phone, MapPin, Globe, Link, Image as ImageIcon, Sparkles, BookmarkCheck } from 'lucide-react';

export const PersonalForm: React.FC = () => {
  const { resumeData, updatePersonal, userProfile, updateUserProfile } = useResume();
  const { personal } = resumeData;
  const toast = useToast();

  const handleChange = (field: keyof typeof personal, value: string) => {
    updatePersonal({ [field]: value });
  };

  const handleSaveToProfileCache = () => {
    updateUserProfile({
      fullName: personal.fullName || '',
      email: personal.email || '',
      phone: personal.phone || '',
      location: personal.location || '',
      website: personal.website || '',
      linkedin: personal.linkedin || '',
      github: personal.github || '',
      photoUrl: personal.photoUrl || '',
    });
    toast.success('Master Profile Cached', 'Contact details saved as your default profile for all future resumes.');
  };

  return (
    <div className="p-4 space-y-4 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Personal Details
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your name, contact information, portfolio links, and location.
          </p>
        </div>
        <button
          onClick={handleSaveToProfileCache}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          title="Save Name, Email, and Phone to permanent memory"
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Save as Default Profile</span>
        </button>
      </div>

      {/* Memory Status Pill */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          <strong className="text-slate-300 font-semibold">Separate Profile Memory:</strong> Your contact details (Name, Phone, Email, Location) are automatically cached and pre-filled every time you start a new resume.
        </span>
      </div>

      <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={personal.fullName || ''}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="e.g. Suraj Suresh"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Professional Job Title</label>
            <input
              type="text"
              value={personal.jobTitle || ''}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Address
            </label>
            <input
              type="email"
              value={personal.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="suraj@example.com"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone Number
            </label>
            <input
              type="text"
              value={personal.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 019-2831"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" /> Location / City
            </label>
            <input
              type="text"
              value={personal.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="San Francisco, CA"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" /> Portfolio Website
            </label>
            <input
              type="text"
              value={personal.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://yourportfolio.dev"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Profile
            </label>
            <input
              type="text"
              value={personal.linkedin || ''}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-purple-400" /> GitHub Profile
            </label>
            <input
              type="text"
              value={personal.github || ''}
              onChange={(e) => handleChange('github', e.target.value)}
              placeholder="https://github.com/yourname"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80">
          <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Profile Photo Image URL (Optional)
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={personal.photoUrl || ''}
              onChange={(e) => handleChange('photoUrl', e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
            {personal.photoUrl && (
              <img
                src={personal.photoUrl}
                alt="Profile Preview"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/50"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
