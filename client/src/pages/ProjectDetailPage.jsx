import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { request } from '../api/client.js';

export const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([request(`/api/projects/${projectId}`), request(`/api/projects/${projectId}/phases`)])
      .then(([projectResult, phaseResult]) => { if (mounted) { setProject(projectResult.data); setPhases(phaseResult.data || []); } })
      .catch((requestError) => mounted && setError(requestError.message));
    return () => { mounted = false; };
  }, [projectId]);

  const loadBudgets = async (phaseId) => {
    setSelectedPhaseId(phaseId);
    try { setBudgets((await request(`/api/phases/${phaseId}/budgets`)).data || []); } catch (requestError) { setError(requestError.message); }
  };

  return <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <h2 className="break-words text-xl font-semibold text-slate-900">{project?.title || 'Project'}</h2>
    {error ? <p role="alert" className="mt-4 text-sm text-rose-600">Unable to load project: {error}</p> : null}
    {project ? <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm"><p>Status: {project.status}</p><p>Dates: {project.start_date || 'Not set'} to {project.end_date || 'Not set'}</p></div> : null}
    <h3 className="mt-6 text-lg font-semibold">Phases</h3>
    {phases.length === 0 ? <p className="mt-2 text-sm text-slate-500">No phases available.</p> : <ul className="mt-2 space-y-2">{phases.map((phase) => <li key={phase.id} className="flex flex-col gap-2 rounded border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"><span className="break-words">{phase.title} ({phase.status})</span><button onClick={() => loadBudgets(phase.id)} className="text-left text-sm font-medium text-sky-700 sm:text-right">Load budgets</button></li>)}</ul>}
    {selectedPhaseId ? <div className="mt-6"><h3 className="text-lg font-semibold">Budgets</h3>{budgets.length === 0 ? <p className="mt-2 text-sm text-slate-500">No budgets for this phase.</p> : <ul className="mt-2 space-y-2">{budgets.map((budget) => <li key={budget.id} className="rounded border border-slate-200 p-3 text-sm">{budget.currency} {budget.amount_allocated} allocated / {budget.amount_spent} spent</li>)}</ul>}</div> : null}
  </section>;
};
