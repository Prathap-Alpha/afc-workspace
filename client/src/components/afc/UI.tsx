import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { BDOS, initials } from '@shared/afc-data';
export function Panel({ title, sub, action, children, className = '' }: { title: string; sub?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-heading"><div><h3>{title}</h3>{sub && <p>{sub}</p>}</div>{action}</div>{children}</section>;
}
export function Metric({ title, value, sub, tone, children, onClick }: { title: string; value: string | number; sub: string; tone?: string; children?: ReactNode; onClick?: () => void }) {
  return <button className={`metric ${tone || ''}`} onClick={onClick}><div className="metric-title">{title}<ArrowUpRight size={15} /></div><div className="metric-value">{value}{children}</div><div className="metric-sub">{sub}</div></button>;
}
export function Owner({ id, full = true }: { id: string; full?: boolean }) {
  const b = BDOS[id];
  return <span className="owner"><span className="avatar" style={{ background: b?.color ? `${b.color}19` : '#e7eeeb', color: b?.color || '#376b61' }}>{initials(b?.name || id)}</span>{full && <span>{b?.name || id}</span>}</span>;
}
export function Status({ value }: { value: string }) {
  const tone = value === 'Won' || value.includes('committee') || value === 'Approved' ? 'green' : value === 'Lost' || value.includes('Returned') ? 'red' : value === 'Application' || value.includes('documents') ? 'amber' : value === 'Proposal sent' ? 'teal' : 'neutral';
  return <span className={`status ${tone}`}><i />{value}</span>;
}
export function Dialog({ title, sub, children, onClose, wide = false }: { title: string; sub?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const old = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const el = dialog.current;
    const focusables = () => Array.from(el?.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex="0"]') || []).filter(e => !e.hasAttribute('disabled'));
    focusables()[0]?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'Tab') { const f = focusables(), first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } } };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = old; document.removeEventListener('keydown', key); previous?.focus(); };
  }, [onClose]);
  return <div className="dialog-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className={`dialog ${wide ? 'wide' : ''}`} ref={dialog} role="dialog" aria-modal="true" aria-label={title}><header><div><span className="eyebrow">AFC WORKSPACE</span><h2>{title}</h2>{sub && <p>{sub}</p>}</div><button className="icon-btn" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></header><div className="dialog-content">{children}</div></div></div>;
}
export function Empty({ title, sub }: { title: string; sub: string }) { return <div className="empty"><div className="empty-symbol">—</div><h3>{title}</h3><p>{sub}</p></div>; }
