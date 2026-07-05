import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bug, Eye, EyeOff, User, Mail, Lock, Phone,
  Briefcase, GraduationCap, Code2, Github, ChevronRight, ChevronLeft, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EXPERIENCE_LEVELS = [
  { value: 'beginner',      label: 'Beginner',      desc: '0–1 years',   icon: '🌱' },
  { value: 'intermediate',  label: 'Intermediate',   desc: '1–3 years',   icon: '🚀' },
  { value: 'advanced',      label: 'Advanced',       desc: '3–5 years',   icon: '⚡' },
  { value: 'expert',        label: 'Expert',         desc: '5+ years',    icon: '🏆' },
];

const ROLES = [
  'Student', 'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer',
  'Mobile Developer', 'QA Engineer', 'Tech Lead', 'Other',
];

const LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++', 'C#', 'TypeScript', 'Go', 'Rust', 'Swift', 'Kotlin'];

const STEPS = [
  { id: 1, label: 'Account',  icon: Lock },
  { id: 2, label: 'Profile',  icon: User },
  { id: 3, label: 'Details',  icon: Code2 },
];

/* ── Step indicator ─────────────────────────────────────────────── */
function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all font-bold text-sm ${
                done   ? 'bg-green-500 border-green-500 text-white' :
                active ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900/40' :
                         'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
              }`}>
                {done ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-primary-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 h-0.5 mb-5 mx-1 ${done ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Input wrapper ──────────────────────────────────────────────── */
function Field({ label, icon: Icon, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // Step 1 — Account
    name: '', email: '', password: '', confirmPassword: '',
    // Step 2 — Profile
    phone: '', role: '', collegeCompany: '', experienceLevel: '',
    // Step 3 — Details
    preferredLanguage: 'Python', bio: '', githubUrl: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  /* ── Validation per step ─────────────────────────────────────── */
  const validateStep1 = () => {
    if (!form.name.trim() || form.name.length < 2) { toast.error('Name must be at least 2 characters'); return false; }
    if (!form.email.trim() || !form.email.includes('@')) { toast.error('Enter a valid email'); return false; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!form.role) { toast.error('Please select your role'); return false; }
    if (!form.experienceLevel) { toast.error('Please select your experience level'); return false; }
    return true;
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const back = () => setStep(s => s - 1);

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Welcome to AI Debug Agent! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-primary-600 rounded-2xl mb-3 shadow-lg shadow-primary-200 dark:shadow-primary-900/30">
            <Bug className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Join AI Debugging Agent — it's free</p>
        </div>

        <div className="card">
          <StepBar current={step} />

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); next(); }}>

            {/* ── STEP 1: Account ─────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Account Credentials</p>

                <Field label="Full Name" icon={User} required>
                  <input type="text" className="input-field" value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Deepika Sharma" required minLength={2} />
                </Field>

                <Field label="Email Address" icon={Mail} required>
                  <input type="email" className="input-field" value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="you@example.com" required />
                </Field>

                <Field label="Password" icon={Lock} required>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} className="input-field pr-10"
                      value={form.password} onChange={e => set('password', e.target.value)}
                      placeholder="Min 6 characters" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </Field>

                <Field label="Confirm Password" icon={Lock} required>
                  <input type="password" className="input-field" value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Re-enter password" required />
                  {form.confirmPassword && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${form.password === form.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                      {form.password === form.confirmPassword ? <><Check className="w-3 h-3" /> Passwords match</> : '✗ Passwords do not match'}
                    </p>
                  )}
                </Field>
              </div>
            )}

            {/* ── STEP 2: Profile ─────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Tell us about yourself</p>

                <Field label="Phone Number" icon={Phone}>
                  <input type="tel" className="input-field" value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="+91 98765 43210" />
                </Field>

                <Field label="Your Role" icon={Briefcase} required>
                  <select className="input-field" value={form.role} onChange={e => set('role', e.target.value)} required>
                    <option value="">Select your role...</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>

                <Field label="College / Company" icon={GraduationCap}>
                  <input type="text" className="input-field" value={form.collegeCompany}
                    onChange={e => set('collegeCompany', e.target.value)}
                    placeholder="e.g. IIT Madras / Google" />
                </Field>

                <div>
                  <label className="block text-sm font-medium mb-2">Experience Level <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPERIENCE_LEVELS.map(({ value, label, desc, icon }) => (
                      <button
                        key={value} type="button"
                        onClick={() => set('experienceLevel', value)}
                        className={`p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                          form.experienceLevel === value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-lg">{icon}</span>
                          <span className="font-semibold text-sm">{label}</span>
                          {form.experienceLevel === value && <Check className="w-3.5 h-3.5 text-primary-600 ml-auto" />}
                        </div>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Details ─────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Almost done!</p>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-gray-400" /> Preferred Programming Language
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(lang => (
                      <button key={lang} type="button"
                        onClick={() => set('preferredLanguage', lang)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                          form.preferredLanguage === lang
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-400'
                        }`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Bio (optional)" icon={User}>
                  <textarea className="input-field resize-none" rows={3}
                    value={form.bio} onChange={e => set('bio', e.target.value)}
                    placeholder="Tell us about yourself — your interests, goals, or current projects..." />
                </Field>

                <Field label="GitHub Profile (optional)" icon={Github}>
                  <input type="url" className="input-field" value={form.githubUrl}
                    onChange={e => set('githubUrl', e.target.value)}
                    placeholder="https://github.com/username" />
                </Field>

                {/* Summary card */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Account Summary</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Name:</span> <span className="font-medium">{form.name}</span></p>
                    <p><span className="text-gray-500">Email:</span> <span className="font-medium">{form.email}</span></p>
                    <p><span className="text-gray-500">Role:</span> <span className="font-medium">{form.role}</span></p>
                    <p><span className="text-gray-500">Level:</span> <span className="font-medium capitalize">{form.experienceLevel}</span></p>
                    <p><span className="text-gray-500">Language:</span> <span className="font-medium">{form.preferredLanguage}</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation buttons ───────────────────────────── */}
            <div className={`flex gap-3 mt-6 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
              {step > 1 && (
                <button type="button" onClick={back}
                  className="btn-secondary flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              {step < 3 ? (
                <button type="submit"
                  className="btn-primary flex items-center gap-2 ml-auto">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" disabled={loading}
                  className="btn-primary flex items-center gap-2">
                  {loading ? 'Creating account...' : <><Check className="w-4 h-4" /> Create Account</>}
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center mt-5 text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
