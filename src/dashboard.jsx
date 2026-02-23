import { useState, useEffect } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, orderBy, query
} from 'firebase/firestore';
import { app } from './firebaseConfig';

const auth = getAuth(app);
const db = getFirestore(app);

const BRAND = {
  navy: '#1F2A37',
  navyLight: '#2C3E50',
  gold: '#C8A96A',
  goldLight: '#D4B97A',
  bg: '#F4F6F8',
  white: '#FFFFFF',
  gray: '#6B7280',
  grayLight: '#E5E7EB',
  green: '#10B981',
  orange: '#F59E0B',
  red: '#EF4444',
  blue: '#3B82F6',
};

const STATUS_COLORS = {
  'Not Started': BRAND.gray,
  'In Progress': BRAND.blue,
  'On Hold': BRAND.orange,
  'Completed': BRAND.green,
  'Delayed': BRAND.red,
};

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Delayed'];
const TYPE_OPTIONS = ['Deck', 'Basement', 'Bathroom', 'Garage', 'Fence', 'Other'];

function genToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }) {
  return (
    <span style={{
      background: STATUS_COLORS[status] + '22',
      color: STATUS_COLORS[status],
      border: `1px solid ${STATUS_COLORS[status]}44`,
      borderRadius: 20,
      padding: '3px 10px',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.3,
    }}>
      {status}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: BRAND.white, borderRadius: 16, padding: 28,
        width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: BRAND.navy, fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22,
            cursor: 'pointer', color: BRAND.gray, lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: BRAND.navy, marginBottom: 5 }}>
        {label}
      </label>
      <input {...props} style={{
        width: '100%', padding: '9px 12px', borderRadius: 8,
        border: `1px solid ${BRAND.grayLight}`, fontSize: 14,
        outline: 'none', boxSizing: 'border-box',
        fontFamily: 'inherit',
        ...props.style,
      }} />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: BRAND.navy, marginBottom: 5 }}>
        {label}
      </label>
      <select {...props} style={{
        width: '100%', padding: '9px 12px', borderRadius: 8,
        border: `1px solid ${BRAND.grayLight}`, fontSize: 14,
        outline: 'none', boxSizing: 'border-box',
        fontFamily: 'inherit', background: BRAND.white,
      }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, variant = 'primary', ...props }) {
  const styles = {
    primary: { background: BRAND.gold, color: BRAND.navy, border: 'none' },
    secondary: { background: 'transparent', color: BRAND.navy, border: `1px solid ${BRAND.grayLight}` },
    danger: { background: BRAND.red, color: BRAND.white, border: 'none' },
    navy: { background: BRAND.navy, color: BRAND.white, border: 'none' },
  };
  return (
    <button {...props} style={{
      padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
      cursor: 'pointer', fontFamily: 'inherit', ...styles[variant],
      opacity: props.disabled ? 0.6 : 1,
      ...props.style,
    }}>
      {children}
    </button>
  );
}

