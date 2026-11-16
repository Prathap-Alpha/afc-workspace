import { useEffect, useState } from 'react';
import { seedLeads, seedApps, type Lead, type Application } from '@shared/afc-data';

export type AuditEntry = { id: string; time: string; action: string; who: string; kind: 'review' | 'read' | 'update' };
export type Approval = { id: string; title: string; to: string; subject: string; body: string; leadId?: number; appId?: string; state: 'pending' | 'approved' | 'dismissed' };
type Saved = { leads: Lead[]; apps: Application[]; audit: AuditEntry[]; approvals: Approval[] };
const KEY = 'afc-workspace-v1';
function initial(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && Array.isArray(raw.leads) && Array.isArray(raw.apps) && Array.isArray(raw.audit) && Array.isArray(raw.approvals) && raw.leads.every((l: Lead) => typeof l.name === 'string' && Number.isFinite(l.value)) && raw.apps.every((a: Application) => a.docs && a.k && typeof a.co === 'string')) return raw;
  } catch { /* Invalid browser state falls back to the supplied demonstration. */ }
  return { leads: structuredClone(seedLeads), apps: structuredClone(seedApps), approvals: [], audit: [
    { id: 'seed-1', time: '2026-11-14T08:02:00+02:00', action: 'Atlantic Executive Jets added to the demonstration pipeline', who: 'Lead workspace', kind: 'update' },
    { id: 'seed-2', time: '2026-11-13T16:40:00+02:00', action: 'Bushveld Heli Services document gaps identified in sample checklist', who: 'Credit workspace', kind: 'read' },
    { id: 'seed-3', time: '2026-11-13T09:15:00+02:00', action: 'Management snapshot prepared from demonstration figures', who: 'Management workspace', kind: 'read' },
  ] };
}
export function useWorkspace() {
  const [state, setState] = useState<Saved>(initial);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); setStorageError(false); } catch { setStorageError(true); } }, [state]);
  const record = (action: string, kind: AuditEntry['kind'] = 'update', who = 'Demo user') => setState(s => ({ ...s, audit: [{ id: crypto.randomUUID(), time: new Date().toISOString(), action, who, kind }, ...s.audit].slice(0, 300) }));
  const setLeads = (fn: (old: Lead[]) => Lead[]) => setState(s => ({ ...s, leads: fn(s.leads) }));
  const setApps = (fn: (old: Application[]) => Application[]) => setState(s => ({ ...s, apps: fn(s.apps) }));
  const addApproval = (a: Omit<Approval, 'id' | 'state'>) => {
    const id = crypto.randomUUID();
    setState(s => ({ ...s, approvals: [{ ...a, id, state: 'pending' }, ...s.approvals] }));
    record(`Prepared review draft: ${a.title}`, 'read');
    return id;
  };
  const reviewApproval = (id: string, state: 'approved' | 'dismissed', body?: string) => setState(s => {
    const a = s.approvals.find(x => x.id === id);
    if (!a || a.state !== 'pending') return s;
    return { ...s, approvals: s.approvals.map(x => x.id === id ? { ...x, state, body: body ?? x.body } : x),
      audit: [{ id: crypto.randomUUID(), time: new Date().toISOString(), action: `${state === 'approved' ? 'Approved' : 'Dismissed'} draft in demo only: ${a.title}. No email sent.`, who: 'Demo reviewer', kind: 'review' as const }, ...s.audit].slice(0, 300) };
  });
  const reset = () => { try { localStorage.removeItem(KEY); } catch { /* Storage restrictions must not prevent reset in memory. */ } setState({ leads: structuredClone(seedLeads), apps: structuredClone(seedApps), approvals: [], audit: [] }); };
  return { ...state, storageError, setLeads, setApps, record, addApproval, reviewApproval, reset };
}
export type Workspace = ReturnType<typeof useWorkspace>;
export function exportCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => '"' + String(v).replace(/^[=+@-]/, "'$&").replace(/"/g, '""') + '"';
  const content = '\uFEFF' + [headers, ...rows].map(row => row.map(escape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
