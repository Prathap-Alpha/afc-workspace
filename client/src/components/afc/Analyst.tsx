import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2, X, CornerDownLeft, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { trpc } from '@/lib/trpc';
import { isStaticDemo } from '@/lib/demoMode';
import { inScope, BIZ, type Scope } from '@shared/afc-data';
import type { Workspace } from './useWorkspace';
type Message = { role: 'user' | 'assistant'; content: string };
export default function Analyst({ ws, scope, initialQuestion, onClose }: { ws: Workspace; scope: Scope; initialQuestion?: string; onClose: () => void }) {
  const drawer = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = drawer.current;
    const old = document.body.style.overflow; document.body.style.overflow = 'hidden';
    root?.querySelector<HTMLElement>('button')?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') { const f = Array.from(root?.querySelectorAll<HTMLElement>('button:not(:disabled), textarea, a[href]') || []); const first = f[0], last = f[f.length-1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    }; document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = old; document.removeEventListener('keydown', key); previous?.focus(); };
  }, []);
  const [input, setInput] = useState(initialQuestion || ''), [messages, setMessages] = useState<Message[]>([]), [failedQuestion, setFailedQuestion] = useState('');
  const analyst = trpc.afc.analyst.useMutation();
  const send = async (q: string) => {
    if (!q.trim() || analyst.isPending || isStaticDemo || !navigator.onLine || location.protocol === 'file:' || isStaticDemo) return;
    setFailedQuestion('');
    const previous = messages;
    setMessages(m => [...m, { role: 'user', content: q }]); setInput('');
    try {
      const context = JSON.stringify({ scope, demonstration: true, firms: scope === 'group' ? BIZ : { [scope]: BIZ[scope] }, leads: ws.leads.filter(l => inScope(l, scope)), applications: ws.apps.filter(a => inScope(a, scope)), approvals: ws.approvals.filter(a => a.state === 'pending').map(a => ({ title: a.title, state: a.state })) }).slice(0, 35000);
      const r = await analyst.mutateAsync({ question: q, context, history: previous.slice(-6) });
      setMessages(m => [...m, { role: 'assistant', content: r.text }]); ws.record(`Analyst answered demo question: ${q.slice(0, 160)}`, 'read', 'Workspace analyst');
    } catch { setFailedQuestion(q); setInput(q); }
  };
  return <div className="analyst-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><aside ref={drawer} className="analyst-drawer" role="dialog" aria-modal="true" aria-label="Workspace analyst"><header><div><span className="eyebrow">A SECOND PERSPECTIVE</span><h2>Ask the workspace.</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close analyst"><X size={21} /></button></header><div className="analyst-scope"><i />{scope === 'group' ? 'Group view' : BIZ[scope].name}<span>Online analysis · sample data</span></div><div className="analyst-messages">{!messages.length && <div className="analyst-welcome"><div className="analyst-emblem">a<span>/</span></div><h3>A little clarity<br />goes a long way.</h3><p>Ask about the current pipeline, document gaps or relationship-owner workload. Answers use this demo’s data, not your live systems.</p>{['Which opportunities need attention?', 'Where is the pipeline concentrated?', 'Summarise the credit queue.'].map(q => <button key={q} onClick={() => setInput(q)}>{q}<CornerDownLeft size={14} /></button>)}</div>}{messages.map((m, i) => <div className={`analyst-message ${m.role}`} key={i}>{m.role === 'assistant' && <span className="mini-label">WORKSPACE ANALYST</span>}<ReactMarkdown>{m.content}</ReactMarkdown>{m.role === 'assistant' && 'speechSynthesis' in window && <button className="text-btn read-aloud" onClick={() => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(m.content.replace(/[*#]/g, '')); u.lang = 'en-ZA'; speechSynthesis.speak(u); }}><Volume2 size={13} />Read aloud</button>}</div>)}{analyst.isPending && <div className="analyst-thinking"><Loader2 size={16} className="spin" />Looking at the current workspace…</div>}{analyst.error && <div className="analyst-error" role="alert"><b>Analysis could not be completed.</b><p>{analyst.error.message}</p><button className="btn secondary" disabled={analyst.isPending} onClick={() => { setMessages(m => m.slice(0, -1)); void send(failedQuestion); }}>Retry</button></div>}</div><form onSubmit={e => { e.preventDefault(); void send(input); }} className="analyst-input"><textarea value={input} onChange={e => setInput(e.target.value)} placeholder="What would you like to understand?" maxLength={2000} rows={2} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input); } }} /><button disabled={analyst.isPending || !input.trim() || (!navigator.onLine || location.protocol === 'file:' || isStaticDemo)} aria-label="Ask analyst" className="btn primary"><ArrowUp size={18} /></button><small>{(location.protocol === 'file:' || isStaticDemo) ? 'Online analysis requires the full hosted backend. Core demo workflows remain available in this client build.' : navigator.onLine ? 'Read-only insights. People decide the next step.' : 'Offline. Core workspace is available; online analysis needs a connection.'}</small></form></aside></div>;
}
