import { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FolderKanban, Plus, Clock, Pencil, Trash2, X, Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="w-full max-w-lg rounded-xl border bg-card shadow-xl max-h-[90vh] flex flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-6 py-5 overflow-y-auto">{children}</div>
    </div>
  </div>
);

// ─── Project Form ─────────────────────────────────────────────────────────────
const ProjectForm = ({ initial = {}, onSubmit, onCancel, isLoading }) => {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    status: initial.status || 'Active',
    dueDate: initial.dueDate ? format(new Date(initial.dueDate), 'yyyy-MM-dd') : '',
    // Always store as strings so includes() comparison works reliably
    members: initial.members?.map(m => (m._id || m).toString()) || [],
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/users').then(res => setUsers(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMember = (userId) => {
    const id = userId.toString();
    setForm(prev => ({
      ...prev,
      members: prev.members.includes(id)
        ? prev.members.filter(existing => existing !== id)
        : [...prev.members, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setError('');
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
        <Input name="title" value={form.title} onChange={handleChange} placeholder="Project title" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="What is this project about?"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Due Date</label>
          <Input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
        </div>
      </div>

      {/* Members */}
      {users.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Members</label>
          <div className="max-h-36 overflow-y-auto rounded-md border border-input bg-background p-2 space-y-1">
            {users.map(u => (
              <label key={u._id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.members.includes(u._id.toString())}
                  onChange={() => toggleMember(u._id)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm truncate">{u.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto shrink-0">{u.role}</span>
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {form.members.length} member{form.members.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : 'Save Project'}
        </Button>
      </div>
    </form>
  );
};

// ─── Delete Confirm ───────────────────────────────────────────────────────────
const DeleteConfirm = ({ project, onConfirm, onCancel, isLoading }) => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      Are you sure you want to delete <span className="font-semibold text-foreground">"{project.title}"</span>?
      This will also delete all tasks inside it. This action cannot be undone.
    </p>
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
      <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting…</> : 'Delete Project'}
      </Button>
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    Completed: 'bg-green-500/10 text-green-600',
    'On Hold': 'bg-yellow-500/10 text-yellow-600',
    Active: 'bg-blue-500/10 text-blue-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.Active}`}>
      {status}
    </span>
  );
};

// ─── Projects Page ────────────────────────────────────────────────────────────
const Projects = () => {
  const { projects, fetchProjects, createProject, updateProject, deleteProject, isLoading } = useProjectStore();
  const { authUser } = useAuthStore();
  const isAdmin = authUser?.role === 'admin';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const closeModal = () => { setModal(null); setSelected(null); };

  const handleCreate = async (data) => {
    setSaving(true);
    const res = await createProject(data);
    setSaving(false);
    if (res.success) { showToast('Project created successfully'); closeModal(); }
    else showToast(res.message, 'error');
  };

  const handleEdit = async (data) => {
    setSaving(true);
    const res = await updateProject(selected._id, data);
    setSaving(false);
    if (res.success) { showToast('Project updated successfully'); closeModal(); }
    else showToast(res.message, 'error');
  };

  const handleDelete = async () => {
    setSaving(true);
    const res = await deleteProject(selected._id);
    setSaving(false);
    if (res.success) { showToast('Project deleted'); closeModal(); }
    else showToast(res.message, 'error');
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all ${
          toast.type === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-green-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Projects</h2>
          <p className="text-muted-foreground">Manage and track your team's projects</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setModal('create')}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Active', 'On Hold', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <div key={project._id} className="relative group">
            <Link to={`/projects/${project._id}`} className="block transition-transform hover:scale-[1.01]">
              <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <CardTitle className="mt-4 line-clamp-1">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {project.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress ?? 0}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${project.progress ?? 0}%` }}
                      />
                    </div>
                    {project.totalTasks !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {project.completedTasks} / {project.totalTasks} tasks completed
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="border-t bg-muted/20 pt-4 flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex -space-x-2">
                    {project.members?.slice(0, 4).map((member) => (
                      <div
                        key={member._id}
                        title={member.name}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-background bg-primary/20 text-primary text-[10px] font-bold"
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {project.members?.length > 4 && (
                      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-background bg-muted text-[10px] font-medium">
                        +{project.members.length - 4}
                      </div>
                    )}
                    {(!project.members || project.members.length === 0) && (
                      <span className="text-muted-foreground/60">No members</span>
                    )}
                  </div>
                  {project.dueDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(project.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </Link>

            {/* Admin action buttons */}
            {isAdmin && (
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => { e.preventDefault(); setSelected(project); setModal('edit'); }}
                  className="rounded-md p-1.5 bg-card border shadow-sm text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                  title="Edit project"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); setSelected(project); setModal('delete'); }}
                  className="rounded-md p-1.5 bg-card border shadow-sm text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
                  title="Delete project"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed rounded-xl">
            <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-medium">
              {search || statusFilter !== 'All' ? 'No projects match your filters' : 'No projects yet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              {search || statusFilter !== 'All'
                ? 'Try clearing your filters to see all projects.'
                : isAdmin
                  ? 'Create your first project to get started.'
                  : 'You have not been added to any projects yet. Ask an admin to add you as a member.'}
            </p>
            {isAdmin && !search && statusFilter === 'All' && (
              <Button className="mt-4" onClick={() => setModal('create')}>
                <Plus className="mr-2 h-4 w-4" /> Create Project
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'create' && (
        <Modal title="Create New Project" onClose={closeModal}>
          <ProjectForm onSubmit={handleCreate} onCancel={closeModal} isLoading={saving} />
        </Modal>
      )}
      {modal === 'edit' && selected && (
        <Modal title="Edit Project" onClose={closeModal}>
          <ProjectForm initial={selected} onSubmit={handleEdit} onCancel={closeModal} isLoading={saving} />
        </Modal>
      )}
      {modal === 'delete' && selected && (
        <Modal title="Delete Project" onClose={closeModal}>
          <DeleteConfirm project={selected} onConfirm={handleDelete} onCancel={closeModal} isLoading={saving} />
        </Modal>
      )}
    </div>
  );
};

export default Projects;
