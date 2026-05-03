import { useState, useEffect } from 'react';
import { api } from './api.js';

const sampleTasks = [
  { id: 1, title: 'Design task board', status: 'In progress', due: 'Today' },
  { id: 2, title: 'Create team roles', status: 'Todo', due: 'Tomorrow' },
  { id: 3, title: 'Review sprint backlog', status: 'Blocked', due: 'Overdue' }
];

export default function App() {
  const [mode, setMode] = useState('login');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeId: '',
    projectId: '',
    dueDate: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('board');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      loadData();
    }
  }, []);


  const loadData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        api.projects.getAll(),
        api.tasks.getAll(),
      ]);
      setProjects(projectsRes.projects || []);
      setTasks(tasksRes.tasks || []);

      // Create a default project if user has none
      if (!projectsRes.projects || projectsRes.projects.length === 0) {
        try {
          const defaultProject = await api.projects.create({
            name: 'My First Project',
            description: 'Welcome to Team Task Manager!'
          });
          setProjects([defaultProject.project]);
        } catch (err) {
          console.error('Failed to create default project:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleAuth = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.auth[mode](formData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.projectId) {
      setError('Title and project are required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const newTask = await api.tasks.create({
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        assigneeId: taskForm.assigneeId || undefined,
        projectId: taskForm.projectId,
        dueDate: taskForm.dueDate || undefined
      });

      setTasks(prev => [...prev, newTask.task]);
      setTaskForm({ title: '', description: '', projectId: '', dueDate: '' });
      setShowTaskForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.tasks.update(taskId, { status: newStatus });
      setTasks((prev) => prev.map((task) => task.id === taskId ? response.task : task));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedTask) {
      await handleStatusChange(draggedTask.id, newStatus);
      setDraggedTask(null);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProjects([]);
    setTasks([]);
    setError('');
    setShowTaskForm(false);
    setActiveTab('board');
    setSelectedProjectId(null);
    setSelectedTask(null);
  };


  const projectFilteredTasks = tasks.filter(task => !selectedProjectId || task.projectId === selectedProjectId);
  const filteredTasks = projectFilteredTasks.filter((task) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return [
      task.title,
      task.description,
      task.project?.name,
      task.assignee?.name,
      task.status
    ].some(field => field?.toLowerCase().includes(query));
  });

  const groupedTasks = {
    TODO: filteredTasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: filteredTasks.filter(t => t.status === 'IN_PROGRESS'),
    DONE: filteredTasks.filter(t => t.status === 'DONE'),
    BLOCKED: filteredTasks.filter(t => t.status === 'BLOCKED')
  };

  const statusOrder = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'];


  const getPriority = (status) => {
    if (status === 'BLOCKED') return 'High';
    if (status === 'IN_PROGRESS') return 'Medium';
    return 'Low';
  };

  const statusCounts = tasks.reduce((counts, task) => {
    counts[task.status] = (counts[task.status] || 0) + 1;
    return counts;
  }, {});
  const totalTasks = tasks.length;
  const completedTasks = statusCounts.DONE || 0;
  const progressPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (user) {
    return (
      <div className="app-shell">
        <header className="topbar">
          <div className="brand">Team Task Manager</div>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button className="pill" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <main className="grid-layout">
          <section className="panel dashboard-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Team Overview</p>
                <h2>Project Dashboard</h2>
              </div>
              <button className="secondary-button" onClick={() => setShowTaskForm(!showTaskForm)}>
                {showTaskForm ? 'Cancel' : 'New Task'}
              </button>
            </div>

            <div className="dashboard-main-layout">

                <aside className="sidebar">
                  <div className="project-section">
                    <div className="section-header">
                      <h3>Projects</h3>
                      <button className="add-btn">+</button>
                    </div>
                    <div className="project-list">
                      {projects.map(project => (
                        <div key={project.id} className={`project-item ${selectedProjectId === project.id ? 'active' : ''}`} onClick={() => setSelectedProjectId(selectedProjectId === project.id ? null : project.id)}>
                          {project.name}
                          <span>{project.members.length} members</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="quick-stats">
                    <div className="stat">
                      <span>Open</span>
                      <strong>{statusCounts.TODO || 0}</strong>
                    </div>
                    <div className="stat">
                      <span>In Progress</span>
                      <strong>{statusCounts.IN_PROGRESS || 0}</strong>
                    </div>
                    <div className="stat">
                      <span>Done</span>
                      <strong>{statusCounts.DONE || 0}</strong>
                    </div>
                  </div>
                </aside>

                <div className="main-content">

                {/* Quick project list */}
                <div className="project-list">
                  <h3>Projects ({projects.length})</h3>
                  <div className="project-items">
                    {projects.slice(0, 3).map(project => (
                      <div key={project.id} className="project-item" onClick={() => setSelectedProjectId(project.id)}>
                        <strong>{project.name}</strong>
                        <span>{project.tasks.length} tasks</span>
                      </div>
                    ))}
                    {projects.length > 3 && <div>+{projects.length - 3} more</div>}
                  </div>
                  <button className="link-button" onClick={() => setShowProjectForm(true)}>New Project</button>
                </div>

                <div className="progress-summary">
                  <div className="progress-labels">
                    <div><strong>{progressPercent}%</strong> Completed</div>
                    <div>{totalTasks} total tasks</div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                <div className="stats-grid">
                  <article className="stat-card bg-primary-soft">
                    <span>Active</span>
                    <strong>{statusCounts.TODO + statusCounts.IN_PROGRESS || 0}</strong>
                  </article>
                  <article className="stat-card bg-secondary-soft">
                    <span>Completed</span>
                    <strong>{completedTasks}</strong>
                  </article>
                  <article className="stat-card bg-accent-soft">
                    <span>Overdue</span>
                    <strong>{tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length}</strong>
                  </article>
                </div>


                {showTaskForm && (
                  <div className="task-form">
                <h3>Create New Task</h3>
                {projects.length === 0 ? (
                  <div className="error-message">
                    You need to create a project first before adding tasks.
                    <br />
                    <small>Use the API or add project creation functionality.</small>
                  </div>
                ) : (
                  <>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleCreateTask}>
                      <div className="form-field">
                        <label>Title *</label>
                        <input
                          type="text"
                          value={taskForm.title}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Task title"
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label>Description</label>
                        <textarea
                          value={taskForm.description}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Task description (optional)"
                          rows="3"
                        />
                      </div>
                      <div className="form-field">
                        <label>Project *</label>
                        <select
                          value={taskForm.projectId}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, projectId: e.target.value }))}
                          required
                        >
                          <option value="">Select a project</option>
                          {projects.map(project => (
                            <option key={project.id} value={project.id}>{project.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-row">
                        <div className="form-field">
                          <label>Priority</label>
                          <select
                            value={taskForm.priority}
                            onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                          </select>
                        </div>
                        <div className="form-field">
                          <label>Assignee</label>
                          <select
                            value={taskForm.assigneeId}
                            onChange={(e) => setTaskForm(prev => ({ ...prev, assigneeId: e.target.value }))}
                          >
                            <option value="">Unassigned</option>
                            {projects.find(p => p.id === taskForm.projectId)?.members?.map(m => (
                              <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                            )) || []}
                          </select>
                        </div>
                      </div>
                      <div className="form-field">
                        <label>Due Date</label>
                        <input
                          type="date"
                          value={taskForm.dueDate}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        />
                      </div>

                      <div className="form-actions">
                        <button type="button" className="secondary-button" onClick={() => setShowTaskForm(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="primary-button" disabled={loading}>
                          {loading ? 'Creating...' : 'Create Task'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            )}
              </div>

              <div className="dashboard-board">
                <div className="dashboard-tabs">
                  <button className={`tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
                    Summary
                  </button>
                  <button className={`tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
                    List
                  </button>
                  <button className={`tab ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>
                    Board
                  </button>
                </div>

                <div className="filter-row">
                  <input
                    type="search"
                    className="search-input"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="filter-actions">
                    <select onChange={(e) => setSelectedProjectId(e.target.value || null)}>
                      <option value="">All projects</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                {activeTab === 'list' ? (
                  <div className="task-table">
                    <div className="task-row task-row-header">
                      <span>Work</span>
                      <span>Assignee</span>
                      <span>Priority</span>
                      <span>Status</span>
                      <span>Due</span>
                    </div>
                    {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                      <div key={task.id} className="task-row" onClick={() => handleTaskClick(task)}>
                        <div className="task-title-cell">
                          <div className="task-key">#{task.id}</div>
                          <div>
                            <strong>{task.title}</strong>
                            <p>{task.project?.name || 'No project'}</p>
                          </div>
                        </div>
                        <span>{task.assignee?.name || 'Unassigned'}</span>
                        <span>{getPriority(task.status)}</span>
                        <span>
                          <span className={`status-pill status-${task.status.toLowerCase().replace('_', '-')}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </span>
                        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                      </div>
                    )) : (
                      <div className="empty-table-row">No tasks found.</div>
                    )}
                  </div>
                ) : activeTab === 'board' ? (
                  <div className="kanban-board">
                    {statusOrder.map(status => (
                      <div
                        key={status}
                        className="kanban-column"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                      >
                        <div className="column-header">
                          <h3>{status.replace('_', ' ').toLowerCase()}</h3>
                          <span>{groupedTasks[status].length}</span>
                        </div>
                        {groupedTasks[status].map(task => (
                          <div
                            key={task.id}
                            className="kanban-task"
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="task-title">{task.title}</div>
                            <div className="task-meta">
                              <span>#{task.id}</span>
                              {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
                              <span className={`status-dot status-${task.status.toLowerCase()}`}></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="summary-placeholder">Summary view content</div>
                )}

              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Team Task Manager</div>
        <button className="mode-toggle" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Create Account' : 'Sign In'}
        </button>
      </header>

      <main className="login-layout">
        <section className="login-form">
          <div className="login-container">
            <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
            <p>{mode === 'login' ? 'Access your workspace securely' : 'Join thousands of productive teams'}</p>
            {error && <div className="error-message">{error}</div>}
            <form className="auth-form" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData);
              handleAuth(data);
            }}>
              <div className="form-field-floating">
                <input type="email" name="email" id="email" placeholder=" " required />
                <label htmlFor="email">Email</label>
              </div>
              {mode === 'signup' && (
                <div className="form-field-floating">
                  <input type="text" name="name" id="name" placeholder=" " required />
                  <label htmlFor="name">Full name</label>
                </div>
              )}
              <div className="form-field-floating">
                <input type="password" name="password" id="password" placeholder=" " required />
                <label htmlFor="password">Password</label>
              </div>
              <button type="submit" className="login-btn" disabled={loading}>
                <span>{loading ? 'Loading...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}</span>
              </button>
            </form>
            <div className="login-footer">
              <button className="mode-toggle-link" type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Create Account' : 'Sign In instead'}
              </button>
            </div>
          </div>
        </section>

        <section className="login-promo">
          <div className="ttm-logo">
            <div className="logo-mark">📊</div>
            <div className="logo-brand">
              <h1>TTM</h1>
              <p>Team Task Manager</p>
              <p className="tagline">Modern workspace for teams</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

