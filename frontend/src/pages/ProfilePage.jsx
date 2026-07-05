import { useState } from 'react';
import {
  User, Mail, Calendar, LogOut, Phone, Briefcase,
  GraduationCap, Code2, Github, Star, Edit3, Save, X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/authService';

const EXPERIENCE_BADGES = {
  beginner:     { label: 'Beginner',     color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',   icon: '🌱' },
  intermediate: { label: 'Intermediate', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',      icon: '🚀' },
  advanced:     { label: 'Advanced',     color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300', icon: '⚡' },
  expert:       { label: 'Expert',       color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300', icon: '🏆' },
};

function InfoRow({ icon: Icon, label, value, href }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <Icon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="font-medium text-primary-600 hover:underline truncate block text-sm">{value}</a>
        ) : (
          <p className="font-medium text-sm">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: user?.phone || '',
    role: user?.role || '',
    college_company: user?.college_company || '',
    experience_level: user?.experience_level || '',
    preferred_language: user?.preferred_language || '',
    bio: user?.bio || '',
    github_url: user?.github_url || '',
  });

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      await refreshProfile();
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const exp = EXPERIENCE_BADGES[user?.experience_level] || null;
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 max-w-5xl">
        {/* Left — avatar + basic */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>

            {exp && (
              <span className={`inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-xs font-semibold ${exp.color}`}>
                {exp.icon} {exp.label}
              </span>
            )}
            {user?.role && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{user.role}</p>
            )}
            {user?.preferred_language && (
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">
                ❤ {user.preferred_language}
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-400">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</p>
            </div>
          </div>

          <button onClick={handleLogout} className="btn-danger w-full flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Right — details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Personal Information</h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="btn-secondary text-sm flex items-center gap-2 py-1.5 px-3">
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="btn-secondary text-sm flex items-center gap-1.5 py-1.5 px-3">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-1.5 py-1.5 px-3">
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {!editing ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <InfoRow icon={User}           label="Full Name"          value={user?.name} />
                <InfoRow icon={Mail}           label="Email"              value={user?.email} />
                <InfoRow icon={Phone}          label="Phone"              value={user?.phone} />
                <InfoRow icon={Briefcase}      label="Role"               value={user?.role} />
                <InfoRow icon={GraduationCap}  label="College / Company"  value={user?.college_company} />
                <InfoRow icon={Code2}          label="Preferred Language" value={user?.preferred_language} />
                <InfoRow icon={Star}           label="Experience"         value={exp ? `${exp.icon} ${exp.label}` : null} />
                <InfoRow icon={Github}         label="GitHub"             value={user?.github_url} href={user?.github_url} />
                {user?.bio && (
                  <div className="sm:col-span-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Bio</p>
                    <p className="text-sm">{user.bio}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: 'phone',              label: 'Phone',              type: 'tel',  placeholder: '+91 98765 43210',    icon: Phone },
                  { key: 'role',               label: 'Role',               type: 'text', placeholder: 'Software Engineer',  icon: Briefcase },
                  { key: 'college_company',    label: 'College / Company',  type: 'text', placeholder: 'IIT / Google',       icon: GraduationCap },
                  { key: 'preferred_language', label: 'Preferred Language', type: 'text', placeholder: 'Python',             icon: Code2 },
                  { key: 'github_url',         label: 'GitHub URL',         type: 'url',  placeholder: 'https://github.com/…', icon: Github },
                ].map(({ key, label, type, placeholder, icon: Icon }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1 text-gray-500 flex items-center gap-1">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </label>
                    <input type={type} className="input-field text-sm" value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder} />
                  </div>
                ))}

                {/* Experience level */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" /> Experience Level
                  </label>
                  <select className="input-field text-sm" value={form.experience_level}
                    onChange={e => setForm(f => ({ ...f, experience_level: e.target.value }))}>
                    <option value="">Select...</option>
                    {Object.entries(EXPERIENCE_BADGES).map(([v, { label, icon }]) => (
                      <option key={v} value={v}>{icon} {label}</option>
                    ))}
                  </select>
                </div>

                {/* Bio */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1 text-gray-500 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Bio
                  </label>
                  <textarea className="input-field text-sm resize-none" rows={3} value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell us about yourself..." />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
