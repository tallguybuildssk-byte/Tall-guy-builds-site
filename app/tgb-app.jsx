// ─── FIREBASE AUTH + ROLES ────────────────────────────────────────────────────
// Using Firebase v9 compat (CDN)
// Auth state is managed at App level; role is stored in Firestore users/{uid}
const { useState, useEffect, useRef, useCallback } = React;

const C = {
  navy: "#1A2332",
  navyLight: "#243044",
  navyDark: "#111B27",
  gold: "#D4A853",
  goldDim: "#A8884A",
  goldLight: "#E8C87A",
  cream: "#F5F0E8",
  muted: "#7B8A9B",
  border: "#263345",
  success: "#34C778",
  warn: "#F59E0B",
  danger: "#EF4444",
  white: "#FFFFFF",
  accent: "#4A9EFF",
};
const font = "'DM Serif Display', serif";
const fontBody = "'DM Sans', sans-serif";

// ─── MOCK AUTH (Firebase-ready interface) ─────────────────────────────────────
// Replace _mockAuth with real Firebase Auth when you wire up firebase-config.js
const _mockUsers = [
  { uid: "evan-001", email: "evan@tallguybuilds.ca", name: "Evan", role: "owner" },
  { uid: "client-priya", email: "priya@example.com", name: "Priya Sharma", role: "client", jobId: 1 },
  { uid: "client-dave", email: "dave@example.com", name: "Dave Kowalski", role: "client", jobId: 2 },
];
let _currentUser = null;
const _authListeners = [];
const mockAuth = {
  signInWithEmailAndPassword: (email, password) => {
    const u = _mockUsers.find(u => u.email === email);
    if (!u) return Promise.reject(new Error("No account found for that email."));
    if (password.length < 4) return Promise.reject(new Error("Wrong password."));
    _currentUser = u;
    _authListeners.forEach(cb => cb(u));
    return Promise.resolve({ user: u });
  },
  signOut: () => {
    _currentUser = null;
    _authListeners.forEach(cb => cb(null));
    return Promise.resolve();
  },
  onAuthStateChanged: (cb) => {
    _authListeners.push(cb);
    cb(_currentUser);
    return () => { const i = _authListeners.indexOf(cb); if (i > -1) _authListeners.splice(i, 1); };
  },
  sendPasswordResetEmail: (email) => {
    alert("Password reset email sent to " + email + " (demo mode)");
    return Promise.resolve();
  },
  createUserWithEmailAndPassword: (email, tempPass) => {
    const newUser = { uid: "client-" + Date.now(), email, name: email.split("@")[0], role: "client", jobId: null };
    _mockUsers.push(newUser);
    return Promise.resolve({ user: newUser });
  }
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const initLeads = [
  { id: 1, name: "Mike Thornton", phone: "306-555-0192", type: "Deck", value: 18500, stage: "New", notes: "Referred by Sarah H.", date: "2026-02-15" },
  { id: 2, name: "Carla Jensen", phone: "306-555-0344", type: "Basement", value: 45000, stage: "Quoted", notes: "Looking to start April", date: "2026-02-10" },
  { id: 3, name: "Dave Kowalski", phone: "306-555-0771", type: "Garage", value: 32000, stage: "Follow-up", notes: "Seen 3 other builders", date: "2026-02-08" },
  { id: 4, name: "Priya Sharma", phone: "306-555-0420", type: "Bathroom", value: 12000, stage: "Won", notes: "Start Mar 3", date: "2026-01-28" },
];
const initJobs = [
  { id: 1, name: "Addison Basement Dev", client: "Priya Sharma", clientEmail: "priya@example.com", address: "3518 Green Creek Rd", type: "Basement Development", status: "Active", value: 12000, paid: 6000, startDate: "2026-03-03", endDate: "2026-04-15", progress: 35, notes: "Framing phase underway",
    docs: [{ name: "Approved Estimate.pdf", size: "142 KB", date: "2026-01-15", type: "pdf" }, { name: "Signed Contract.pdf", size: "88 KB", date: "2026-01-20", type: "pdf" }],
    schedule: [
      { id: 1, title: "Site Prep", startDate: "2026-03-03", endDate: "2026-03-05", color: "#4A9EFF", type: "phase" },
      { id: 2, title: "Framing", startDate: "2026-03-06", endDate: "2026-03-20", color: "#D4A853", type: "phase" },
      { id: 3, title: "Electrical Rough-in", startDate: "2026-03-21", endDate: "2026-03-28", color: "#34C778", type: "phase" },
      { id: 4, title: "Drywalling", startDate: "2026-03-29", endDate: "2026-04-08", color: "#C084FC", type: "phase" },
      { id: 5, title: "Finishing", startDate: "2026-04-09", endDate: "2026-04-15", color: "#F59E0B", type: "phase" },
    ]
  },
  { id: 2, name: "Kowalski Garage", client: "Dave Kowalski", clientEmail: "dave@example.com", address: "742 Henderson Dr", type: "Garage", status: "Upcoming", value: 32000, paid: 9600, startDate: "2026-04-20", endDate: "2026-06-30", progress: 0, notes: "Permit submitted",
    docs: [{ name: "Approved Estimate.pdf", size: "98 KB", date: "2026-02-01", type: "pdf" }],
    schedule: [
      { id: 1, title: "Excavation", startDate: "2026-04-20", endDate: "2026-04-25", color: "#4A9EFF", type: "phase" },
      { id: 2, title: "Foundation", startDate: "2026-04-26", endDate: "2026-05-10", color: "#D4A853", type: "phase" },
      { id: 3, title: "Framing", startDate: "2026-05-11", endDate: "2026-05-30", color: "#34C778", type: "phase" },
      { id: 4, title: "Roofing", startDate: "2026-05-31", endDate: "2026-06-10", color: "#C084FC", type: "phase" },
      { id: 5, title: "Finishing", startDate: "2026-06-11", endDate: "2026-06-30", color: "#F59E0B", type: "phase" },
    ]
  },
  { id: 3, name: "Wilson Deck Replacement", client: "Brian Wilson", clientEmail: "brian@example.com", address: "88 Lakeview Cres", type: "Deck", status: "Completed", value: 14200, paid: 14200, startDate: "2025-09-01", endDate: "2025-10-10", progress: 100, notes: "Holdback released",
    docs: [],
    schedule: [
      { id: 1, title: "Demo Old Deck", startDate: "2025-09-01", endDate: "2025-09-03", color: "#EF4444", type: "phase" },
      { id: 2, title: "Framing", startDate: "2025-09-04", endDate: "2025-09-18", color: "#D4A853", type: "phase" },
      { id: 3, title: "Decking", startDate: "2025-09-19", endDate: "2025-10-05", color: "#34C778", type: "phase" },
      { id: 4, title: "Railing & Finishing", startDate: "2025-10-06", endDate: "2025-10-10", color: "#F59E0B", type: "phase" },
    ]
  },
];
const initSubs = [
  { id: 1, name: "Rick Paulson", trade: "Electrical", phone: "306-555-0811", email: "rick@paulsonelectric.ca", rating: 5, notes: "Go-to for all electrical", active: true },
  { id: 2, name: "Torres Plumbing", trade: "Plumbing", phone: "306-555-0234", email: "info@torresplumbing.ca", rating: 4, notes: "Good but books up fast", active: true },
  { id: 3, name: "Flatland Concrete", trade: "Concrete", phone: "306-555-0567", email: "jobs@flatland.ca", rating: 5, notes: "Best prices in the city", active: true },
  { id: 4, name: "Kyle Drywall", trade: "Drywall", phone: "306-555-0399", email: "kyle@kyledrywall.com", rating: 3, notes: "Inconsistent finish quality", active: false },
];
const initEvents = [
  { id: 1, title: "Addison – Framing Inspection", job: "Addison Basement Dev", date: "2026-02-24", time: "10:00", type: "inspection", color: C.warn },
  { id: 2, title: "Kowalski – Site Measure", job: "Kowalski Garage", date: "2026-02-26", time: "14:00", type: "site", color: C.gold },
  { id: 3, title: "Thornton – Quote Walkthrough", job: "Lead", date: "2026-02-28", time: "11:00", type: "quote", color: C.accent },
  { id: 4, title: "Rick – Electrical Rough-in Starts", job: "Addison Basement Dev", date: "2026-03-05", time: "08:00", type: "sub", color: C.success },
  { id: 5, title: "Kowalski Garage Start", job: "Kowalski Garage", date: "2026-04-20", time: "08:00", type: "site", color: C.gold },
];
const LEAD_STAGES = ["New","Quoted","Follow-up","Won","Lost"];
const JOB_STATUSES = ["Upcoming","Active","Completed","On Hold"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const fmt$ = v => '$' + Number(v).toLocaleString();
const fmtDate = d => d ? new Date(d + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "—";
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const addDays = (d, n) => { const dt = new Date(d + "T12:00:00"); dt.setDate(dt.getDate() + n); return dt.toISOString().slice(0,10); };

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
function StatusBadge({ label }) {
  const colors = {
    "Active": { bg: "#14532d22", text: "#4ade80" }, "Upcoming": { bg: "#1e3a5f22", text: C.accent },
    "Completed": { bg: "#1c1c1c", text: C.muted }, "On Hold": { bg: "#7c2d1222", text: "#FB923C" },
    "Won": { bg: "#14532d22", text: "#4ade80" }, "Lost": { bg: "#7f1d1d22", text: "#F87171" },
    "New": { bg: "#1e3a5f22", text: C.accent }, "Quoted": { bg: "#78350f22", text: C.gold },
    "Follow-up": { bg: "#581c8722", text: "#C084FC" },
  };
  const c = colors[label] || { bg: "#1c1c1c", text: C.muted };
  return <span style={{ background: c.bg, color: c.text, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{label}</span>;
}
function Card({ children, style = {}, onClick }) {
  return <div onClick={onClick} style={{ background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, ...(onClick ? { cursor: "pointer" } : {}), ...style }}>{children}</div>;
}
function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: C.navyDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 14px", color: C.white, fontSize: 14, fontFamily: fontBody, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
        onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: C.navyDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 14px", color: C.white, fontSize: 14, fontFamily: fontBody, outline: "none", boxSizing: "border-box" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Btn({ children, onClick, variant = "primary", size = "md", style = {}, disabled = false }) {
  const base = { cursor: disabled ? "not-allowed" : "pointer", borderRadius: 8, fontFamily: fontBody, fontWeight: 700, border: "none", transition: "all 0.15s", opacity: disabled ? 0.5 : 1, letterSpacing: "0.02em" };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, color: C.navyDark, boxShadow: "0 2px 8px rgba(212,168,83,0.3)" },
    ghost: { background: "transparent", color: C.gold, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.danger, border: `1px solid ${C.border}` },
    subtle: { background: C.navyDark, color: C.muted, border: `1px solid ${C.border}` },
  };
  const sizes = { sm: { padding: "5px 12px", fontSize: 12 }, md: { padding: "9px 20px", fontSize: 14 }, lg: { padding: "12px 32px", fontSize: 15 } };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...sizes[size], ...style }}>{children}</button>;
}
function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ margin: 0, color: C.white, fontFamily: font, fontSize: 22 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const result = await mockAuth.signInWithEmailAndPassword(email, password);
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleReset() {
    if (!email) { setError("Enter your email above first."); return; }
    await mockAuth.sendPasswordResetEmail(email);
    setShowReset(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${C.navyDark} 0%, ${C.navy} 60%, #1E3A5F 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontBody, padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, borderRadius: 16, marginBottom: 16, boxShadow: "0 8px 24px rgba(212,168,83,0.3)" }}>
            <span style={{ fontSize: 28 }}>🏗</span>
          </div>
          <div style={{ fontFamily: font, fontSize: 28, color: C.white, lineHeight: 1.1 }}>Tall Guy</div>
          <div style={{ fontFamily: font, fontSize: 28, color: C.gold, lineHeight: 1.1 }}>Builds</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Project Management</div>
        </div>
        {/* Card */}
        <div style={{ background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
          <h2 style={{ color: C.white, fontFamily: font, fontSize: 22, marginBottom: 4, marginTop: 0 }}>Welcome back</h2>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 24, marginTop: 0 }}>Sign in to your account</p>
          {error && (
            <div style={{ background: "#7f1d1d22", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#F87171", fontSize: 13 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
            <Btn size="lg" style={{ width: "100%", marginTop: 4 }} disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Btn>
          </form>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => setShowReset(true)} style={{ background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              Forgot password?
            </button>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 20, color: C.muted, fontSize: 12 }}>
          Demo: evan@tallguybuilds.ca / any password
        </div>
      </div>
      {showReset && (
        <Modal title="Reset Password" onClose={() => setShowReset(false)} width={380}>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 0 }}>Enter your email and we'll send a reset link.</p>
          <Input label="Email" type="email" value={email} onChange={setEmail} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setShowReset(false)}>Cancel</Btn>
            <Btn onClick={handleReset}>Send Reset Email</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PER-PROJECT GANTT SCHEDULE ───────────────────────────────────────────────
function ProjectSchedule({ job, onUpdate }) {
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [phaseForm, setPhaseForm] = useState({ title: "", startDate: job.startDate, endDate: job.startDate, color: "#4A9EFF", type: "phase" });
  const ganttRef = useRef(null);
  const COLORS = ["#4A9EFF","#D4A853","#34C778","#C084FC","#F59E0B","#EF4444","#60A5FA","#FB923C"];

  const schedule = job.schedule || [];
  const projectStart = job.startDate;
  const projectEnd = job.endDate;
  const totalDays = Math.max(daysBetween(projectStart, projectEnd), 1);

  function pct(date) {
    const d = daysBetween(projectStart, date);
    return Math.max(0, Math.min(100, (d / totalDays) * 100));
  }
  function width(start, end) {
    const d = Math.max(1, daysBetween(start, end));
    return Math.max(2, (d / totalDays) * 100);
  }

  function handleBarMouseDown(e, phase) {
    e.preventDefault();
    const bar = e.currentTarget;
    const barRect = bar.getBoundingClientRect();
    const clickX = e.clientX - barRect.left;
    setDragging(phase.id);
    setDragOffset(clickX / barRect.width);
  }

  function handleGanttMouseMove(e) {
    if (!dragging || !ganttRef.current) return;
    const ganttRect = ganttRef.current.getBoundingClientRect();
    const relX = (e.clientX - ganttRect.left) / ganttRect.width;
    const rawDay = Math.round(relX * totalDays - dragOffset * (daysBetween(
      (schedule.find(p => p.id === dragging) || {}).startDate || projectStart,
      (schedule.find(p => p.id === dragging) || {}).endDate || projectStart
    )));
    const clampedDay = Math.max(0, Math.min(totalDays - 1, rawDay));
    const phase = schedule.find(p => p.id === dragging);
    if (!phase) return;
    const duration = daysBetween(phase.startDate, phase.endDate);
    const newStart = addDays(projectStart, clampedDay);
    const newEnd = addDays(newStart, duration);
    onUpdate(job.id, dragging, { startDate: newStart, endDate: newEnd });
  }

  function handleGanttMouseUp() { setDragging(null); }

  function savePhase() {
    const newPhase = { ...phaseForm, id: Date.now() };
    onUpdate(job.id, null, null, newPhase);
    setShowAddPhase(false);
    setPhaseForm({ title: "", startDate: job.startDate, endDate: job.startDate, color: "#4A9EFF", type: "phase" });
  }

  function removePhase(phaseId) {
    onUpdate(job.id, phaseId, null, null, true);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.white, fontSize: 15 }}>📅 Project Timeline</div>
        <Btn size="sm" onClick={() => setShowAddPhase(true)}>+ Phase</Btn>
      </div>
      {/* Month ruler */}
      <div style={{ position: "relative", height: 20, marginBottom: 4 }}>
        {Array.from({ length: totalDays }, (_, i) => {
          const d = addDays(projectStart, i);
          if (d.slice(8) !== "01") return null;
          return (
            <div key={d} style={{ position: "absolute", left: pct(d) + "%", fontSize: 10, color: C.muted, transform: "translateX(-50%)" }}>
              {new Date(d + "T12:00:00").toLocaleDateString("en-CA", { month: "short" })}
            </div>
          );
        })}
      </div>
      {/* Gantt bars */}
      <div ref={ganttRef} onMouseMove={handleGanttMouseMove} onMouseUp={handleGanttMouseUp} onMouseLeave={handleGanttMouseUp}
        style={{ position: "relative", background: C.navyDark, borderRadius: 8, border: `1px solid ${C.border}`, padding: "10px 0", userSelect: "none" }}>
        {/* Grid lines */}
        {Array.from({ length: totalDays }, (_, i) => {
          const d = addDays(projectStart, i);
          if (d.slice(8) !== "01") return null;
          return <div key={d} style={{ position: "absolute", left: pct(d) + "%", top: 0, bottom: 0, borderLeft: `1px dashed ${C.border}`, pointerEvents: "none" }} />;
        })}
        {schedule.length === 0 && (
          <div style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: "20px 0" }}>No phases yet. Click + Phase to add.</div>
        )}
        {schedule.map((phase, row) => (
          <div key={phase.id} style={{ position: "relative", height: 36, marginBottom: 4 }}>
            <div style={{ position: "absolute", left: "0", right: "0", top: "50%", transform: "translateY(-50%)", height: 1, background: C.border }} />
            <div
              onMouseDown={e => handleBarMouseDown(e, phase)}
              style={{
                position: "absolute",
                left: pct(phase.startDate) + "%",
                width: width(phase.startDate, phase.endDate) + "%",
                top: "50%", transform: "translateY(-50%)",
                height: 28,
                background: phase.color + "CC",
                border: `1px solid ${phase.color}`,
                borderRadius: 6,
                cursor: dragging === phase.id ? "grabbing" : "grab",
                display: "flex", alignItems: "center", paddingLeft: 8,
                boxSizing: "border-box",
                transition: dragging === phase.id ? "none" : "box-shadow 0.15s",
                boxShadow: dragging === phase.id ? `0 4px 16px ${phase.color}55` : "none",
                minWidth: 4,
                overflow: "hidden",
                zIndex: 2,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {phase.title}
              </span>
            </div>
            <button onClick={() => removePhase(phase.id)} style={{ position: "absolute", right: 2, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, zIndex: 3 }}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginTop: 4 }}>
        <span>{fmtDate(projectStart)}</span>
        <span style={{ fontSize: 10 }}>drag bars to reschedule</span>
        <span>{fmtDate(projectEnd)}</span>
      </div>
      {showAddPhase && (
        <Modal title="Add Phase" onClose={() => setShowAddPhase(false)} width={420}>
          <Input label="Phase Name" value={phaseForm.title} onChange={v => setPhaseForm(p => ({ ...p, title: v }))} placeholder="e.g. Framing" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="Start Date" type="date" value={phaseForm.startDate} onChange={v => setPhaseForm(p => ({ ...p, startDate: v }))} />
            <Input label="End Date" type="date" value={phaseForm.endDate} onChange={v => setPhaseForm(p => ({ ...p, endDate: v }))} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Colour</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COLORS.map(col => (
                <div key={col} onClick={() => setPhaseForm(p => ({ ...p, color: col }))}
                  style={{ width: 28, height: 28, borderRadius: 6, background: col, cursor: "pointer", border: phaseForm.color === col ? `2px solid ${C.white}` : "2px solid transparent", transition: "transform 0.1s", transform: phaseForm.color === col ? "scale(1.15)" : "scale(1)" }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setShowAddPhase(false)}>Cancel</Btn>
            <Btn onClick={savePhase}>Add Phase</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ jobs, leads, user }) {
  const activeJobs = jobs.filter(j => j.status === "Active");
  const pipelineValue = leads.filter(l => !["Won","Lost"].includes(l.stage)).reduce((s, l) => s + l.value, 0);
  const outstanding = jobs.reduce((s, j) => s + (j.value - j.paid), 0);
  const wonValue = leads.filter(l => l.stage === "Won").reduce((s, l) => s + l.value, 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: font, color: C.white, fontSize: 32, marginBottom: 4, marginTop: 0 }}>{greeting}, {user?.name?.split(" ")[0] || "Evan"}.</h1>
        <p style={{ color: C.muted, marginBottom: 0, fontSize: 15 }}>Here's where things stand today.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 32 }}>
        {[
          { label: "Active Jobs", value: activeJobs.length, sub: "in progress", color: C.gold, icon: "🏗" },
          { label: "Pipeline Value", value: fmt$(pipelineValue), sub: "open leads", color: C.accent, icon: "🎯" },
          { label: "Outstanding", value: fmt$(outstanding), sub: "receivable", color: C.warn, icon: "💰" },
          { label: "Won This Month", value: fmt$(wonValue), sub: "closed", color: C.success, icon: "✅" },
        ].map(k => (
          <Card key={k.label} style={{ padding: 18 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontFamily: font, color: k.color, marginBottom: 2 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{k.sub}</div>
          </Card>
        ))}
      </div>
      <h2 style={{ fontFamily: font, color: C.white, fontSize: 20, marginBottom: 14 }}>Active Projects</h2>
      <div style={{ display: "grid", gap: 12, marginBottom: 32 }}>
        {activeJobs.map(job => (
          <Card key={job.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, color: C.white, fontSize: 16 }}>{job.name}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{job.client} · {job.address}</div>
              </div>
              <StatusBadge label={job.status} />
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 5 }}>
                <span>Progress</span><span style={{ color: C.gold }}>{job.progress}%</span>
              </div>
              <div style={{ background: C.border, borderRadius: 4, height: 6 }}>
                <div style={{ background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, borderRadius: 4, height: 6, width: `${job.progress}%`, transition: "width 0.5s" }} />
              </div>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 20, fontSize: 13, color: C.muted, flexWrap: "wrap" }}>
              <span>Contract: <b style={{ color: C.white }}>{fmt$(job.value)}</b></span>
              <span>Received: <b style={{ color: C.success }}>{fmt$(job.paid)}</b></span>
              <span>Owing: <b style={{ color: C.warn }}>{fmt$(job.value - job.paid)}</b></span>
            </div>
          </Card>
        ))}
      </div>
      <h2 style={{ fontFamily: font, color: C.white, fontSize: 20, marginBottom: 14 }}>Recent Leads</h2>
      <Card style={{ padding: 0 }}>
        {leads.slice(0, 4).map((l, i) => (
          <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: i < 3 ? `1px solid ${C.border}` : "none", flexWrap: "wrap", gap: 8 }}>
            <div>
              <span style={{ color: C.white, fontWeight: 600 }}>{l.name}</span>
              <span style={{ color: C.muted, fontSize: 13, marginLeft: 10 }}>{l.type}</span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ color: C.gold, fontWeight: 700 }}>{fmt$(l.value)}</span>
              <StatusBadge label={l.stage} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── JOBS ─────────────────────────────────────────────────────────────────────
function Jobs({ jobs, setJobs }) {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailJob, setDetailJob] = useState(null);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({});
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const filtered = filter === "All" ? jobs : jobs.filter(j => j.status === filter);

  function openNew() {
    setForm({ name: "", client: "", clientEmail: "", address: "", type: "Deck", status: "Upcoming", value: "", paid: 0, startDate: "", endDate: "", progress: 0, notes: "", docs: [], schedule: [] });
    setSelected(null); setShowModal(true);
  }
  function openEdit(job) { setForm({ ...job }); setSelected(job); setShowModal(true); }
  function save() {
    const updated = { ...form, value: +form.value, paid: +form.paid, progress: +form.progress, docs: form.docs || [], schedule: form.schedule || [] };
    if (selected) setJobs(js => js.map(j => j.id === selected.id ? { ...updated, id: j.id } : j));
    else setJobs(js => [...js, { ...updated, id: Date.now() }]);
    setShowModal(false);
  }

  function handleScheduleUpdate(jobId, phaseId, updates, newPhase, remove) {
    setJobs(js => js.map(j => {
      if (j.id !== jobId) return j;
      if (newPhase) return { ...j, schedule: [...(j.schedule || []), newPhase] };
      if (remove) return { ...j, schedule: (j.schedule || []).filter(p => p.id !== phaseId) };
      return { ...j, schedule: (j.schedule || []).map(p => p.id === phaseId ? { ...p, ...updates } : p) };
    }));
    if (detailJob?.id === jobId) {
      setDetailJob(dj => {
        const j = { ...dj };
        if (newPhase) return { ...j, schedule: [...(j.schedule || []), newPhase] };
        if (remove) return { ...j, schedule: (j.schedule || []).filter(p => p.id !== phaseId) };
        return { ...j, schedule: (j.schedule || []).map(p => p.id === phaseId ? { ...p, ...updates } : p) };
      });
    }
  }

  function handleFileDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || e.target.files || []);
    const newDocs = files.map(file => ({ name: file.name, size: (file.size / 1024).toFixed(0) + " KB", date: new Date().toISOString().slice(0, 10), type: file.name.split(".").pop().toLowerCase() }));
    if (detailJob) {
      setJobs(js => js.map(j => j.id === detailJob.id ? { ...j, docs: [...(j.docs || []), ...newDocs] } : j));
      setDetailJob(dj => ({ ...dj, docs: [...(dj.docs || []), ...newDocs] }));
    }
  }
  function removeDoc(jobId, docIdx) {
    setJobs(js => js.map(j => j.id === jobId ? { ...j, docs: j.docs.filter((_, i) => i !== docIdx) } : j));
    setDetailJob(dj => ({ ...dj, docs: dj.docs.filter((_, i) => i !== docIdx) }));
  }
  const fileIcon = (type) => ({ pdf: "📄", jpg: "🖼️", jpeg: "🖼️", png: "🖼️", docx: "📝", xlsx: "📊" }[type] || "📎");

  async function sendInvite() {
    // In production: create Firebase user + send email via Cloud Function
    alert(`Invite sent to ${inviteEmail}! They'll receive a link to view the ${detailJob?.name} project. (Demo mode)`);
    setInviteSent(true);
    setShowInvite(false);
    setInviteEmail("");
  }

  if (detailJob) {
    const job = jobs.find(j => j.id === detailJob.id) || detailJob;
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <Btn variant="ghost" size="sm" onClick={() => setDetailJob(null)}>← All Projects</Btn>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: font, color: C.white, fontSize: 26, margin: 0 }}>{job.name}</h1>
            <div style={{ color: C.muted, marginTop: 4 }}>{job.client} · {job.address}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <StatusBadge label={job.status} />
            <Btn size="sm" variant="ghost" onClick={() => openEdit(job)}>Edit</Btn>
            <Btn size="sm" variant="subtle" onClick={() => { setInviteEmail(job.clientEmail || ""); setShowInvite(true); }}>✉ Invite Client</Btn>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[{ label: "Contract", value: fmt$(job.value), color: C.white }, { label: "Received", value: fmt$(job.paid), color: C.success }, { label: "Outstanding", value: fmt$(job.value - job.paid), color: C.warn }].map(k => (
            <Card key={k.label} style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontFamily: font, fontSize: 20, color: k.color }}>{k.value}</div>
            </Card>
          ))}
        </div>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, marginBottom: 8 }}>
            <span>Overall Progress</span><span style={{ color: C.gold }}>{job.progress}%</span>
          </div>
          <div style={{ background: C.border, borderRadius: 6, height: 8 }}>
            <div style={{ background: job.progress === 100 ? C.success : `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, borderRadius: 6, height: 8, width: `${job.progress}%`, transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 13, color: C.muted }}>
            <span>Start: <b style={{ color: C.white }}>{fmtDate(job.startDate)}</b></span>
            <span>End: <b style={{ color: C.white }}>{fmtDate(job.endDate)}</b></span>
          </div>
          {job.notes && <div style={{ marginTop: 10, color: C.muted, fontSize: 13 }}>📝 {job.notes}</div>}
        </Card>
        {/* Gantt Timeline */}
        {job.startDate && job.endDate && (
          <Card style={{ marginBottom: 16 }}>
            <ProjectSchedule job={job} onUpdate={handleScheduleUpdate} />
          </Card>
        )}
        {/* Document Upload */}
        <Card>
          <div style={{ fontWeight: 700, color: C.white, fontSize: 15, marginBottom: 14 }}>📁 Project Documents</div>
          <div onDragOver={e => e.preventDefault()} onDrop={handleFileDrop}
            style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: "24px 16px", textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
            <div style={{ color: C.muted, fontSize: 14, marginBottom: 8 }}>Drag & drop files here, or</div>
            <label style={{ cursor: "pointer" }}>
              <span style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, color: C.navyDark, padding: "6px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>Browse Files</span>
              <input type="file" multiple style={{ display: "none" }} onChange={handleFileDrop} accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx" />
            </label>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>PDF, images, Word, Excel</div>
          </div>
          {(job.docs || []).length === 0 ? (
            <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "10px 0" }}>No documents yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {(job.docs || []).map((doc, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.navyDark, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{fileIcon(doc.type)}</span>
                    <div>
                      <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{doc.name}</div>
                      <div style={{ color: C.muted, fontSize: 11 }}>{doc.size} · {fmtDate(doc.date)}</div>
                    </div>
                  </div>
                  <button onClick={() => removeDoc(job.id, i)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                </div>
              ))}
            </div>
          )}
        </Card>
        {showModal && (
          <Modal title="Edit Project" onClose={() => setShowModal(false)}>
            <Input label="Project Name" value={form.name || ""} onChange={v => f("name", v)} />
            <Input label="Client Name" value={form.client || ""} onChange={v => f("client", v)} />
            <Input label="Client Email" type="email" value={form.clientEmail || ""} onChange={v => f("clientEmail", v)} />
            <Input label="Address" value={form.address || ""} onChange={v => f("address", v)} />
            <Select label="Type" value={form.type || "Deck"} onChange={v => f("type", v)} options={["Deck","Basement","Garage","Bathroom","Fence","Addition","Other"]} />
            <Select label="Status" value={form.status || "Upcoming"} onChange={v => f("status", v)} options={JOB_STATUSES} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="Contract Value" type="number" value={form.value || ""} onChange={v => f("value", v)} />
              <Input label="Amount Received" type="number" value={form.paid || ""} onChange={v => f("paid", v)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="Start Date" type="date" value={form.startDate || ""} onChange={v => f("startDate", v)} />
              <Input label="End Date" type="date" value={form.endDate || ""} onChange={v => f("endDate", v)} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Progress ({form.progress || 0}%)</label>
              <input type="range" min={0} max={100} value={form.progress || 0} onChange={e => f("progress", e.target.value)} style={{ width: "100%", accentColor: C.gold }} />
            </div>
            <Input label="Notes" value={form.notes || ""} onChange={v => f("notes", v)} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn onClick={save}>Save Project</Btn>
            </div>
          </Modal>
        )}
        {showInvite && (
          <Modal title="Invite Client" onClose={() => setShowInvite(false)} width={420}>
            <p style={{ color: C.muted, fontSize: 14, marginTop: 0 }}>Send {job.client} a secure link to view their project status, progress, and documents.</p>
            <Input label="Client Email" type="email" value={inviteEmail} onChange={setInviteEmail} placeholder="client@example.com" />
            <div style={{ background: C.navyDark, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: C.muted }}>
              <div style={{ color: C.gold, fontWeight: 700, marginBottom: 4 }}>They will see:</div>
              <div>✓ Project progress & timeline</div>
              <div>✓ Start & estimated completion dates</div>
              <div>✓ Their project documents</div>
              <div style={{ color: C.danger, marginTop: 4 }}>✗ No financial details visible to client</div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Btn>
              <Btn onClick={sendInvite}>Send Invite</Btn>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: font, color: C.white, fontSize: 28, margin: 0 }}>Projects</h1>
        <Btn onClick={openNew}>+ New Project</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["All", ...JOB_STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${filter === s ? C.gold : C.border}`, background: filter === s ? C.gold + "22" : "transparent", color: filter === s ? C.gold : C.muted, cursor: "pointer", fontSize: 13, fontFamily: fontBody }}>{s}</button>
        ))}
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {filtered.map(job => (
          <Card key={job.id} onClick={() => setDetailJob(job)}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, color: C.white, fontSize: 17 }}>{job.name}</div>
                <div style={{ color: C.muted, fontSize: 13 }}>{job.client} · {job.address}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{fmtDate(job.startDate)} → {fmtDate(job.endDate)}</div>
                {(job.docs || []).length > 0 && <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>📁 {job.docs.length} doc{job.docs.length !== 1 ? "s" : ""}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <StatusBadge label={job.status} />
                <div style={{ color: C.gold, fontWeight: 700, fontSize: 18, marginTop: 6 }}>{fmt$(job.value)}</div>
                <div style={{ color: C.muted, fontSize: 12 }}>{fmt$(job.paid)} received</div>
              </div>
            </div>
            {job.status !== "Upcoming" && (
              <div style={{ marginTop: 12 }}>
                <div style={{ background: C.border, borderRadius: 4, height: 5 }}>
                  <div style={{ background: job.progress === 100 ? C.success : `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, borderRadius: 4, height: 5, width: `${job.progress}%` }} />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
      {showModal && (
        <Modal title="New Project" onClose={() => setShowModal(false)}>
          <Input label="Project Name" value={form.name || ""} onChange={v => f("name", v)} />
          <Input label="Client Name" value={form.client || ""} onChange={v => f("client", v)} />
          <Input label="Client Email" type="email" value={form.clientEmail || ""} onChange={v => f("clientEmail", v)} />
          <Input label="Address" value={form.address || ""} onChange={v => f("address", v)} />
          <Select label="Type" value={form.type || "Deck"} onChange={v => f("type", v)} options={["Deck","Basement","Garage","Bathroom","Fence","Addition","Other"]} />
          <Select label="Status" value={form.status || "Upcoming"} onChange={v => f("status", v)} options={JOB_STATUSES} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="Contract Value" type="number" value={form.value || ""} onChange={v => f("value", v)} />
            <Input label="Amount Received" type="number" value={form.paid || ""} onChange={v => f("paid", v)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="Start Date" type="date" value={form.startDate || ""} onChange={v => f("startDate", v)} />
            <Input label="End Date" type="date" value={form.endDate || ""} onChange={v => f("endDate", v)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Progress ({form.progress || 0}%)</label>
            <input type="range" min={0} max={100} value={form.progress || 0} onChange={e => f("progress", e.target.value)} style={{ width: "100%", accentColor: C.gold }} />
          </div>
          <Input label="Notes" value={form.notes || ""} onChange={v => f("notes", v)} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Save Project</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── LEADS ────────────────────────────────────────────────────────────────────
function Leads({ leads, setLeads }) {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  function openNew() { setForm({ name: "", phone: "", type: "Deck", value: "", stage: "New", notes: "", date: new Date().toISOString().slice(0,10) }); setSelected(null); setShowModal(true); }
  function openEdit(l) { setForm({ ...l }); setSelected(l); setShowModal(true); }
  function save() {
    if (selected) setLeads(ls => ls.map(l => l.id === selected.id ? { ...form, id: l.id, value: +form.value } : l));
    else setLeads(ls => [...ls, { ...form, id: Date.now(), value: +form.value }]);
    setShowModal(false);
  }
  function move(lead, dir) {
    const idx = LEAD_STAGES.indexOf(lead.stage);
    const next = LEAD_STAGES[idx + dir];
    if (next) setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, stage: next } : l));
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: font, color: C.white, fontSize: 28, margin: 0 }}>Lead Pipeline</h1>
        <Btn onClick={openNew}>+ New Lead</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14 }}>
        {LEAD_STAGES.map(stage => {
          const sl = leads.filter(l => l.stage === stage);
          const sv = sl.reduce((s, l) => s + l.value, 0);
          return (
            <div key={stage}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{stage}</div>
                {sl.length > 0 && <div style={{ fontSize: 12, color: C.gold }}>{fmt$(sv)}</div>}
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {sl.map(lead => (
                  <Card key={lead.id} style={{ padding: 14 }}>
                    <div style={{ fontWeight: 700, color: C.white, fontSize: 14 }}>{lead.name}</div>
                    <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{lead.type} · {lead.phone}</div>
                    <div style={{ color: C.gold, fontWeight: 700, marginTop: 6, fontSize: 15 }}>{fmt$(lead.value)}</div>
                    {lead.notes && <div style={{ color: C.muted, fontSize: 12, marginTop: 4, fontStyle: "italic" }}>{lead.notes}</div>}
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      <Btn size="sm" variant="ghost" onClick={() => openEdit(lead)}>Edit</Btn>
                      {LEAD_STAGES.indexOf(lead.stage) < LEAD_STAGES.length - 1 && <Btn size="sm" onClick={() => move(lead, 1)}>→</Btn>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {showModal && (
        <Modal title={selected ? "Edit Lead" : "New Lead"} onClose={() => setShowModal(false)}>
          <Input label="Name" value={form.name || ""} onChange={v => f("name", v)} />
          <Input label="Phone" value={form.phone || ""} onChange={v => f("phone", v)} />
          <Select label="Project Type" value={form.type || "Deck"} onChange={v => f("type", v)} options={["Deck","Basement","Garage","Bathroom","Fence","Addition","Other"]} />
          <Input label="Estimated Value" type="number" value={form.value || ""} onChange={v => f("value", v)} />
          <Select label="Stage" value={form.stage || "New"} onChange={v => f("stage", v)} options={LEAD_STAGES} />
          <Input label="Date" type="date" value={form.date || ""} onChange={v => f("date", v)} />
          <Input label="Notes" value={form.notes || ""} onChange={v => f("notes", v)} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Save Lead</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SCHEDULE (with drag-to-move) ─────────────────────────────────────────────
function Schedule({ events, setEvents, jobs }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", job: "", date: "", time: "09:00", type: "site" });
  const [dragEvent, setDragEvent] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const typeColors = { inspection: C.warn, site: C.gold, quote: C.accent, sub: C.success, other: C.muted };
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

  function prevMonth() { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }
  function nextMonth() { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }
  function eventsOnDay(d) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return events.filter(e => e.date === dateStr);
  }
  function save() {
    setEvents(es => [...es, { ...form, id: Date.now(), color: typeColors[form.type] }]);
    setShowModal(false);
    setForm({ title: "", job: "", date: "", time: "09:00", type: "site" });
  }
  function openAddForDay(d) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    setForm({ title: "", job: "", date: dateStr, time: "09:00", type: "site" });
    setShowModal(true);
  }
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false });
  const selectedDayEvents = selectedDay ? eventsOnDay(selectedDay) : [];

  function handleDragStart(ev, event) { setDragEvent(event); ev.dataTransfer.effectAllowed = "move"; }
  function handleDragOver(ev, day) { ev.preventDefault(); if (day) setDragOver(day); }
  function handleDrop(ev, day) {
    ev.preventDefault();
    if (!dragEvent || !day) return;
    const newDate = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    setEvents(es => es.map(e => e.id === dragEvent.id ? { ...e, date: newDate } : e));
    setDragEvent(null); setDragOver(null);
    setSelectedDay(day);
  }
  function handleDragEnd() { setDragEvent(null); setDragOver(null); }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: font, color: C.white, fontSize: 28, margin: 0 }}>Schedule</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Btn variant="ghost" size="sm" onClick={prevMonth}>‹</Btn>
          <span style={{ color: C.white, fontFamily: font, fontSize: 18, minWidth: 160, textAlign: "center" }}>{MONTHS[viewMonth]} {viewYear}</span>
          <Btn variant="ghost" size="sm" onClick={nextMonth}>›</Btn>
          <Btn onClick={() => { setForm({ title: "", job: "", date: todayStr, time: "09:00", type: "site" }); setShowModal(true); }}>+ Add Event</Btn>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        {[["inspection","Inspection"],["site","Site Visit"],["quote","Quote"],["sub","Subtrade"],["other","Other"]].map(([type, label]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.muted }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: typeColors[type] }} />{label}
          </div>
        ))}
        <div style={{ fontSize: 12, color: C.muted, marginLeft: "auto" }}>✦ drag events to reschedule</div>
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${C.border}` }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{d}</div>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, week) => (
          <div key={week} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: week < 5 ? `1px solid ${C.border}` : "none" }}>
            {cells.slice(week * 7, week * 7 + 7).map((cell, idx) => {
              const dayEvents = cell.current ? eventsOnDay(cell.day) : [];
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(cell.day).padStart(2,"0")}`;
              const isToday = cell.current && dateStr === todayStr;
              const isSelected = cell.current && selectedDay === cell.day;
              const isDragTarget = cell.current && dragOver === cell.day;
              return (
                <div key={idx}
                  onClick={() => { if (cell.current) setSelectedDay(selectedDay === cell.day ? null : cell.day); }}
                  onDragOver={e => cell.current && handleDragOver(e, cell.day)}
                  onDrop={e => cell.current && handleDrop(e, cell.day)}
                  style={{ minHeight: 90, padding: "8px 6px", borderRight: idx < 6 ? `1px solid ${C.border}` : "none", background: isDragTarget ? C.gold + "22" : isSelected ? C.gold + "11" : "transparent", cursor: cell.current ? "pointer" : "default", transition: "background 0.15s" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: isToday ? C.gold : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4, fontSize: 13, fontWeight: isToday || isSelected ? 700 : 400, color: isToday ? C.navyDark : cell.current ? C.white : C.border }}>
                    {cell.day}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <div key={i} draggable onDragStart={e => handleDragStart(e, ev)} onDragEnd={handleDragEnd}
                        onClick={e => e.stopPropagation()}
                        style={{ background: ev.color + "33", borderLeft: `2px solid ${ev.color}`, borderRadius: "0 3px 3px 0", padding: "1px 4px", fontSize: 10, color: ev.color, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "grab", opacity: dragEvent?.id === ev.id ? 0.4 : 1 }}>
                        {ev.time} {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && <div style={{ fontSize: 10, color: C.muted }}>+{dayEvents.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </Card>
      {selectedDay && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: font, fontSize: 18, color: C.white }}>{MONTHS[viewMonth]} {selectedDay}, {viewYear}</div>
            <Btn size="sm" onClick={() => openAddForDay(selectedDay)}>+ Add</Btn>
          </div>
          {selectedDayEvents.length === 0 ? (
            <div style={{ color: C.muted, fontSize: 14 }}>Nothing scheduled. Click + Add to create an event.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {selectedDayEvents.map(ev => (
                <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 12, background: C.navyDark, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ width: 3, height: 36, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.white, fontWeight: 600, fontSize: 14 }}>{ev.title}</div>
                    <div style={{ color: C.muted, fontSize: 12 }}>{ev.job}</div>
                  </div>
                  <div style={{ color: C.gold, fontSize: 13, fontWeight: 600 }}>{ev.time}</div>
                  <button onClick={() => setEvents(es => es.filter(e => e.id !== ev.id))} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      {showModal && (
        <Modal title="New Event" onClose={() => setShowModal(false)}>
          <Input label="Title" value={form.title} onChange={v => f("title", v)} />
          <Select label="Related Job / Lead" value={form.job} onChange={v => f("job", v)} options={["", "Lead", ...jobs.map(j => j.name)]} />
          <Select label="Type" value={form.type} onChange={v => f("type", v)} options={["site","inspection","quote","sub","other"]} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="Date" type="date" value={form.date} onChange={v => f("date", v)} />
            <Input label="Time" type="time" value={form.time} onChange={v => f("time", v)} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Save Event</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SUBS ─────────────────────────────────────────────────────────────────────
function Subs({ subs, setSubs }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", trade: "", phone: "", email: "", rating: 5, notes: "", active: true });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  function save() {
    setSubs(s => [...s, { ...form, id: Date.now(), rating: +form.rating }]);
    setShowModal(false);
    setForm({ name: "", trade: "", phone: "", email: "", rating: 5, notes: "", active: true });
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: font, color: C.white, fontSize: 28, margin: 0 }}>Subcontractors</h1>
        <Btn onClick={() => setShowModal(true)}>+ Add Sub</Btn>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {subs.map(sub => (
          <Card key={sub.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 700, color: C.white, fontSize: 16 }}>{sub.name}</div>
                  {!sub.active && <span style={{ fontSize: 11, color: C.muted, background: C.border, padding: "1px 8px", borderRadius: 10 }}>Inactive</span>}
                </div>
                <div style={{ color: C.gold, fontSize: 13, marginTop: 2 }}>{sub.trade}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{sub.phone} · {sub.email}</div>
                {sub.notes && <div style={{ color: C.muted, fontSize: 13, marginTop: 4, fontStyle: "italic" }}>{sub.notes}</div>}
              </div>
              <div style={{ fontSize: 18 }}>{"⭐".repeat(sub.rating)}</div>
            </div>
          </Card>
        ))}
      </div>
      {showModal && (
        <Modal title="Add Subcontractor" onClose={() => setShowModal(false)}>
          <Input label="Name / Company" value={form.name} onChange={v => f("name", v)} />
          <Select label="Trade" value={form.trade} onChange={v => f("trade", v)} options={["Electrical","Plumbing","Concrete","Drywall","HVAC","Roofing","Insulation","Painting","Flooring","Other"]} />
          <Input label="Phone" value={form.phone} onChange={v => f("phone", v)} />
          <Input label="Email" value={form.email} onChange={v => f("email", v)} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Rating ({form.rating}/5)</label>
            <input type="range" min={1} max={5} value={form.rating} onChange={e => f("rating", e.target.value)} style={{ width: "100%", accentColor: C.gold }} />
          </div>
          <Input label="Notes" value={form.notes} onChange={v => f("notes", v)} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
// ─── CLIENT PORTAL (what clients see when logged in) ──────────────────────────
function ClientPortalView({ job }) {
  if (!job) return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🏗</div>
      <div style={{ color: C.white, fontFamily: font, fontSize: 22, marginBottom: 8 }}>No project assigned</div>
      <div style={{ color: C.muted, fontSize: 14 }}>Contact Evan to be linked to your project.</div>
    </div>
  );
  const photos = ["🏗️ Site prep complete", "🪵 Framing in progress", "🔌 Electrical rough-in", "📐 Drywall stage"];
  const schedule = job.schedule || [];
  const totalDays = Math.max(daysBetween(job.startDate, job.endDate), 1);
  const pct = (date) => Math.max(0, Math.min(100, (daysBetween(job.startDate, date) / totalDays) * 100));
  const width = (start, end) => Math.max(2, (Math.max(1, daysBetween(start, end)) / totalDays) * 100);
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: font, fontSize: 26, color: C.white }}>{job.name}</div>
        <div style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>{job.address}</div>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <StatusBadge label={job.status} />
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, marginBottom: 6 }}>
            <span>Overall Progress</span><span style={{ color: C.gold }}>{job.progress}% Complete</span>
          </div>
          <div style={{ background: C.border, borderRadius: 6, height: 10 }}>
            <div style={{ background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, borderRadius: 6, height: 10, width: `${job.progress}%`, transition: "width 0.5s" }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
          <div style={{ background: C.navyDark, borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Start Date</div>
            <div style={{ color: C.white, fontWeight: 600 }}>{fmtDate(job.startDate)}</div>
          </div>
          <div style={{ background: C.navyDark, borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Est. Completion</div>
            <div style={{ color: C.white, fontWeight: 600 }}>{fmtDate(job.endDate)}</div>
          </div>
        </div>
      </Card>
      {schedule.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: C.white, fontSize: 15, marginBottom: 14 }}>📅 Project Timeline</div>
          <div style={{ position: "relative", background: C.navyDark, borderRadius: 8, padding: "10px 0" }}>
            {schedule.map((phase) => (
              <div key={phase.id} style={{ position: "relative", height: 32, marginBottom: 4 }}>
                <div style={{ position: "absolute", left: pct(phase.startDate) + "%", width: width(phase.startDate, phase.endDate) + "%", top: "50%", transform: "translateY(-50%)", height: 24, background: phase.color + "CC", border: `1px solid ${phase.color}`, borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 8, boxSizing: "border-box", overflow: "hidden", minWidth: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{phase.title}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginTop: 4 }}>
            <span>{fmtDate(job.startDate)}</span><span>{fmtDate(job.endDate)}</span>
          </div>
        </Card>
      )}
      <Card>
        <div style={{ fontWeight: 700, color: C.white, marginBottom: 14 }}>📸 Photo Updates</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
          {photos.map((p, i) => (
            <div key={i} style={{ background: C.navyDark, border: `1px solid ${C.border}`, borderRadius: 10, height: 100, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, color: C.muted, fontSize: 12, textAlign: "center", padding: 8 }}>
              <span style={{ fontSize: 24 }}>{p.split(" ")[0]}</span><span>{p.slice(3)}</span>
            </div>
          ))}
        </div>
      </Card>
      {(job.docs || []).length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, color: C.white, marginBottom: 14 }}>📁 Your Documents</div>
          {job.docs.map((doc, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < job.docs.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 20 }}>📄</span>
              <div><div style={{ color: C.white, fontSize: 13 }}>{doc.name}</div><div style={{ color: C.muted, fontSize: 11 }}>{doc.size} · {fmtDate(doc.date)}</div></div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ─── OWNER CLIENT PORTAL PREVIEW (for Evan) ───────────────────────────────────
function ClientPortal({ jobs }) {
  const [selectedJob, setSelectedJob] = useState(jobs[0]);
  return (
    <div>
      <h1 style={{ fontFamily: font, color: C.white, fontSize: 28, marginBottom: 4 }}>Client Portal Preview</h1>
      <p style={{ color: C.muted, marginBottom: 20, fontSize: 14 }}>This is exactly what your clients see when they log in.</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {jobs.map(j => (
          <button key={j.id} onClick={() => setSelectedJob(j)}
            style={{ padding: "6px 16px", borderRadius: 20, border: `1px solid ${selectedJob?.id === j.id ? C.gold : C.border}`, background: selectedJob?.id === j.id ? C.gold + "22" : "transparent", color: selectedJob?.id === j.id ? C.gold : C.muted, cursor: "pointer", fontFamily: fontBody, fontSize: 13 }}>
            {j.name}
          </button>
        ))}
      </div>
      <ClientPortalView job={selectedJob} />
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV_OWNER = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "jobs", label: "Projects", icon: "🏗" },
  { id: "leads", label: "Pipeline", icon: "🎯" },
  { id: "schedule", label: "Schedule", icon: "📅" },
  { id: "subs", label: "Subtrades", icon: "👷" },
  { id: "client", label: "Client Portal", icon: "👁" },
];
const NAV_CLIENT = [
  { id: "myproject", label: "My Project", icon: "🏗" },
];

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [jobs, setJobs] = useState(initJobs);
  const [leads, setLeads] = useState(initLeads);
  const [subs, setSubs] = useState(initSubs);
  const [events, setEvents] = useState(initEvents);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const unsub = mockAuth.onAuthStateChanged(u => {
      setUser(u);
      setAuthChecked(true);
      if (u?.role === "client") setPage("myproject");
      else if (u?.role === "owner") setPage("dashboard");
    });
    return unsub;
  }, []);

  async function handleLogout() {
    await mockAuth.signOut();
  }

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", background: C.navyDark, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: C.gold, fontFamily: font, fontSize: 20 }}>Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={u => { setUser(u); setPage(u.role === "client" ? "myproject" : "dashboard"); }} />;
  }

  // ── CLIENT VIEW ──
  if (user.role === "client") {
    const clientJob = jobs.find(j => j.id === user.jobId) || null;
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: C.navy, fontFamily: fontBody, color: C.white }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ position: "sticky", top: 0, zIndex: 30, background: C.navyDark, borderBottom: `1px solid ${C.border}`, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏗</div>
              <div>
                <div style={{ fontFamily: font, fontSize: 15, color: C.gold }}>Tall Guy Builds</div>
                <div style={{ fontSize: 11, color: C.muted }}>Client Portal</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: C.muted, fontSize: 13 }}>Hi, {user.name?.split(" ")[0]}</span>
              <Btn variant="ghost" size="sm" onClick={handleLogout}>Sign Out</Btn>
            </div>
          </div>
          <div style={{ maxWidth: 700, margin: "0 auto", padding: "30px 20px", width: "100%" }}>
            <ClientPortalView job={clientJob} />
          </div>
        </div>
      </div>
    );
  }

  // ── OWNER VIEW ──
  const NAV = NAV_OWNER;
  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard jobs={jobs} leads={leads} user={user} />;
      case "jobs": return <Jobs jobs={jobs} setJobs={setJobs} />;
      case "leads": return <Leads leads={leads} setLeads={setLeads} />;
      case "schedule": return <Schedule events={events} setEvents={setEvents} jobs={jobs} />;
      case "subs": return <Subs subs={subs} setSubs={setSubs} />;
      case "client": return <ClientPortal jobs={jobs} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.navy, fontFamily: fontBody, color: C.white }}>
      {navOpen && <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }} />}
      {/* Sidebar */}
      <div style={{ width: 224, background: C.navyDark, borderRight: `1px solid ${C.border}`, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: "100vh", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, transform: navOpen ? "translateX(0)" : "translateX(-224px)", transition: "transform 0.25s ease" }}>
        {/* Sidebar header */}
        <div style={{ padding: "20px 18px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 12px rgba(212,168,83,0.3)" }}>🏗</div>
              <div>
                <div style={{ fontFamily: font, fontSize: 17, color: C.gold, lineHeight: 1.1 }}>Tall Guy</div>
                <div style={{ fontFamily: font, fontSize: 17, color: C.white, lineHeight: 1.1 }}>Builds</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Project Management</div>
          </div>
          <button onClick={() => setNavOpen(false)} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer", padding: "2px 6px" }}>✕</button>
        </div>
        {/* Nav items */}
        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setPage(n.id); setNavOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: page === n.id ? C.gold + "20" : "transparent", color: page === n.id ? C.gold : C.muted, cursor: "pointer", fontFamily: fontBody, fontSize: 14, fontWeight: page === n.id ? 700 : 400, marginBottom: 2, textAlign: "left", transition: "all 0.15s" }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        {/* User footer */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.gold + "22", border: `1px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: C.gold, fontWeight: 700 }}>
              {user.name?.charAt(0) || "E"}
            </div>
            <div>
              <div style={{ fontSize: 13, color: C.white, fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>Owner</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: "100%", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 12px", color: C.muted, cursor: "pointer", fontSize: 12, fontFamily: fontBody, textAlign: "left", transition: "all 0.15s" }}>
            🚪 Sign Out
          </button>
        </div>
      </div>
      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ position: "sticky", top: 0, zIndex: 30, background: C.navyDark, borderBottom: `1px solid ${C.border}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => setNavOpen(true)} style={{ background: "none", border: "none", color: C.white, fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "2px 4px" }}>☰</button>
            <div style={{ fontFamily: font, fontSize: 16, color: C.gold, fontWeight: 700 }}>
              {NAV.find(n => n.id === page)?.icon} {NAV.find(n => n.id === page)?.label}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.gold + "22", border: `1px solid ${C.gold + "66"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.gold, fontWeight: 700 }}>
              {user.name?.charAt(0) || "E"}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1020, margin: "0 auto", padding: "28px 20px", width: "100%" }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
