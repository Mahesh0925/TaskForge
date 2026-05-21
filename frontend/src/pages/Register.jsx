import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Eye, EyeOff, Loader2, FolderKanban, ArrowRight,
  User, Mail, Lock, ShieldCheck, Users
} from 'lucide-react';

// ─── Password strength indicator ─────────────────────────────────────────────
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-destructive' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-400' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-400' };
  return { score, label: 'Strong', color: 'bg-green-500' };
};

// ─── Role option card ─────────────────────────────────────────────────────────
const RoleCard = ({ value, selected, onSelect, icon: Icon, title, desc }) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className={`flex-1 flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-all ${
      selected
        ? 'border-primary bg-primary/5 text-primary'
        : 'border-input bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
    }`}
  >
    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
      selected ? 'bg-primary/10' : 'bg-muted'
    }`}>
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-xs font-semibold">{title}</p>
      <p className="text-[10px] mt-0.5 leading-tight opacity-70">{desc}</p>
    </div>
  </button>
);

// ─── Register Page ────────────────────────────────────────────────────────────
const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, isRegistering } = useAuthStore();

  const strength = getStrength(form.password);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email || !form.password)
      return setError('Please fill in all fields.');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters.');
    const res = await register(form);
    if (!res.success) setError(res.message);
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-white/5" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">TaskForge</span>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Start building<br />together.
            </h2>
            <p className="text-blue-100/80 text-base leading-relaxed max-w-xs">
              Join your team on TaskForge and start shipping work that matters.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {[
              { step: '01', title: 'Create your account', desc: 'Takes less than a minute.' },
              { step: '02', title: 'Join or create a project', desc: 'Admins can invite members.' },
              { step: '03', title: 'Start tracking tasks', desc: 'Kanban boards, priorities, deadlines.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-blue-200/70">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { value: '10k+', label: 'Tasks tracked' },
            { value: '500+', label: 'Teams' },
            { value: '99%', label: 'Uptime' },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl bg-white/10 border border-white/15 p-3 text-center">
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-[10px] text-blue-200/70 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FolderKanban className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">TaskForge</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Fill in the details below to get started.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  disabled={isRegistering}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={isRegistering}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={isRegistering}
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {form.password && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.label === 'Strong' ? 'text-green-600' :
                    strength.label === 'Good' ? 'text-yellow-600' :
                    strength.label === 'Fair' ? 'text-orange-500' : 'text-destructive'
                  }`}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Account type</label>
              <div className="flex gap-3">
                <RoleCard
                  value="member"
                  selected={form.role === 'member'}
                  onSelect={(v) => setForm({ ...form, role: v })}
                  icon={Users}
                  title="Member"
                  desc="Join projects & manage tasks"
                />
                <RoleCard
                  value="admin"
                  selected={form.role === 'admin'}
                  onSelect={(v) => setForm({ ...form, role: v })}
                  icon={ShieldCheck}
                  title="Admin"
                  desc="Create projects & manage team"
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isRegistering}>
              {isRegistering
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</>
                : <><span>Create Account</span><ArrowRight className="ml-2 h-4 w-4" /></>
              }
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t" />
            <span className="text-xs text-muted-foreground">Already have an account?</span>
            <div className="flex-1 border-t" />
          </div>

          <Link to="/login">
            <Button variant="outline" className="w-full">
              Sign in instead
            </Button>
          </Link>

          <p className="mt-5 text-center text-[11px] text-muted-foreground leading-relaxed">
            By creating an account you agree to our{' '}
            <span className="underline cursor-pointer hover:text-foreground">Terms of Service</span>
            {' '}and{' '}
            <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
