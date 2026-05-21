import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Plus, Clock, X, Loader2, Pencil, Trash2, ChevronLeft,
  GripVertical, MessageSquare, User, AlertCircle, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

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

// ─── Task Form ────────────────────────────────────────────────────────────────
const TaskForm = ({ initial = {}, projectId, projectMembers = [], onSubmit, onCancel, isLoading }) => {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    status: initial.status || 'Todo',
    priority: initial.priority || 'Medium',
    assignee: initial.assignee?._id || initial.assignee || '',
    dueDate: initial.dueDate ? format(new Date(initial.dueDate), 'yyyy-MM-dd') : '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setError('');
    const payload = { ...form, project: projectId };
    if (!payload.assignee) delete payload.assignee;
    if (!payload.dueDate) delete payload.dueDate;
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
        <Input name="title" value={form.title} onChange={handleChange} placeholder="Task title" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the task…"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Status</label>
          <select name="status" value={form.status} onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option>Todo</option>
            <option>In Progress</option>
            <option>Review</option>
            <option>Completed</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Assignee</label>
          <select name="assignee" value={form.assignee} onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">Unassigned</option>
            {projectMembers.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Due Date</label>
          <Input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : 'Save Task'}
        </Button>
      </div>
    </form>
  );
};

// ─── Task Detail Modal ────────────────────────────────────────────────────────
const TaskDetail = ({ task, onClose, onStatusChange, onAddComment, authUser, isAdmin }) => {
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

  const statusOptions = ['Todo', 'In Progress', 'Review', 'Completed'];

  return (
    <div className="space-y-5">
      {/* Priority + Status */}
      <div className="flex items-center gap-3 flex-wrap">
        <PriorityBadge priority={task.priority} />
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {statusOptions.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
      )}

      {/* Meta */}
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

      {/* Comments */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Comments ({task.comments?.length || 0})
        </h4>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {task.comments?.length === 0 && (
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
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={submitting || !comment.trim()}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
          </Button>
        </form>
      </div>
    </div>
  );
};

// ─── Kanban Column ────────────────────────────────────────────────────────────
const COLUMN_COLORS = {
  'Todo': 'border-slate-200 bg-slate-50/50',
  'In Progress': 'border-blue-200 bg-blue-50/30',
  'Review': 'border-yellow-200 bg-yellow-50/30',
  'Completed': 'border-green-200 bg-green-50/30',
};

// ─── Project Details Page ─────────────────────────────────────────────────────
const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, fetchProjectById, deleteProject, isLoading: projectLoading } = useProjectStore();
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, addComment, isLoading: tasksLoading } = useTaskStore();
  const { authUser } = useAuthStore();
  const isAdmin = authUser?.role === 'admin';

  const [modal, setModal] = useState(null); // null | 'addTask' | 'editTask' | 'deleteTask' | 'deleteProject' | 'taskDetail'
  const [selectedTask, setSelectedTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProjectById(id);
    fetchTasks(id);
  }, [id, fetchProjectById, fetchTasks]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const closeModal = () => { setModal(null); setSelectedTask(null); };

  const handleCreateTask = async (data) => {
    setSaving(true);
    const res = await createTask(data);
    setSaving(false);
    if (res.success) { showToast('Task created'); closeModal(); }
    else showToast(res.message, 'error');
  };

  const handleEditTask = async (data) => {
    setSaving(true);
    const res = await updateTask(selectedTask._id, data);
    setSaving(false);
    if (res.success) { showToast('Task updated'); closeModal(); }
    else showToast(res.message, 'error');
  };

  const handleDeleteTask = async () => {
    setSaving(true);
    const res = await deleteTask(selectedTask._id);
    setSaving(false);
    if (res.success) { showToast('Task deleted'); closeModal(); }
    else showToast(res.message, 'error');
  };

  const handleDeleteProject = async () => {
    setSaving(true);
    const res = await deleteProject(id);
    setSaving(false);
    if (res.success) { navigate('/projects'); }
    else showToast(res.message, 'error');
  };

  const handleStatusChange = async (taskId, status) => {
    const res = await updateTask(taskId, { status });
    if (!res.success) showToast(res.message, 'error');
    // Refresh task in detail modal if open
    if (selectedTask?._id === taskId) {
      setSelectedTask((prev) => ({ ...prev, status }));
    }
  };

  const handleAddComment = async (taskId, text) => {
    const res = await addComment(taskId, text);
    if (!res.success) showToast(res.message, 'error');
    // Update selected task comments from store
    const updated = tasks.find((t) => t._id === taskId);
    if (updated) setSelectedTask(updated);
  };

  const columns = ['Todo', 'In Progress', 'Review', 'Completed'];

  if (projectLoading && !currentProject) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">Project not found or you don't have access.</p>
        <Button variant="outline" onClick={() => navigate('/projects')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6 h-full flex flex-col">
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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/projects" className="hover:text-primary transition-colors flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Projects
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{currentProject.title}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">{currentProject.title}</h2>
          {currentProject.description && (
            <p className="text-muted-foreground max-w-xl">{currentProject.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <>
              <Button variant="outline" size="sm" onClick={() => setModal('deleteProject')}>
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
              <Button onClick={() => setModal('addTask')}>
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Tasks</p>
          <p className="text-2xl font-bold">{tasks.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{tasks.filter((t) => t.status === 'In Progress').length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Progress</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">{progress}%</p>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {tasksLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-5 min-w-max pb-4 h-full">
            {columns.map((column) => {
              const columnTasks = tasks.filter((t) => t.status === column);
              return (
                <div
                  key={column}
                  className={`flex flex-col w-72 shrink-0 rounded-xl border ${COLUMN_COLORS[column]} p-3`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-semibold text-sm">{column}</h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background border text-xs font-medium text-muted-foreground">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Task Cards */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                    {columnTasks.map((task) => (
                      <Card
                        key={task._id}
                        className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                        onClick={() => { setSelectedTask(task); setModal('taskDetail'); }}
                      >
                        <CardContent className="p-3.5">
                          <div className="flex justify-between items-start mb-2">
                            <PriorityBadge priority={task.priority} />
                            {isAdmin && (
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => { setSelectedTask(task); setModal('editTask'); }}
                                  className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                                  title="Edit task"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => { setSelectedTask(task); setModal('deleteTask'); }}
                                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                                  title="Delete task"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          <h4 className="font-medium text-sm leading-snug mb-1.5">{task.title}</h4>

                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                          )}

                          <div className="flex items-center justify-between mt-2 pt-2 border-t">
                            {task.dueDate ? (
                              <div className="flex items-center text-xs text-muted-foreground gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(task.dueDate), 'MMM d')}
                              </div>
                            ) : <div />}

                            {task.assignee ? (
                              <div
                                title={task.assignee.name}
                                className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold"
                              >
                                {task.assignee.name.charAt(0).toUpperCase()}
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                <User className="h-3 w-3 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>

                          {task.comments?.length > 0 && (
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3" />
                              {task.comments.length}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {columnTasks.length === 0 && (
                      <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg h-20 flex items-center justify-center text-xs text-muted-foreground/50">
                        No tasks
                      </div>
                    )}
                  </div>

                  {/* Quick add for admin */}
                  {isAdmin && (
                    <button
                      onClick={() => setModal('addTask')}
                      className="mt-2 flex items-center gap-1.5 w-full rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add task
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {modal === 'addTask' && (
        <Modal title="Add New Task" onClose={closeModal}>
          <TaskForm
            projectId={id}
            projectMembers={currentProject.members || []}
            onSubmit={handleCreateTask}
            onCancel={closeModal}
            isLoading={saving}
          />
        </Modal>
      )}

      {modal === 'editTask' && selectedTask && (
        <Modal title="Edit Task" onClose={closeModal}>
          <TaskForm
            initial={selectedTask}
            projectId={id}
            projectMembers={currentProject.members || []}
            onSubmit={handleEditTask}
            onCancel={closeModal}
            isLoading={saving}
          />
        </Modal>
      )}

      {modal === 'deleteTask' && selectedTask && (
        <Modal title="Delete Task" onClose={closeModal} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Delete <span className="font-semibold text-foreground">"{selectedTask.title}"</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal} disabled={saving}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteTask} disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting…</> : 'Delete Task'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'deleteProject' && (
        <Modal title="Delete Project" onClose={closeModal} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Delete <span className="font-semibold text-foreground">"{currentProject.title}"</span> and all its tasks? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal} disabled={saving}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteProject} disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting…</> : 'Delete Project'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'taskDetail' && selectedTask && (
        <Modal title={selectedTask.title} onClose={closeModal} size="lg">
          <TaskDetail
            task={selectedTask}
            onClose={closeModal}
            onStatusChange={handleStatusChange}
            onAddComment={handleAddComment}
            authUser={authUser}
            isAdmin={isAdmin}
          />
        </Modal>
      )}
    </div>
  );
};

export default ProjectDetails;
