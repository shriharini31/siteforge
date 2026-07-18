import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../api/client.js';

export const ProjectsPage = () => {
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    request('/api/projects')
      .then((payload) => mounted && setProjects(Array.isArray(payload.data) ? payload.data : []))
      .catch((requestError) => mounted && setError(requestError.message));
    return () => { mounted = false; };
  }, []);

  const visibleProjects = useMemo(() => (
    filter === 'all' ? projects : projects.filter((project) => (project.status || '').toLowerCase() === filter)
  ), [filter, projects]);

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-semibold text-slate-900">Projects</h2><p className="text-sm text-slate-500">Track active construction portfolios.</p></div>
        <label className="text-sm font-medium text-slate-700 sm:min-w-40">Status filter<select value={filter} onChange={(event) => setFilter(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm">
          <option value="all">All statuses</option><option value="in progress">In Progress</option><option value="planning">Planning</option>
        </select></label>
      </div>
      {error ? <p role="alert" className="mt-4 text-sm text-rose-600">Unable to load projects: {error}</p> : null}
      {!error && visibleProjects.length === 0 ? <p className="mt-6 text-sm text-slate-500">No projects yet.</p> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {visibleProjects.map((project) => (
          <article key={project.id} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="break-words font-semibold text-slate-900">{project.title}</h3><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">{project.status}</span></div>
            <p className="mt-2 text-sm text-slate-600">Owner: {project.owner_id || 'Unassigned'}</p>
            <p className="mt-1 text-sm text-slate-600">Dates: {project.start_date || 'Not set'} to {project.end_date || 'Not set'}</p>
            <Link to={`/projects/${project.id}`} className="mt-4 inline-flex text-sm font-medium text-sky-700">Open project →</Link>
          </article>
        ))}
      </div>
    </section>
  );
};
