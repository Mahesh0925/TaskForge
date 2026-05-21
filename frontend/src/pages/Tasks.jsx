import { useEffect, useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Clock, FolderKanban, Search, Filter, X, Loader2,
  Pencil, Trash2, MessageSquare, User, CheckCircle2, AlertCircle, ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';

// ─── Priority Badge ───────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const styles = {
    Urgent: 'bg-destructive/15 text-destructive',
    High: 'bg-orange-500/15 text-orange-500',
    Medium: 'bg-blue-500/15 text-blue-500',
    Low: 'bg-muted text-muted-foreground',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${styles[priority] || styles.Low}`}>
      {priority}
    </span>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    'Todo': 'bg-slate-100 text-slate-600',
    'In Progress': 'bg-blue-100 text-blue-600',
    'Review': 'bg-yellow-100 text-yellow-600',
    'Completed': 'bg-green-100 text-green-600',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || styles['Todo']}`}>
      {status}
    </span>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, size = 'md' }) => {
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full ${widths[size]} rounded-xl border bg-card shadow-xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// ─── Task Detail Modal ────────────────────────────────────────────────────────
const TaskDetail = ({ task, onStatusChange, onAddComment }) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    await onAddComment(task._id, comment.trim());
    setComment('');
    setSubmitting(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <PriorityBadge priority={task.priority} />
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {['Todo', 'In Progress', 'Review', 'Completed'].map((s) => <option key={s}>{s}</option>)}
        </select>
        {task.project && (
          <Link
            to={`/projects/${task.project._id}`}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <FolderKanban className="h-3.5 w-3.5" />
            {task.project.title}
          </Link>
        )}
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        {task.assignee && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                {task.assignee.name.charAt(0).toUpperCase()}
              </div>
              <span>{task.assignee.name}</span>
            </div>
          </div>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t pt-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Comments ({task.comments?.length || 0})
        </h4>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {(!task.comments || task.comments.length === 0) && (
            <p className="text-xs text-muted-foreground">No comments yet.</p>
          )}
          {task.comments?.map((c, i) => (
            <div key={i} className="flex gap-2.5">
              <div className="h-7 w-7 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                {(c.user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 rounded-lg bg-muted/50 px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{c.user?.name || 'Unknown'}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(c.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-sm">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleComment} className="flex gap-2">
          <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" className="flex-1" />
          <Button type="submit" size="sm" disabled={submitting || !comment.trim()}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
          </Button>
        </form>
      </div>
    </div>
  );
};

// ─── Task Card ────────────────────────────────────────────────────────────────
const TaskCard = ({ task, isAdmin, onView, onEdit, onDelete, onStatusChange }) => (
  <Card
    className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer"
    onClick={() => onView(task)}
  >
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-2">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="h-6 rounded border border-input bg-background px-1.5 text-[10px] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {['Todo', 'In Progress', 'Review', 'Completed'].map((s) => <option key={s}>{s}</option>)}
          </select>
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(task)}
                className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      <h4 className="font-medium text-sm mb-1 leading-snug">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </div>
          )}
          {task.comments?.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {task.comments.length}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.project && (
            <Link
              to={`/projects/${task.project._id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full hover:text-primary transition-colors"
            >
              <FolderKanban className="h-3 w-3" />
              <span className="truncate max-w-[80px]">{task.project.title}</span>
            </Link>
          )}
          {task.assignee && (
            <div
              title={task.assignee.name}
              className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold"
            >
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Tasks Page ───────────────────────────────────────────────────────────────
const COLUMNS = ['Todo', 'In Progress', 'Review', 'Completed'];
const PRIORITIES = ['All', 'Urgent', 'High', 'Medium', 'Low'];
const VIEWS = ['board', 'list'];

const Tasks = () => {
  const { tasks, fetchTasks, updateTask, deleteTask, addComment, isLoading } = useTaskStore();
  const { authUser } = useAuthStore();
  const isAdmin = authUser?.role === 'admin';

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [view, setView] = useState('board');
  const [modal, setModal] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const closeModal = () => { setModal(null); setSelectedTask(null); };

  const handleStatusChange = async (taskId, status) => {
    const res = await updateTask(taskId, { status });
    if (!res.success) showToast(res.message, 'error');
    if (selectedTask?._id === taskId) setSelectedTask((p) => ({ ...p, status }));
  };

  const handleAddComment = async (taskId, text) => {
    const res = await addComment(taskId, text);
    if (!res.success) showToast(res.message, 'error');
    const updated = tasks.find((t) => t._id === taskId);
    if (updated) setSelectedTask(updated);
  };

  const handleDelete = async () => {
    setSaving(true);
    const res = await deleteTask(selectedTask._id);
    setSaving(false);
    if (res.success) { showToast('Task deleted'); closeModal(); }
    else showToast(res.message, 'error');
  };

  const filtered = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchPriority && matchStatus;
  });

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'Todo').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-green-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">My Tasks</h2>
          <p className="text-muted-foreground">Track and manage your assigned work</p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'To Do', value: stats.todo, color: 'text-slate-600' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600' },
          { label: 'Completed', value: stats.completed, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="All">All Statuses</option>
            {COLUMNS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{p === 'All' ? 'All Priorities' : p}</option>)}
          </select>
          {(search || priorityFilter !== 'All' || statusFilter !== 'All') && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setPriorityFilter('All'); setStatusFilter('All'); }}>
              <X className="mr-1.5 h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Board View */}
      {view === 'board' && (
        <div className="overflow-x-auto">
          <div className="flex gap-5 min-w-max pb-4">
            {COLUMNS.map((col) => {
              const colTasks = filtered.filter((t) => t.status === col);
              const colColors = {
                'Todo': 'border-slate-200 bg-slate-50/50',
                'In Progress': 'border-blue-200 bg-blue-50/30',
                'Review': 'border-yellow-200 bg-yellow-50/30',
                'Completed': 'border-green-200 bg-green-50/30',
              };
              return (
                <div key={col} className={`flex flex-col w-72 shrink-0 rounded-xl border ${colColors[col]} p-3`}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-semibold text-sm">{col}</h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background border text-xs font-medium text-muted-foreground">
                      {colTasks.length}
                    </span>
                  </div>
                  <div className="space-y-2.5 overflow-y-auto max-h-[60vh] pr-0.5">
                    {colTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        isAdmin={isAdmin}
                        onView={(t) => { setSelectedTask(t); setModal('detail'); }}
                        onEdit={(t) => { setSelectedTask(t); setModal('edit'); }}
                        onDelete={(t) => { setSelectedTask(t); setModal('delete'); }}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg h-16 flex items-center justify-center text-xs text-muted-foreground/50">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="py-16 text-center border-2 border-dashed rounded-xl">
              <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                {search || priorityFilter !== 'All' || statusFilter !== 'All'
                  ? 'Try clearing your filters.'
                  : 'You have no tasks yet. Tasks assigned to you or in your projects will appear here.'}
              </p>
            </div>
          )}
          {COLUMNS.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col);
            if (colTasks.length === 0) return null;
            return (
              <div key={col} className="space-y-2">
                <div className="flex items-center gap-2 py-1">
                  <StatusBadge status={col} />
                  <span className="text-xs text-muted-foreground">{colTasks.length} task{colTasks.length !== 1 ? 's' : ''}</span>
                </div>
                {colTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    isAdmin={isAdmin}
                    onView={(t) => { setSelectedTask(t); setModal('detail'); }}
                    onEdit={(t) => { setSelectedTask(t); setModal('edit'); }}
                    onDelete={(t) => { setSelectedTask(t); setModal('delete'); }}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ── */}
      {modal === 'detail' && selectedTask && (
        <Modal title={selectedTask.title} onClose={closeModal} size="lg">
          <TaskDetail
            task={selectedTask}
            onStatusChange={handleStatusChange}
            onAddComment={handleAddComment}
          />
        </Modal>
      )}

      {modal === 'delete' && selectedTask && (
        <Modal title="Delete Task" onClose={closeModal} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Delete <span className="font-semibold text-foreground">"{selectedTask.title}"</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal} disabled={saving}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting…</> : 'Delete Task'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Tasks;
