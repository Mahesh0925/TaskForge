import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Eye, EyeOff, Loader2, CheckCircle2, FolderKanban,
  LayoutDashboard, Users, Zap, ArrowRight
} from 'lucide-react';

// ─── Feature bullet used in the left panel ───────────────────────────────────
const Feature = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
      <Icon className="h-4 w-4 text-white" />
    </div>
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-blue-200/80 mt-0.5">{desc}</p>
    </div>
  </div>
);

// ─── Login Page ───────────────────────────────────────────────────────────────
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please fill in all fields.');
    const res = await login({ email, password });
    if (!res.success) setError(res.message);
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 -right-32 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-white/5" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">TaskForge</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Manage projects<br />with clarity.
            </h2>
            <p className="text-blue-100/80 text-base leading-relaxed max-w-xs">
              One place for your team to plan, track, and ship work — without the chaos.
            </p>
          </div>

          <div className="space-y-4">
            <Feature
              icon={LayoutDashboard}
              title="Real-time Dashboard"
              desc="See project health and task progress at a glance."
            />
            <Feature
              icon={Users}
              title="Team Collaboration"
              desc="Assign tasks, leave comments, and stay in sync."
            />
            <Feature
              icon={Zap}
              title="Kanban Boards"
              desc="Drag tasks across columns to reflect actual progress."
            />
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 rounded-xl bg-white/10 border border-white/15 p-4">
          <p className="text-sm text-blue-100 italic leading-relaxed">
            "TaskForge helped our team cut missed deadlines by 60% in the first month."
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
              S
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Sarah K.</p>
              <p className="text-[10px] text-blue-200/70">Engineering Lead</p>
            </div>
          </div>
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to continue to your workspace.
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoggingIn}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoggingIn}
                  className="pr-10"
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
            </div>

            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
                : <><span>Sign In</span><ArrowRight className="ml-2 h-4 w-4" /></>
              }
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t" />
            <span className="text-xs text-muted-foreground">New to TaskForge?</span>
            <div className="flex-1 border-t" />
          </div>

          {/* Register link */}
          <Link to="/register">
            <Button variant="outline" className="w-full">
              Create an account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
