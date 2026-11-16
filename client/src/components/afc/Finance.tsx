import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  FileCheck2,
  Plus,
  RotateCcw,
  Search,
  Send,
} from 'lucide-react';
import {
  BDOS,
  POLICY,
  inScope,
  money,
  type Application,
  type Business,
  type Lead,
  type Scope,
} from '@shared/afc-data';
import { Dialog, Empty, Owner, Panel, Status } from './UI';
import type { Workspace } from './useWorkspace';

type FinanceProps = {
  ws: Workspace;
  scope: Scope;
  initialFilter?: string;
  newApplication: boolean;
  onNewHandled: () => void;
};

type ReviewCheck = {
  key: keyof Application['k'];
  label: string;
  value: number | null;
  threshold: string;
  pass: boolean | null;
  display: string;
};

type NewApplicationForm = {
  company: string;
  asset: string;
  amount: string;
  biz: Business;
  bdo: string;
  leadId: string;
  contact: string;
};

const aircraftDocs = [
  'Application form',
  'Audited financials (3 yrs)',
  'Management accounts YTD',
  'Bank statements (6 months)',
  'Air Operator Certificate',
  'Director IDs & KYC',
  'Independent aircraft valuation',
  'Fleet utilisation report',
];

const assetDocs = [
  'Application form',
  'Audited financials (3 yrs)',
  'Management accounts YTD',
  'Bank statements (6 months)',
  'Supplier quote / invoice',
  'Director IDs & KYC',
  'Independent asset valuation',
  'Tax clearance certificate',
];

const formatRatio = (key: keyof Application['k'], value: number | null) => {
  if (value === null || value === undefined) return 'Unavailable';
  if (key === 'ltv') return `${Math.round(value * 100)}%`;
  if (key === 'years') return `${value} yrs`;
  return `${value.toFixed(2)}×`;
};

const docsFor = (biz?: Business) => (biz === 'asset' ? assetDocs : aircraftDocs);

function reviewChecks(app: Application): ReviewCheck[] {
  const { k } = app;
  return [
    { key: 'dscr', label: 'Debt service cover', value: k.dscr, threshold: `≥ ${POLICY.dscr.toFixed(2)}×`, pass: k.dscr === null ? null : k.dscr >= POLICY.dscr, display: formatRatio('dscr', k.dscr) },
    { key: 'ltv', label: 'Loan to value', value: k.ltv, threshold: `≤ ${Math.round(POLICY.ltv * 100)}%`, pass: k.ltv === null ? null : k.ltv <= POLICY.ltv, display: formatRatio('ltv', k.ltv) },
    { key: 'de', label: 'Debt to equity', value: k.de, threshold: `≤ ${POLICY.de.toFixed(1)}×`, pass: k.de === null ? null : k.de <= POLICY.de, display: formatRatio('de', k.de) },
    { key: 'cr', label: 'Current ratio', value: k.cr, threshold: `≥ ${POLICY.cr.toFixed(1)}×`, pass: k.cr === null ? null : k.cr >= POLICY.cr, display: formatRatio('cr', k.cr) },
    { key: 'years', label: 'Trading history', value: k.years, threshold: `≥ ${POLICY.years} yrs`, pass: k.years === null ? null : k.years >= POLICY.years, display: formatRatio('years', k.years) },
  ];
}

function nextApplicationId(apps: Application[]) {
  const used = new Set(apps.map(app => app.id));
  const numbers = apps.map(app => Number(app.id.replace(/\D/g, ''))).filter(Number.isFinite);
  let next = Math.max(2200, ...numbers, 2200) + 1;
  while (used.has(`APP-${next}`)) next += 1;
  return `APP-${next}`;
}

function emptyNewForm(biz: Business, lead?: Lead): NewApplicationForm {
  return {
    company: lead?.name || '',
    asset: lead?.type || '',
    amount: lead ? String(lead.value) : '',
    biz: lead ? (lead.biz || 'afc') : biz,
    bdo: lead?.bdo || (biz === 'asset' ? 'zanele' : 'thabo'),
    leadId: lead ? String(lead.id) : '',
    contact: lead?.contact || '',
  };
}

