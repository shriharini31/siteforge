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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-white sm:p-8">
      <div className="w-full max-w-md"><h1 className="text-3xl font-semibold">SiteForge</h1>
      <p className="mt-2 text-slate-300">Construction project and resource management</p>
      <form onSubmit={handleSubmit} className="mt-8 rounded-xl bg-slate-900 p-5 shadow-lg sm:p-6">
        <h2 className="text-xl font-medium">Sign in</h2>
        <label htmlFor="login-email" className="mt-4 block text-sm font-medium text-slate-200">Email</label><input id="login-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-3" />
        <label htmlFor="login-password" className="mt-4 block text-sm font-medium text-slate-200">Password</label><input id="login-password" name="password" type="password" autoComplete="current-password" required placeholder="Your password" className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-3" />
        <button className="mt-6 w-full rounded bg-emerald-500 px-4 py-2 font-semibold text-white">Login</button>
        {error ? <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p> : null}
        <p className="mt-4 text-sm text-slate-300">Need an account? <Link to="/register" className="font-medium text-emerald-400 hover:text-emerald-300">Register</Link></p>
      </form></div>
    </main>
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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-white sm:p-8">
      <div className="w-full max-w-md"><h1 className="text-3xl font-semibold">Create account</h1>
      <form onSubmit={handleSubmit} className="mt-8 rounded-xl bg-slate-900 p-5 shadow-lg sm:p-6">
        <label htmlFor="register-name" className="mt-1 block text-sm font-medium text-slate-200">Name</label><input id="register-name" name="name" autoComplete="name" required placeholder="Your name" className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-3" />
        <label htmlFor="register-email" className="mt-4 block text-sm font-medium text-slate-200">Email</label><input id="register-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-3" />
        <label htmlFor="register-password" className="mt-4 block text-sm font-medium text-slate-200">Password</label><input id="register-password" name="password" type="password" autoComplete="new-password" required placeholder="At least 8 characters" className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-3" />
        <button className="mt-6 w-full rounded bg-emerald-500 px-4 py-2 font-semibold text-white">Register</button>
        {error ? <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p> : null}
        <p className="mt-4 text-sm text-slate-300">Already registered? <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">Sign in</Link></p>
      </form></div>
    </main>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-7xl rounded-xl bg-white p-4 shadow sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Welcome to SiteForge</h1>
            <p className="mt-2 text-slate-600">Signed in as {user?.name || user?.email}</p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-slate-700">
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
    </main>
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
