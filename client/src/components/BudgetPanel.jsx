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
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-slate-900">Budget line form</h3>
      <form onSubmit={createLine} className="mt-4 space-y-3">
        <div><label htmlFor="budget-name" className="mb-1 block text-sm font-medium text-slate-700">Line item</label><input id="budget-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Concrete" required className="w-full rounded border border-slate-300 px-3 py-2" /></div>
        <div><label htmlFor="budget-amount" className="mb-1 block text-sm font-medium text-slate-700">Planned amount</label><input id="budget-amount" value={plannedAmount} onChange={(event) => setPlannedAmount(event.target.value)} placeholder="0" type="number" min="0" required className="w-full rounded border border-slate-300 px-3 py-2" /></div>
        <button className="w-full rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white sm:w-auto">Create budget line</button>
      </form>
      {status ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
    </div>
  );
};
