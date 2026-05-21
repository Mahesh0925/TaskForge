import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { axiosInstance } from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  User, Mail, Lock, Eye, EyeOff, Loader2, Trash2,
  ShieldCheck, Users, AlertTriangle, CheckCircle2,
  X, RefreshCw, Search, Settings as SettingsIcon, UserCog, Skull,
  Crown, Calendar
} from 'lucide-react';

// ─── Shared: Toast notification ───────────────────────────────────────────────
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-medium shadow-2xl border ${
      toast.type === 'error'
        ? 'bg-destructive text-destructive-foreground border-destructive/20'
        : 'bg-green-600 text-white border-green-500/30'
    }`}>
      {toast.type === 'error'
        ? <AlertTriangle className="h-4 w-4 shrink-0" />
        : <CheckCircle2 className="h-4 w-4 shrink-0" />}
      <span>{toast.message}</span>
    </div>
  );
};

// ─── Shared: Confirm Modal ────────────────────────────────────────────────────
const ConfirmModal = ({ title, message, confirmLabel, variant = 'destructive', onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="w-full max-w-md rounded-2xl border bg-card shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
            variant === 'destructive' ? 'bg-destructive/10' : 'bg-primary/10'
          }`}>
            {variant === 'destructive'
              ? <AlertTriangle className="h-4 w-4 text-destructive" />
              : <ShieldCheck className="h-4 w-4 text-primary" />}
          </div>
          <h3 className="font-semibold text-base">{title}</h3>
        </div>
        <button onClick={onCancel} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="px-6 py-5 space-y-5">
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant={variant} size="sm" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Shared: Role Badge ───────────────────────────────────────────────────────
const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
    role === 'admin'
      ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
      : 'bg-muted text-muted-foreground ring-1 ring-border'
  }`}>
    {role === 'admin' ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />}
    {role === 'admin' ? 'Admin' : 'Member'}
  </span>
);

// ─── Shared: Section card ─────────────────────────────────────────────────────
const SectionCard = ({ title, description, icon: Icon, children, className = '' }) => (
  <div className={`rounded-2xl border bg-card shadow-sm overflow-hidden ${className}`}>
    {(title || description) && (
      <div className="px-6 py-5 border-b bg-muted/20">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            {title && <h3 className="font-semibold text-sm">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Profile
// ═══════════════════════════════════════════════════════════════════════════════
const ProfileTab = ({ authUser, showToast, onProfileUpdate }) => {
  const [form, setForm] = useState({
    name: authUser?.name || '',
    email: authUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (form.newPassword) {
      if (!form.currentPassword) errs.currentPassword = 'Current password required';
      if (form.newPassword.length < 6) errs.newPassword = 'Min. 6 characters';
      if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      const res = await axiosInstance.put('/users/profile', payload);
      onProfileUpdate(res.data);
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
      showToast('Profile updated successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Avatar color based on name
  const avatarColors = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-600',
  ];
  const colorIndex = (authUser?.name?.charCodeAt(0) || 0) % avatarColors.length;

  return (
    <div className="space-y-5">
      {/* Profile card */}
      <SectionCard title="Your Profile" description="How others see you in TaskForge" icon={User}>
        <div className="flex items-center gap-5">
          <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${avatarColors[colorIndex]} flex items-center justify-center text-3xl font-bold text-white shadow-lg shrink-0`}>
            {authUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1.5">
            <p className="text-xl font-bold">{authUser?.name}</p>
            <p className="text-sm text-muted-foreground">{authUser?.email}</p>
            <RoleBadge role={authUser?.role} />
          </div>
        </div>
      </SectionCard>

      {/* Account info form */}
      <SectionCard title="Account Information" description="Update your name and email address" icon={Mail}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="name" value={form.name} onChange={handleChange}
                  placeholder="John Doe" className={`pl-9 ${errors.name ? 'border-destructive' : ''}`} />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="name@example.com" className={`pl-9 ${errors.email ? 'border-destructive' : ''}`} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          {/* Password section */}
          <div className="rounded-xl border border-dashed bg-muted/20 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Change Password</p>
              <span className="text-xs text-muted-foreground">(leave blank to keep current)</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Current Password', name: 'currentPassword', showKey: 'current' },
                { label: 'New Password', name: 'newPassword', showKey: 'new' },
                { label: 'Confirm Password', name: 'confirmPassword', showKey: 'confirm' },
              ].map(({ label, name, showKey }) => (
                <div key={name} className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
                  <div className="relative">
                    <Input
                      name={name}
                      type={show[showKey] ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form[name]}
                      onChange={handleChange}
                      className={`pr-10 ${errors[name] ? 'border-destructive' : ''}`}
                    />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {show[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors[name] && <p className="text-xs text-destructive">{errors[name]}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="min-w-[130px]">
              {saving
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                : <><CheckCircle2 className="mr-2 h-4 w-4" />Save Changes</>}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Team Members
// ═══════════════════════════════════════════════════════════════════════════════
const TeamTab = ({ authUser, showToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [confirm, setConfirm] = useState(null);
  const [acting, setActing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/users');
      setUsers(res.data);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async () => {
    setActing(true);
    try {
      const res = await axiosInstance.put(`/users/${confirm.user._id}/role`, { role: confirm.newRole });
      setUsers(prev => prev.map(u => u._id === confirm.user._id ? res.data : u));
      showToast(`${confirm.user.name}'s role updated to ${confirm.newRole}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    } finally { setActing(false); setConfirm(null); }
  };

  const handleDelete = async () => {
    setActing(true);
    try {
      await axiosInstance.delete(`/users/${confirm.user._id}`);
      setUsers(prev => prev.filter(u => u._id !== confirm.user._id));
      showToast(`${confirm.user.name} removed`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally { setActing(false); setConfirm(null); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const admins = users.filter(u => u.role === 'admin').length;
  const members = users.filter(u => u.role === 'member').length;

  const avatarColors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, bg: 'bg-blue-50', iconColor: 'text-blue-600', border: 'border-blue-100' },
          { label: 'Admins', value: admins, icon: Crown, bg: 'bg-primary/5', iconColor: 'text-primary', border: 'border-primary/10' },
          { label: 'Members', value: members, icon: User, bg: 'bg-muted', iconColor: 'text-muted-foreground', border: 'border-border' },
        ].map(({ label, value, icon: Icon, bg, iconColor, border }) => (
          <div key={label} className={`rounded-2xl border ${border} bg-card p-5 flex items-center gap-4`}>
            <div className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-10" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border bg-card p-1">
          {['All', 'admin', 'member'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                roleFilter === r
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}>
              {r === 'All' ? 'All Roles' : r}
            </button>
          ))}
        </div>
        <button onClick={fetchUsers} title="Refresh"
          className="h-10 w-10 rounded-lg border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Users list */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-muted/30 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>User</span>
          <span className="hidden sm:block">Joined</span>
          <span>Role</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium">No users found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((user) => {
              const isSelf = user._id === authUser?._id;
              const colorIdx = (user.name?.charCodeAt(0) || 0) % avatarColors.length;
              return (
                <div key={user._id}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-muted/20 transition-colors">
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-9 w-9 shrink-0 rounded-xl ${avatarColors[colorIdx]} flex items-center justify-center text-sm font-bold text-white`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        {isSelf && (
                          <span className="shrink-0 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">You</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Joined date */}
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  {/* Role */}
                  <RoleBadge role={user.role} />

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!isSelf ? (
                      <>
                        <select
                          value={user.role}
                          onChange={e => setConfirm({ type: 'role', user, newRole: e.target.value })}
                          className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => setConfirm({ type: 'delete', user })}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border border-transparent hover:border-destructive/20"
                          title="Remove user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground/50 italic">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t bg-muted/10 text-xs text-muted-foreground">
            Showing {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Confirm modals */}
      {confirm?.type === 'role' && (
        <ConfirmModal
          title="Change Role"
          message={`Change ${confirm.user.name}'s role from "${confirm.user.role}" to "${confirm.newRole}"? They will ${confirm.newRole === 'admin' ? 'gain full admin access.' : 'lose admin privileges.'}`}
          confirmLabel="Change Role"
          variant="default"
          onConfirm={handleRoleChange}
          onCancel={() => setConfirm(null)}
          isLoading={acting}
        />
      )}
      {confirm?.type === 'delete' && (
        <ConfirmModal
          title="Remove User"
          message={`Remove ${confirm.user.name} (${confirm.user.email}) from TaskForge? This cannot be undone.`}
          confirmLabel="Remove User"
          variant="destructive"
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          isLoading={acting}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Danger Zone
// ═══════════════════════════════════════════════════════════════════════════════
const DangerTab = ({ showToast }) => {
  const [stats, setStats] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/projects'),
      axiosInstance.get('/tasks'),
      axiosInstance.get('/users'),
    ]).then(([p, t, u]) => setStats({
      projects: p.data.length,
      tasks: t.data.length,
      users: u.data.length,
    })).catch(() => {});
  }, []);

  const actions = [
    {
      id: 'clearTasks',
      icon: Trash2,
      title: 'Clear All Tasks',
      description: 'Permanently delete every task across all projects. Projects and members will remain intact.',
      buttonLabel: 'Clear All Tasks',
      confirmMessage: `This will permanently delete all ${stats?.tasks ?? 0} tasks across all projects. Projects will remain but be empty. This cannot be undone.`,
      count: stats?.tasks,
      countLabel: 'tasks',
    },
    {
      id: 'clearProjects',
      icon: Skull,
      title: 'Delete All Projects',
      description: 'Permanently delete all projects and every task inside them. User accounts will remain.',
      buttonLabel: 'Delete All Projects',
      confirmMessage: `This will permanently delete all ${stats?.projects ?? 0} projects and their tasks. User accounts will remain. This cannot be undone.`,
      count: stats?.projects,
      countLabel: 'projects',
    },
  ];

  const handleAction = async () => {
    setActing(true);
    try {
      if (confirm === 'clearTasks') {
        await axiosInstance.delete('/tasks/all');
        setStats(s => ({ ...s, tasks: 0 }));
        showToast('All tasks deleted');
      } else if (confirm === 'clearProjects') {
        await axiosInstance.delete('/projects/all');
        setStats(s => ({ ...s, projects: 0, tasks: 0 }));
        showToast('All projects deleted');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActing(false);
      setConfirm(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Warning banner */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className="font-semibold text-sm text-destructive">Danger Zone</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Actions on this page are <strong className="text-foreground">permanent and irreversible</strong>.
            There is no undo. Please be absolutely certain before proceeding.
          </p>
        </div>
      </div>

      {/* System stats */}
      {stats && (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/20">
            <p className="text-sm font-semibold">Current System Data</p>
            <p className="text-xs text-muted-foreground mt-0.5">Live counts of data in the database</p>
          </div>
          <div className="grid grid-cols-3 divide-x">
            {[
              { label: 'Projects', value: stats.projects, color: 'text-blue-600' },
              { label: 'Tasks', value: stats.tasks, color: 'text-violet-600' },
              { label: 'Users', value: stats.users, color: 'text-emerald-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-5 text-center">
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger actions */}
      <div className="space-y-3">
        {actions.map(action => (
          <div key={action.id} className="rounded-2xl border border-destructive/20 bg-card shadow-sm overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <action.icon className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{action.title}</p>
                  {action.count !== undefined && (
                    <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">
                      {action.count} {action.countLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{action.description}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => setConfirm(action.id)}
                disabled={action.count === 0}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {action.buttonLabel}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {confirm && (
        <ConfirmModal
          title="Are you absolutely sure?"
          message={actions.find(a => a.id === confirm)?.confirmMessage}
          confirmLabel="Yes, delete permanently"
          variant="destructive"
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          isLoading={acting}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN Settings Page — sidebar nav layout
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'profile',  label: 'Profile',       icon: UserCog,       desc: 'Your account info' },
  { id: 'team',     label: 'Team Members',  icon: Users,         desc: 'Manage your team' },
  { id: 'danger',   label: 'Danger Zone',   icon: AlertTriangle, desc: 'Irreversible actions', danger: true },
];

const Settings = () => {
  const { authUser, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const active = TABS.find(t => t.id === activeTab);

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <SettingsIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your account and team</p>
        </div>
      </div>

      {/* Layout: sidebar + content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Sidebar nav */}
        <nav className="w-full lg:w-56 shrink-0 rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="p-2 space-y-0.5">
            {TABS.map(({ id, label, icon: Icon, desc, danger }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group ${
                  activeTab === id
                    ? danger
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-primary/10 text-primary'
                    : danger
                      ? 'text-muted-foreground hover:bg-destructive/5 hover:text-destructive'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  activeTab === id
                    ? danger ? 'bg-destructive/15' : 'bg-primary/15'
                    : 'bg-muted group-hover:bg-muted/80'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-none">{label}</p>
                  <p className="text-[11px] mt-0.5 opacity-70 truncate">{desc}</p>
                </div>
                {activeTab === id && (
                  <div className={`ml-auto h-1.5 w-1.5 rounded-full shrink-0 ${danger ? 'bg-destructive' : 'bg-primary'}`} />
                )}
              </button>
            ))}
          </div>

          {/* Admin info at bottom of sidebar */}
          <div className="border-t p-3 m-2 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                {authUser?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{authUser?.name}</p>
                <RoleBadge role={authUser?.role} />
              </div>
            </div>
          </div>
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {/* Content header */}
          <div className="mb-5 flex items-center gap-3">
            <active.icon className={`h-5 w-5 ${active.danger ? 'text-destructive' : 'text-primary'}`} />
            <div>
              <h3 className="font-bold text-lg leading-none">{active.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{active.desc}</p>
            </div>
          </div>

          {activeTab === 'profile' && (
            <ProfileTab authUser={authUser} showToast={showToast} onProfileUpdate={checkAuth} />
          )}
          {activeTab === 'team' && (
            <TeamTab authUser={authUser} showToast={showToast} />
          )}
          {activeTab === 'danger' && (
            <DangerTab showToast={showToast} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
