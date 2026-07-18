import { useState } from 'react';
import { request } from '../api/client.js';
import { useAuth } from '../context/useAuth.js';

export const BudgetPanel = () => {
  const { accessToken } = useAuth();
  const [name, setName] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [status, setStatus] = useState('');

  const createLine = async (event) => {
    event.preventDefault();
    try {
      const payload = await request('/api/budget-lines', {
        method: 'POST', token: accessToken,
        body: { name, plannedAmount: Number(plannedAmount), projectId: 'project-1', description: 'Created from the dashboard' },
      });
      setStatus(`Line created: ${payload.data.name}`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Budget line form</h3>
      <form onSubmit={createLine} className="mt-4 space-y-3">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Line item" className="w-full rounded border border-slate-300 px-3 py-2" />
        <input value={plannedAmount} onChange={(event) => setPlannedAmount(event.target.value)} placeholder="Planned amount" type="number" className="w-full rounded border border-slate-300 px-3 py-2" />
        <button className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Create budget line</button>
      </form>
      {status ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
    </div>
  );
};
