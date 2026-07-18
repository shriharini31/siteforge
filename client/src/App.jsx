import { useState } from 'react';
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/useAuth.js';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { BudgetPanel } from './components/BudgetPanel.jsx';
import { ProjectsPage } from './pages/ProjectsPage.jsx';
import { ProjectDetailPage } from './pages/ProjectDetailPage.jsx';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      setError('');
      await login(formData.get('email'), formData.get('password'));
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <h1 className="text-3xl font-semibold">SiteForge</h1>
      <p className="mt-2 text-slate-300">Construction project and resource management</p>
      <form onSubmit={handleSubmit} className="mt-8 max-w-md rounded-xl bg-slate-900 p-6 shadow-lg">
        <h2 className="text-xl font-medium">Sign in</h2>
        <input name="email" type="email" placeholder="Email" className="mt-4 w-full rounded border border-slate-700 bg-slate-800 p-2" />
        <input name="password" type="password" placeholder="Password" className="mt-4 w-full rounded border border-slate-700 bg-slate-800 p-2" />
        <button className="mt-6 w-full rounded bg-emerald-500 px-4 py-2 font-semibold text-white">Login</button>
        {error ? <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p> : null}
        <p className="mt-4 text-sm text-slate-300">Need an account? <Link to="/register" className="font-medium text-emerald-400 hover:text-emerald-300">Register</Link></p>
      </form>
    </div>
  );
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      setError('');
      await register(formData.get('name'), formData.get('email'), formData.get('password'));
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <h1 className="text-3xl font-semibold">Create account</h1>
      <form onSubmit={handleSubmit} className="mt-8 max-w-md rounded-xl bg-slate-900 p-6 shadow-lg">
        <input name="name" placeholder="Name" className="mt-4 w-full rounded border border-slate-700 bg-slate-800 p-2" />
        <input name="email" type="email" placeholder="Email" className="mt-4 w-full rounded border border-slate-700 bg-slate-800 p-2" />
        <input name="password" type="password" placeholder="Password" className="mt-4 w-full rounded border border-slate-700 bg-slate-800 p-2" />
        <button className="mt-6 w-full rounded bg-emerald-500 px-4 py-2 font-semibold text-white">Register</button>
        {error ? <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p> : null}
        <p className="mt-4 text-sm text-slate-300">Already registered? <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">Sign in</Link></p>
      </form>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Welcome to SiteForge</h1>
            <p className="mt-2 text-slate-600">Signed in as {user?.name || user?.email}</p>
          </div>
          <nav className="flex gap-3 text-sm font-medium text-slate-700">
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'text-sky-700' : '')}>Dashboard</NavLink>
            <NavLink to="/projects" className={({ isActive }) => (isActive ? 'text-sky-700' : '')}>Projects</NavLink>
          </nav>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">Projects</div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">Budget</div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">Resources</div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <ProjectsPage />
          <BudgetPanel />
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