export default function Finance({ ws, scope, initialFilter, newApplication, onNewHandled }: FinanceProps) {
  const businessOptions = useMemo<Business[]>(() => (scope === 'group' ? ['afc', 'asset'] : [scope]), [scope]);
  const scopedApps = useMemo(() => ws.apps.filter(app => inScope(app, scope)), [ws.apps, scope]);
  const scopedLeads = useMemo(() => ws.leads.filter(lead => inScope(lead, scope)), [ws.leads, scope]);
  const [query, setQuery] = useState('');
  const [businessFilter, setBusinessFilter] = useState<'all' | Business>('all');
  const [showOnlyMissing, setShowOnlyMissing] = useState(initialFilter === 'documents');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<NewApplicationForm>(() => emptyNewForm(businessOptions[0] || 'afc'));
  const [draftBody, setDraftBody] = useState('');

  useEffect(() => {
    setShowOnlyMissing(initialFilter === 'documents');
    if (initialFilter?.startsWith('APP-')) { setSelectedId(initialFilter); setBusinessFilter('all'); setQuery(''); setDraftBody(''); }
  }, [initialFilter]);

  useEffect(() => {
    setBusinessFilter('all');
  }, [scope]);

  useEffect(() => {
    if (!newApplication) return;
    setShowNew(true);
    setNewForm(emptyNewForm(businessOptions[0] || 'afc'));
    onNewHandled();
  }, [newApplication, onNewHandled, businessOptions]);

  useEffect(() => {
    if (selectedId && scopedApps.some(app => app.id === selectedId)) return;
    setSelectedId(scopedApps[0]?.id || null);
  }, [scopedApps, selectedId]);

  const filteredApps = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return scopedApps.filter(app => {
      const matchesBusiness = businessFilter === 'all' || (app.biz || 'afc') === businessFilter;
      const matchesSearch = !needle || [app.id, app.co, app.asset, app.bdo, app.summary].some(value => value.toLowerCase().includes(needle));
      const matchesDocs = !showOnlyMissing || Object.values(app.docs).some(received => !received);
      return matchesBusiness && matchesSearch && matchesDocs;
    });
  }, [businessFilter, query, scopedApps, showOnlyMissing]);

  const selected = filteredApps.find(app => app.id === selectedId) || filteredApps[0] || null;
  const selectedChecks = selected ? reviewChecks(selected) : [];
  const missingDocs = selected ? Object.keys(selected.docs).filter(doc => !selected.docs[doc]) : [];
  const availableChecks = selectedChecks.filter(check => check.pass !== null);
  const passedChecks = availableChecks.filter(check => check.pass).length;
  const potentialApplicants = useMemo(() => {
    const names = new Set(ws.apps.filter(app => inScope(app, scope)).map(app => app.co));
    const needle = query.trim().toLowerCase();
    return scopedLeads.filter(lead => {
      if (names.has(lead.name) || ['Won', 'Lost'].includes(lead.status)) return false;
      if (!needle) return true;
      return [lead.name, lead.contact, lead.type].some(value => value.toLowerCase().includes(needle));
    }).slice(0, 5);
  }, [query, scope, scopedLeads, ws.apps]);

  const openNewApplication = useCallback((lead?: Lead) => {
    const fallbackBiz = lead?.biz || businessOptions[0] || 'afc';
    setNewForm(emptyNewForm(fallbackBiz, lead));
    setShowNew(true);
  }, [businessOptions]);

  const closeNewApplication = useCallback(() => setShowNew(false), []);

  const selectApplication = useCallback((id: string) => {
    setSelectedId(id);
    setDraftBody('');
  }, []);

  const toggleDocument = useCallback((app: Application, document: string) => {
    const next = !app.docs[document];
    ws.setApps(old => old.map(item => item.id === app.id ? { ...item, docs: { ...item.docs, [document]: next ? 1 : 0 } } : item));
    ws.record(`${next ? 'Marked sample receipt' : 'Removed sample receipt'} for ${document} on ${app.id}`, 'update', 'Credit workspace');
  }, [ws]);

  const runPolicyReview = useCallback((app: Application) => {
    ws.setApps(old => old.map(item => item.id === app.id ? { ...item, assessed: true } : item));
    ws.record(`Ran deterministic policy review for ${app.id}`, 'review', 'Credit workspace');
  }, [ws]);

  const submitReviewOutcome = useCallback((app: Application) => {
    const checks = reviewChecks(app);
    const complete = Object.values(app.docs).every(Boolean);
    const metricsComplete = checks.every(check => check.pass !== null);
    const outcome = complete && metricsComplete && checks.every(check => check.pass)
      ? 'Submitted to credit committee (demo)'
      : 'Information requested (demo)';
    ws.setApps(old => old.map(item => item.id === app.id ? { ...item, decision: outcome } : item));
    ws.record(`${outcome}; no lending approval issued for ${app.id}`, 'review', 'Demo reviewer');
  }, [ws]);

  const saveFollowUp = useCallback((app: Application) => {
    const body = draftBody.trim() || `Hello,\n\nTo continue the review of ${app.co}'s ${app.asset} application, please provide: ${missingDocs.join(', ')}.\n\nThis is a review-only demonstration draft. No email will be sent.\n\nRegards,\nAFC Credit Team`;
    ws.addApproval({
      title: `Request missing documents · ${app.co}`,
      to: app.contact || 'Applicant contact to be confirmed',
      subject: `Documents needed for ${app.id}`,
      body,
      appId: app.id,
    });
    ws.record(`Prepared editable missing-document follow-up for ${app.id}`, 'read', 'Credit workspace');
  }, [draftBody, missingDocs, ws]);

  const createApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(newForm.amount.replace(/,/g, ''));
    if (!newForm.company.trim() || !newForm.asset.trim() || !Number.isFinite(amount) || amount <= 0) return;
    const id = nextApplicationId(ws.apps);
    const docs = Object.fromEntries(docsFor(newForm.biz).map(document => [document, 0]));
    const lead = newForm.leadId ? ws.leads.find(item => String(item.id) === newForm.leadId) : undefined;
    const app: Application = {
      id,
      co: newForm.company.trim(),
      asset: newForm.asset.trim(),
      amount,
      biz: newForm.biz,
      bdo: newForm.bdo,
      received: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      docs,
      k: { dscr: null, ltv: null, de: null, cr: null, years: null },
      risk: null,
      summary: 'New application created from workspace intake. No source financials supplied yet; ratios remain unavailable.',
      strengths: [],
      concerns: ['Source financials and supporting documents are outstanding'],
      rec: 'Complete the source document pack before any deterministic policy review or reviewer outcome.',
      isNew: true,
      contact: newForm.contact.trim() || undefined,
      leadId: lead?.id,
    };
    ws.setApps(old => [app, ...old]);
    if (lead) ws.setLeads(old => old.map(item => item.id === lead.id ? { ...item, status: 'Application', days: 0 } : item));
    ws.record(`Created ${id} for ${app.co}${lead ? ` from lead ${lead.id}` : ''}`, 'update', 'Credit workspace');
    setSelectedId(id);
    setDraftBody('');
    setShowNew(false);
    setQuery('');
    setBusinessFilter('all');
    setShowOnlyMissing(false);
  };

  const bdoOptions = Object.entries(BDOS).filter(([, bdo]) => newForm.biz === 'asset' ? bdo.biz === 'asset' : !bdo.biz);
  const statusValue = selected
    ? selected.decision || (selected.assessed ? 'Reviewed in demo' : missingDocs.length ? 'Missing documents' : 'Ready for review')
    : '';

  return <div className="view-enter">
    <div className="page-heading">
      <div>
        <span className="eyebrow">CREDIT WORKSPACE · OFFLINE DEMO</span>
        <h2>Applications, with<br /><em>the next step clear.</em></h2>
        <p className="muted">Review source fixtures, complete sample checklists, and prepare human-reviewed outcomes without sending email or making a lending decision.</p>
      </div>
      <button className="btn primary" onClick={() => openNewApplication()}><Plus size={17} /> New application</button>
    </div>

    <div className="credit-layout">
      <section className="application-list panel">
        <div className="panel-heading">
          <div><h3>Applications</h3><p>{filteredApps.length} of {scopedApps.length} in view · sample workspace</p></div>
          <button className="icon-btn" aria-label="Reset application filters" title="Reset filters" onClick={() => { setQuery(''); setBusinessFilter('all'); setShowOnlyMissing(false); }}><RotateCcw size={16} /></button>
        </div>
        <label className="search-field"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search company, asset or ID" aria-label="Search applications" /></label>
        <div className="segmented" aria-label="Business filter">
          <button className={businessFilter === 'all' ? 'active' : ''} onClick={() => setBusinessFilter('all')}>All</button>
          {businessOptions.map(biz => <button key={biz} className={businessFilter === biz ? 'active' : ''} onClick={() => setBusinessFilter(biz)}>{biz === 'asset' ? 'Asset' : 'Aircraft'}</button>)}
        </div>
        <button className={`filter-chip ${showOnlyMissing ? 'active' : ''}`} onClick={() => setShowOnlyMissing(value => !value)}><CircleAlert size={14} /> {showOnlyMissing ? 'Showing document gaps' : 'Show document gaps'}</button>
        <div className="application-items">
          {filteredApps.length ? filteredApps.map(app => {
            const missing = Object.keys(app.docs).filter(doc => !app.docs[doc]).length;
            return <button key={app.id} className={`application-item ${selected?.id === app.id ? 'active' : ''}`} onClick={() => selectApplication(app.id)}>
              <span className="application-item-top"><span className="mini-label">{app.id}</span><span className={`application-business ${app.biz === 'asset' ? 'asset' : ''}`}>{app.biz === 'asset' ? 'ASSET' : 'AIRCRAFT'}</span></span>
              <strong>{app.co}</strong><span className="muted">{app.asset}</span>
              <span className="application-item-bottom"><Owner id={app.bdo} full={false} /><span>{missing ? `${missing} doc${missing === 1 ? '' : 's'} open` : 'Pack complete'}</span></span>
              <ChevronRight size={16} className="application-chevron" />
            </button>;
          }) : <Empty title="No matching applications" sub="Try another search or clear the filters." />}
        </div>
        <div className="potential-applicants">
          <div className="mini-label">POTENTIAL APPLICANTS</div>
          <p className="muted">Open leads not yet linked to an application.</p>
          {potentialApplicants.length ? potentialApplicants.map(lead => <button key={lead.id} className="potential-row" onClick={() => openNewApplication(lead)}><span><strong>{lead.name}</strong><small>{lead.type} · {money(lead.value)}</small></span><Plus size={15} /></button>) : <span className="muted">No unlinked leads in this view.</span>}
        </div>
      </section>

      <section className="credit-detail">
        {selected ? <>
          <div className="detail-topline"><div><span className="eyebrow">APPLICATION DETAIL · {selected.id}</span><h2>{selected.co}</h2><p className="muted">{selected.asset} · received {selected.received}</p></div><div className="detail-actions"><Status value={statusValue} /><button className="btn secondary" onClick={() => runPolicyReview(selected)}><ClipboardCheck size={16} /> Run policy review</button></div></div>
          <div className="detail-summary-grid">
            <div><span className="mini-label">REQUESTED FINANCE</span><strong>{money(selected.amount, true)}</strong><span className="muted">{selected.biz === 'asset' ? 'Asset Finance Corporation' : 'Aircraft Finance Corporation'}</span></div>
            <div><span className="mini-label">RELATIONSHIP OWNER</span><Owner id={selected.bdo} /><span className="muted">Source: supplied demonstration fixture</span></div>
            <div><span className="mini-label">RISK SCORE</span><strong>{selected.risk === null ? 'Unavailable' : selected.risk}</strong><span className="muted">{selected.risk === null ? 'No score invented for incomplete data' : 'Source fixture score'}</span></div>
          </div>

          <Panel title="Source fixture assessment" sub="The narrative and ratios below are supplied sample data, not generated analysis.">
            <div className="assessment-summary"><div className="note"><span className="mini-label">SUMMARY</span><p>{selected.summary}</p></div><div className="note"><span className="mini-label">RECOMMENDATION</span><p>{selected.rec}</p></div></div>
            <div className="strength-concern-grid"><div><span className="mini-label">SUPPLIED STRENGTHS</span>{selected.strengths.length ? <ul>{selected.strengths.map(item => <li key={item}><Check size={14} />{item}</li>)}</ul> : <p className="muted">No strengths recorded for this new application.</p>}</div><div><span className="mini-label">SUPPLIED CONCERNS</span>{selected.concerns.length ? <ul>{selected.concerns.map(item => <li key={item}><CircleAlert size={14} />{item}</li>)}</ul> : <p className="muted">No concerns recorded.</p>}</div></div>
          </Panel>

          <Panel title="Policy ratios" sub="Deterministic thresholds from the supplied policy constants. Unavailable means the source fixture did not include a value.">
            <div className="ratio-grid">{selectedChecks.map(check => <div key={check.key} className={`ratio-card ${check.pass === true ? 'pass' : check.pass === false ? 'fail' : ''}`}><span className="mini-label">{check.label}</span><strong>{check.display}</strong><span className="muted">Policy {check.threshold}</span>{check.pass === null ? <small>Unavailable</small> : <small>{check.pass ? 'Pass' : 'Fail'} · source fixture</small>}</div>)}</div>
            <div className="assessment-footer"><span>{selected.assessed ? <><Check size={15} /> Policy review run · {passedChecks}/{availableChecks.length} available checks pass</> : <><CircleAlert size={15} /> Review has not been run for this application</>}</span>{selected.risk === null && <span className="muted">Risk remains unavailable.</span>}</div>
          </Panel>

          <Panel title="Document checklist" sub="These controls toggle sample receipt only. They do not upload files, run OCR, or connect to storage." action={<span className="muted">{Object.keys(selected.docs).length - missingDocs.length}/{Object.keys(selected.docs).length} received</span>}>
            <div className="document-grid">{Object.keys(selected.docs).map(document => { const received = Boolean(selected.docs[document]); return <button key={document} className={`doc-item ${received ? 'received' : ''}`} onClick={() => toggleDocument(selected, document)} aria-pressed={received} title="Toggle sample receipt only"><span className="doc-icon">{received ? <Check size={16} /> : <FileCheck2 size={16} />}</span><span><strong>{document}</strong><small>{received ? 'Sample receipt recorded' : 'Not received in sample'}</small></span><span className="doc-toggle">{received ? 'Received' : 'Open'}</span></button>; })}</div>
            {missingDocs.length > 0 && <div className="follow-up"><div><span className="mini-label">REVIEW-ONLY FOLLOW-UP DRAFT</span><p>Edit this draft, then add it to the internal approvals queue. It will not send an email.</p></div><textarea value={draftBody || `Hello,\n\nTo continue the review of ${selected.co}'s ${selected.asset} application, please provide: ${missingDocs.join(', ')}.\n\nThis is a review-only demonstration draft. No email will be sent.\n\nRegards,\nAFC Credit Team`} onChange={event => setDraftBody(event.target.value)} rows={6} aria-label="Missing document follow-up draft" /><button className="btn secondary" onClick={() => saveFollowUp(selected)}><Send size={16} /> Add review draft</button></div>}
          </Panel>

          <div className="review-strip"><div><span className="eyebrow">HUMAN REVIEW GATE</span><h3>{selected.decision || 'Choose the next review step.'}</h3><p className="muted">{selected.decision ? 'This is a stored demonstration outcome only. No lending approval or email was issued.' : 'Run the policy review, then request information or submit a reviewer-only committee note.'}</p></div><button className="btn primary" onClick={() => submitReviewOutcome(selected)} disabled={!selected.assessed}><ArrowRight size={16} /> {missingDocs.length || availableChecks.length !== selectedChecks.length || selectedChecks.some(check => check.pass === false) ? 'Request information · demo' : 'Submit to committee · demo'}</button></div>
        </> : <div className="empty detail-empty"><div className="empty-symbol"><Building2 size={22} /></div><h3>Select an application</h3><p>Choose a sample application from the list to review its source data.</p></div>}
      </section>
    </div>

    {showNew && <Dialog title="New credit application" sub="Create an intake record without inventing financials or documents." onClose={closeNewApplication} wide><form className="new-application-form" onSubmit={createApplication}>
      <div className="form-grid">
        <label className="field"><span>Company <b>*</b></span><input required value={newForm.company} onChange={event => setNewForm(form => ({ ...form, company: event.target.value }))} placeholder="Registered company name" /></label>
        <label className="field"><span>Asset / purpose <b>*</b></span><input required value={newForm.asset} onChange={event => setNewForm(form => ({ ...form, asset: event.target.value }))} placeholder="Aircraft, truck, plant or purpose" /></label>
        <label className="field"><span>Finance amount (ZAR) <b>*</b></span><input required type="number" min="1" step="1" value={newForm.amount} onChange={event => setNewForm(form => ({ ...form, amount: event.target.value }))} placeholder="0" /></label>
        <label className="field"><span>Business <b>*</b></span><select value={newForm.biz} onChange={event => { const biz = event.target.value as Business; const bdo = Object.entries(BDOS).find(([, item]) => biz === 'asset' ? item.biz === 'asset' : !item.biz)?.[0] || 'thabo'; setNewForm(form => ({ ...form, biz, bdo })); }}>{businessOptions.map(biz => <option key={biz} value={biz}>{biz === 'asset' ? 'Asset Finance Corporation' : 'Aircraft Finance Corporation'}</option>)}</select></label>
        <label className="field"><span>BDO <b>*</b></span><select value={newForm.bdo} onChange={event => setNewForm(form => ({ ...form, bdo: event.target.value }))}>{bdoOptions.map(([id, bdo]) => <option key={id} value={id}>{bdo.name} · {bdo.spec}</option>)}</select></label>
        <label className="field"><span>Applicant contact</span><input value={newForm.contact} onChange={event => setNewForm(form => ({ ...form, contact: event.target.value }))} placeholder="Name or email for follow-up" /></label>
        <label className="field"><span>From potential applicant</span><select value={newForm.leadId} onChange={event => { const lead = scopedLeads.find(item => String(item.id) === event.target.value); const biz = lead?.biz || 'afc'; setNewForm(form => ({ ...form, ...emptyNewForm(biz, lead), biz })); }}>{<option value="">No linked lead</option>}{scopedLeads.filter(lead => !['Won', 'Lost'].includes(lead.status)).map(lead => <option key={lead.id} value={lead.id}>{lead.name} · {lead.status}</option>)}</select></label>
      </div>
      <div className="note"><span className="mini-label">WHAT WILL BE CREATED</span><p>An application with a unique identifier, an eight-item business-specific checklist, unavailable ratios, null risk, and an incomplete summary. No financial values will be inferred.</p></div>
      <div className="form-actions"><button type="button" className="btn secondary" onClick={closeNewApplication}>Cancel</button><button type="submit" className="btn primary"><Plus size={16} /> Create application</button></div>
    </form></Dialog>}
  </div>;
}