function ProjectForm({ initial = {}, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    name: '', client: '', clientEmail: '', clientPhone: '',
    type: 'Deck', status: 'Not Started',
    address: '', startDate: '', endDate: '', budget: '',
    notes: '',
    ...initial,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <Input label="Project Name *" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Henderson Deck Replacement" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select label="Type" value={form.type} onChange={e => set('type', e.target.value)} options={TYPE_OPTIONS} />
        <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)} options={STATUS_OPTIONS} />
      </div>
      <Input label="Client Name *" value={form.client} onChange={e => set('client', e.target.value)} required placeholder="Full name" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Client Email" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} type="email" placeholder="email@example.com" />
        <Input label="Client Phone" value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} placeholder="306-555-0000" />
      </div>
      <Input label="Address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St, Regina" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Start Date" value={form.startDate} onChange={e => set('startDate', e.target.value)} type="date" />
        <Input label="End Date" value={form.endDate} onChange={e => set('endDate', e.target.value)} type="date" />
      </div>
      <Input label="Budget ($)" value={form.budget} onChange={e => set('budget', e.target.value)} type="number" placeholder="0" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: BRAND.navy, marginBottom: 5 }}>Notes (admin only)</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          rows={3} placeholder="Internal notes..."
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${BRAND.grayLight}`, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn type="button" variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Project'}</Btn>
      </div>
    </form>
  );
}

function MilestonePanel({ project, milestones, onAdd, onToggle, onDelete }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), date, status: 'Not Started', order: milestones.length });
    setName(''); setDate('');
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        {milestones.length === 0 && (
          <p style={{ color: BRAND.gray, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No milestones yet.</p>
        )}
        {milestones.map((m) => (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 0', borderBottom: `1px solid ${BRAND.grayLight}`,
          }}>
            <input type="checkbox" checked={m.status === 'Completed'}
              onChange={() => onToggle(m)}
              style={{ width: 16, height: 16, accentColor: BRAND.gold, cursor: 'pointer' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.navy, textDecoration: m.status === 'Completed' ? 'line-through' : 'none' }}>{m.name}</div>
              {m.date && <div style={{ fontSize: 11, color: BRAND.gray }}>{m.date}</div>}
            </div>
            <StatusBadge status={m.status} />
            <button onClick={() => onDelete(m)} style={{ background: 'none', border: 'none', color: BRAND.red, cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <Input label="New Milestone" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Pour footings" style={{ marginBottom: 0 }} />
        <Input label="Date" value={date} onChange={e => setDate(e.target.value)}
          type="date" style={{ marginBottom: 0 }} />
        <Btn type="button" onClick={handleAdd} style={{ flexShrink: 0, marginBottom: 0 }}>Add</Btn>
      </div>
    </div>
  );
}

function UpdatePanel({ updates, onAdd, onDelete }) {
  const [msg, setMsg] = useState('');

  const handleAdd = () => {
    if (!msg.trim()) return;
    onAdd({ message: msg.trim() });
    setMsg('');
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        {updates.length === 0 && (
          <p style={{ color: BRAND.gray, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No updates posted yet.</p>
        )}
        {updates.map(u => (
          <div key={u.id} style={{
            background: BRAND.bg, borderRadius: 10, padding: 14,
            marginBottom: 10, position: 'relative',
          }}>
            <div style={{ fontSize: 11, color: BRAND.gray, marginBottom: 4 }}>{formatDate(u.date)}</div>
            <div style={{ fontSize: 13, color: BRAND.navy }}>{u.message}</div>
            <button onClick={() => onDelete(u)} style={{
              position: 'absolute', top: 10, right: 10,
              background: 'none', border: 'none', color: BRAND.red, cursor: 'pointer', fontSize: 16,
            }}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <textarea value={msg} onChange={e => setMsg(e.target.value)}
          placeholder="Post an update for this project…"
          rows={2}
          style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: `1px solid ${BRAND.grayLight}`, fontSize: 14, fontFamily: 'inherit', resize: 'none' }} />
        <Btn onClick={handleAdd} style={{ alignSelf: 'flex-end' }}>Post</Btn>
      </div>
    </div>
  );
}

function ProjectDetail({ project, onClose, onStatusChange, onDelete }) {
  const [tab, setTab] = useState('milestones');
  const [milestones, setMilestones] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubs();
  }, [project.id]);

  async function loadSubs() {
    setLoading(true);
    const msSnap = await getDocs(query(collection(db, 'projects', project.id, 'milestones'), orderBy('order')));
    setMilestones(msSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    const upSnap = await getDocs(query(collection(db, 'projects', project.id, 'updates'), orderBy('date', 'desc')));
    setUpdates(upSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function addMilestone(data) {
    const ref = await addDoc(collection(db, 'projects', project.id, 'milestones'), { ...data, createdAt: serverTimestamp() });
    setMilestones(m => [...m, { id: ref.id, ...data }]);
  }

  async function toggleMilestone(m) {
    const newStatus = m.status === 'Completed' ? 'Not Started' : 'Completed';
    await updateDoc(doc(db, 'projects', project.id, 'milestones', m.id), { status: newStatus });
    setMilestones(ms => ms.map(x => x.id === m.id ? { ...x, status: newStatus } : x));
  }

  async function deleteMilestone(m) {
    await deleteDoc(doc(db, 'projects', project.id, 'milestones', m.id));
    setMilestones(ms => ms.filter(x => x.id !== m.id));
  }

  async function addUpdate(data) {
    const ref = await addDoc(collection(db, 'projects', project.id, 'updates'), { ...data, date: serverTimestamp() });
    setUpdates(u => [{ id: ref.id, ...data, date: null }, ...u]);
  }

  async function deleteUpdate(u) {
    await deleteDoc(doc(db, 'projects', project.id, 'updates', u.id));
    setUpdates(us => us.filter(x => x.id !== u.id));
  }

  const portalUrl = `${window.location.origin}/portal?id=${project.shareToken}`;
  const pct = milestones.length ? Math.round(milestones.filter(m => m.status === 'Completed').length / milestones.length * 100) : 0;
  const TABS = ['milestones', 'updates', 'details'];

  return (
    <Modal title={project.name} onClose={onClose}>
      <div style={{ background: BRAND.bg, borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          <StatusBadge status={project.status} />
          <span style={{ fontSize: 12, color: BRAND.gray }}>{project.type} · {project.client}</span>
          {project.address && <span style={{ fontSize: 12, color: BRAND.gray }}>📍 {project.address}</span>}
        </div>
        {milestones.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: BRAND.gray }}>Progress</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.gold }}>{pct}%</span>
            </div>
            <div style={{ background: BRAND.grayLight, borderRadius: 4, height: 6 }}>
              <div style={{ background: BRAND.gold, height: 6, borderRadius: 4, width: `${pct}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12 }}>
        <strong style={{ color: BRAND.navy }}>Client Portal Link:</strong>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
          <span style={{ color: BRAND.blue, wordBreak: 'break-all', flex: 1 }}>{portalUrl}</span>
          <button onClick={() => navigator.clipboard.writeText(portalUrl)}
            style={{ background: BRAND.blue, color: BRAND.white, border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 11, flexShrink: 0 }}>
            Copy
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: `2px solid ${BRAND.grayLight}`, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
            color: tab === t ? BRAND.gold : BRAND.gray,
            borderBottom: tab === t ? `2px solid ${BRAND.gold}` : '2px solid transparent',
            marginBottom: -2, textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: BRAND.gray, textAlign: 'center' }}>Loading…</p>
      ) : (
        <>
          {tab === 'milestones' && (
            <MilestonePanel project={project} milestones={milestones}
              onAdd={addMilestone} onToggle={toggleMilestone} onDelete={deleteMilestone} />
          )}
          {tab === 'updates' && (
            <UpdatePanel updates={updates} onAdd={addUpdate} onDelete={deleteUpdate} />
          )}
          {tab === 'details' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['Client', project.client],
                  ['Phone', project.clientPhone || '—'],
                  ['Email', project.clientEmail || '—'],
                  ['Budget', project.budget ? `$${Number(project.budget).toLocaleString()}` : '—'],
                  ['Start', project.startDate || '—'],
                  ['End', project.endDate || '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: BRAND.bg, borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 10, color: BRAND.gray, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.navy }}>{v}</div>
                  </div>
                ))}
              </div>
              {project.notes && (
                <div style={{ marginTop: 12, background: BRAND.bg, borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 10, color: BRAND.gray, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Notes</div>
                  <div style={{ fontSize: 13, color: BRAND.navy }}>{project.notes}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'space-between' }}>
                <Btn variant="danger" onClick={() => { if (window.confirm('Delete this project?')) onDelete(project); }}>Delete Project</Btn>
                <div style={{ display: 'flex', gap: 8 }}>
                  {STATUS_OPTIONS.filter(s => s !== project.status).slice(0, 2).map(s => (
                    <Btn key={s} variant="secondary" onClick={() => onStatusChange(project, s)} style={{ fontSize: 11 }}>
                      → {s}
                    </Btn>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');

  // Wait for Firebase auth to restore session before rendering anything
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (!user) {
        window.location.href = '/';
        return;
      }
      setAuthReady(true);
      loadProjects();
    });
    return () => unsub();
  }, []);

  async function loadProjects() {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc')));
    setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function handleAdd(form) {
    setSaving(true);
    const ref = await addDoc(collection(db, 'projects'), {
      ...form,
      budget: form.budget ? Number(form.budget) : 0,
      shareToken: genToken(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setProjects(p => [{ id: ref.id, ...form, createdAt: new Date() }, ...p]);
    setSaving(false);
    setShowAdd(false);
  }

  async function handleStatusChange(project, newStatus) {
    await updateDoc(doc(db, 'projects', project.id), { status: newStatus, updatedAt: serverTimestamp() });
    setProjects(ps => ps.map(p => p.id === project.id ? { ...p, status: newStatus } : p));
    setSelected(s => s ? { ...s, status: newStatus } : s);
  }

  async function handleDelete(project) {
    await deleteDoc(doc(db, 'projects', project.id));
    setProjects(ps => ps.filter(p => p.id !== project.id));
    setSelected(null);
  }

  // Show loading screen while Firebase restores auth session
  if (!authReady) {
    return (
      <div style={{
        minHeight: '100vh', background: BRAND.navy,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{ width: 48, height: 48, background: BRAND.gold, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, color: BRAND.navy }}>TG</div>
        <div style={{ color: BRAND.gold, fontFamily: 'system-ui, sans-serif', fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  const FILTERS = ['All', ...STATUS_OPTIONS];
  const filtered = filter === 'All' ? projects : projects.filter(p => p.status === filter);

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'In Progress').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    revenue: projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0),
  };

  return (
    <div style={{ minHeight: '100vh', background: BRAND.bg, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <div style={{ background: BRAND.navy, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: BRAND.gold, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: BRAND.navy }}>TG</div>
          <div>
            <div style={{ color: BRAND.white, fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Tall Guy Builds</div>
            <div style={{ color: BRAND.gold, fontSize: 10, letterSpacing: 0.5 }}>ADMIN DASHBOARD</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Btn onClick={() => setShowAdd(true)} style={{ background: BRAND.gold, color: BRAND.navy }}>+ New Project</Btn>
          <Btn variant="secondary" onClick={() => signOut(auth)} style={{ color: BRAND.white, borderColor: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Sign Out</Btn>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Projects', value: stats.total, color: BRAND.navy },
            { label: 'In Progress', value: stats.active, color: BRAND.blue },
            { label: 'Completed', value: stats.completed, color: BRAND.green },
            { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, color: BRAND.gold },
          ].map(s => (
            <div key={s.label} style={{ background: BRAND.white, borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 11, color: BRAND.gray, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 20, border: 'none',
              background: filter === f ? BRAND.gold : BRAND.white,
              color: filter === f ? BRAND.navy : BRAND.gray,
              fontWeight: filter === f ? 700 : 400,
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: BRAND.gray }}>Loading projects…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: BRAND.gray }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏗️</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No projects yet</div>
            <div style={{ fontSize: 13 }}>Click "New Project" to add your first one.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {filtered.map(p => (
              <div key={p.id} onClick={() => setSelected(p)} style={{
                background: BRAND.white, borderRadius: 14, padding: 18,
                cursor: 'pointer', border: `1px solid ${BRAND.grayLight}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND.gold; e.currentTarget.style.boxShadow = `0 4px 16px rgba(200,169,106,0.2)`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BRAND.grayLight; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: BRAND.gold, fontWeight: 700, marginBottom: 2 }}>{p.type}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: BRAND.navy }}>{p.name}</div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div style={{ fontSize: 12, color: BRAND.gray, marginBottom: 10 }}>
                  👤 {p.client}
                  {p.address && <span> · 📍 {p.address}</span>}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: BRAND.gray }}>
                  {p.startDate && <span>📅 {p.startDate}</span>}
                  {p.budget > 0 && <span>💰 ${Number(p.budget).toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title="New Project" onClose={() => setShowAdd(false)}>
          <ProjectForm onSave={handleAdd} onCancel={() => setShowAdd(false)} saving={saving} />
        </Modal>
      )}

      {selected && (
        <ProjectDetail
          project={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
