import { useState, useEffect } from 'react';
import { api } from './api.js';

const sampleTasks = [
  { id: 1, title: 'Design task board', status: 'In progress', due: 'Today' },
  { id: 2, title: 'Create team roles', status: 'Todo', due: 'Tomorrow' },
  { id: 3, title: 'Review sprint backlog', status: 'Blocked', due: 'Overdue' }
];

export default function App() {
  const [mode, setMode] = useState('login');
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    projectId: '',
    dueDate: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Validate token and load user data
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

            <div className="stats-grid">
              <article className="stat-card bg-primary-soft">
                <span>Projects</span>
                <strong>{projects.length}</strong>
              </article>
              <article className="stat-card bg-secondary-soft">
                <span>Active tasks</span>
                <strong>{tasks.length}</strong>
              </article>
              <article className="stat-card bg-accent-soft">
                <span>Overdue</span>
                <strong>{tasks.filter(t => t.status === 'BLOCKED').length}</strong>
              </article>
            </div>

            <div className="task-board">
              <div className="board-header">
                <h3>Current tasks</h3>
                <span>Updated just now</span>
              </div>
              {tasks.length > 0 ? tasks.map(task => (
                <div key={task.id} className="task-card">
                  <div>
                    <h4>{task.title}</h4>
                    <p>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
                  </div>
                  <span className={`status-pill status-${task.status.toLowerCase().replace('_', '-')}`}>{task.status}</span>
                </div>
              )) : (
                <p>No tasks yet. Create your first task!</p>
              )}
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
        <button className="pill" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Switch to Signup' : 'Switch to Login'}
        </button>
      </header>

      <main className="grid-layout">
        <section className="panel auth-panel">
          <h1>{mode === 'login' ? 'Welcome Back' : 'Create an Account'}</h1>
          <p>{mode === 'login' ? 'Login to manage teams and tasks.' : 'Signup to get started with task management.'}</p>
          {error && <div className="error-message">{error}</div>}
          <form className="form-card" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            handleAuth(data);
          }}>
            <div className="form-field">
              <label>Email</label>
              <input type="email" name="email" placeholder="hello@company.com" required />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input type="password" name="password" placeholder="Enter password" required />
            </div>
            {mode === 'signup' && (
              <div className="form-field">
                <label>Full name</label>
                <input type="text" name="name" placeholder="Your name" required />
              </div>
            )}
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Loading...' : (mode === 'login' ? 'Login' : 'Signup')}
            </button>
          </form>
        </section>

        <section className="panel dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Team Overview</p>
              <h2>Project Dashboard</h2>
            </div>
            <button className="secondary-button">New Task</button>
          </div>

          <div className="stats-grid">
            <article className="stat-card bg-primary-soft">
              <span>Projects</span>
              <strong>6</strong>
            </article>
            <article className="stat-card bg-secondary-soft">
              <span>Active tasks</span>
              <strong>18</strong>
            </article>
            <article className="stat-card bg-accent-soft">
              <span>Overdue</span>
              <strong>4</strong>
            </article>
          </div>

          <div className="task-board">
            <div className="board-header">
              <h3>Current tasks</h3>
              <span>Updated 5 minutes ago</span>
            </div>
            {sampleTasks.map(task => (
              <div key={task.id} className="task-card">
                <div>
                  <h4>{task.title}</h4>
                  <p>{task.due}</p>
                </div>
                <span className={`status-pill status-${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
