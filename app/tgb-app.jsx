import { useState, useEffect } from "react";

const C = {
  navy:    "#1F2A37",
  navyLight: "#2C3E50",
  gold:    "#C8A96A",
  goldDim: "#A8894A",
  cream:   "#F5F0E8",
  muted:   "#6B7280",
  border:  "#2E3D4F",
  success: "#4CAF50",
  warn:    "#F59E0B",
  danger:  "#EF4444",
  white:   "#FFFFFF",
};

const font = "'DM Serif Display', serif";
const fontBody = "'DM Sans', sans-serif";

const initLeads = [
  { id: 1, name: "Mike Thornton", phone: "306-555-0192", type: "Deck", value: 18500, stage: "New", notes: "Referred by Sarah H.", date: "2026-02-15" },
  { id: 2, name: "Carla Jensen", phone: "306-555-0344", type: "Basement", value: 45000, stage: "Quoted", notes: "Looking to start April", date: "2026-02-10" },
  { id: 3, name: "Dave Kowalski", phone: "306-555-0771", type: "Garage", value: 32000, stage: "Follow-up", notes: "Seen 3 other builders", date: "2026-02-08" },
  { id: 4, name: "Priya Sharma", phone: "306-555-0420", type: "Bathroom", value: 12000, stage: "Won", notes: "Start Mar 3", date: "2026-01-28" },
];

const initJobs = [
  { id: 1, name: "Addison Basement Dev", client: "Priya Sharma", address: "3518 Green Creek Rd", type: "Basement Development", status: "Active", value: 12000, paid: 6000, startDate: "2026-03-03", endDate: "2026-04-15", progress: 35, notes: "Framing phase underway", docs: [{ name: "Approved Estimate - Addison.pdf", size: "142 KB", date: "2026-01-15", type: "pdf" }, { name: "Signed Contract.pdf", size: "88 KB", date: "2026-01-20", type: "pdf" }] },
  { id: 2, name: "Kowalski Garage", client: "Dave Kowalski", address: "742 Henderson Dr", type: "Garage", status: "Upcoming", value: 32000, paid: 9600, startDate: "2026-04-20", endDate: "2026-06-30", progress: 0, notes: "Permit submitted", docs: [{ name: "Approved Estimate - Kowalski.pdf", size: "98 KB", date: "2026-02-01", type: "pdf" }] },
  { id: 3, name: "Wilson Deck Replacement", client: "Brian Wilson", address: "88 Lakeview Cres", type: "Deck", status: "Completed", value: 14200, paid: 14200, startDate: "2025-09-01", endDate: "2025-10-10", progress: 100, notes: "Holdback released", docs: [] },
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
  { id: 3, title: "Thornton – Quote Walkthrough", job: "Lead", date: "2026-02-28", time: "11:00", type: "quote", color: "#60A5FA" },
  { id: 4, title: "Rick – Electrical Rough-in Starts", job: "Addison Basement Dev", date: "2026-03-05", time: "08:00", type: "sub", color: C.success },
  { id: 5, title: "Kowalski Garage Start", job: "Kowalski Garage", date: "2026-04-20", time: "08:00", type: "site", color: C.gold },
];

const LEAD_STAGES = ["New", "Quoted", "Follow-up", "Won", "Lost"];
const JOB_STATUSES = ["Upcoming", "Active", "Completed", "On Hold"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const fmt$ = v => `$${Number(v).toLocaleString()}`;
const fmtDate = d => d ? new Date(d + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "—";

function StatusBadge({ label }) {
  const colors = {
    "Active": { bg: "#14532d22", text: "#4ade80" },
    "Upcoming": { bg: "#1e3a5f22", text: "#60A5FA" },
    "Completed": { bg: "#1c1c1c", text: C.muted },
    "On Hold": { bg: "#7c2d1222", text: "#FB923C" },
    "Won": { bg: "#14532d22", text: "#4ade80" },
    "Lost": { bg: "#7f1d1d22", text: "#F87171" },
    "New": { bg: "#1e3a5f22", text: "#60A5FA" },
    "Quoted": { bg: "#78350f22", text: C.gold },
    "Follow-up": { bg: "#581c8722", text: "#C084FC" },
  };
  const c = colors[label] || { bg: "#1c1c1c", text: C.muted };
  return <span style={{ background: c.bg, color: c.text, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{label}</span>;
}

function Card({ children, style = {}, onClick }) {
  return <div onClick={onClick} style={{ background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, ...(onClick ? { cursor: "pointer" } : {}), ...style }}>{children}</div>;
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: C.navy, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 12px", color: C.white, fontSize: 14, fontFamily: fontBody, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: C.navy, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 12px", color: C.white, fontSize: 14, fontFamily: fontBody, outline: "none", boxSizing: "border-box" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", style = {} }) {
  const base = { cursor: "pointer", borderRadius: 6, fontFamily: fontBody, fontWeight: 600, border: "none", transition: "all 0.15s" };
  const variants = {
    primary: { background: C.gold, color: C.navy },
    ghost: { background: "transparent", color: C.gold, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.danger, border: `1px solid ${C.border}` },
  };
  const sizes = { sm: { padding: "5px 12px", fontSize: 12 }, md: { padding: "8px 18px", fontSize: 14 }, lg: { padding: "11px 28px", fontSize: 15 } };
  return <button onClick={onClick} style={{ ...base, ...variants[variant], ...sizes[size], ...style }}>{children}</button>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: C.white, fontFamily: font, fontSize: 22 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ jobs, leads }) {
  const activeJobs = jobs.filter(j => j.status === "Active");
  const pipelineValue = leads.filter(l => !["Won","Lost"].includes(l.stage)).reduce((s, l) => s + l.value, 0);
  const outstanding = jobs.reduce((s, j) => s + (j.value - j.paid), 0);
  const wonValue = leads.filter(l => l.stage === "Won").reduce((s, l) => s + l.value, 0);

  return (
    <div>
      <h1 style={{ fontFamily: font, color: C.white, fontSize: 30, marginBottom: 4 }}>Good morning, Evan.</h1>
      <p style={{ color: C.muted, marginBottom: 28, fontSize: 15 }}>Here's where things stand today.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Active Jobs", value: activeJobs.length, sub: "in progress", color: C.gold },
          { label: "Pipeline Value", value: fmt$(pipelineValue), sub: "open leads", color: "#60A5FA" },
          { label: "Outstanding", value: fmt$(outstanding), sub: "receivable", color: C.warn },
          { label: "Won This Month", value: fmt$(wonValue), sub: "closed", color: "#4ade80" },
        ].map(k => (
          <Card key={k.label}>
            <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontFamily: font, color: k.color, marginBottom: 2 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{k.sub}</div>
          </Card>
        ))}
      </div>
      <h2 style={{ fontFamily: font, color: C.white, fontSize: 20, marginBottom: 14 }}>Active Projects</h2>
      <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
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
                <span>Progress</span><span>{job.progress}%</span>
              </div>
              <div style={{ background: C.border, borderRadius: 4, height: 6 }}>
                <div style={{ background: C.gold, borderRadius: 4, height: 6, width: `${job.progress}%`, transition: "width 0.5s" }} />
              </div>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 20, fontSize: 13, color: C.muted }}>
              <span>Contract: <b style={{ color: C.white }}>{fmt$(job.value)}</b></span>
              <span>Received: <b style={{ color: "#4ade80" }}>{fmt$(job.paid)}</b></span>
              <span>Owing: <b style={{ color: C.warn }}>{fmt$(job.value - job.paid)}</b></span>
            </div>
          </Card>
        ))}
      </div>
      <h2 style={{ fontFamily: font, color: C.white, fontSize: 20, marginBottom: 14 }}>Recent Leads</h2>
      <Card>
        {leads.slice(0, 4).map((l, i) => (
          <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none", flexWrap: "wrap", gap: 8 }}>
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

// ─── JOBS (with doc upload) ───────────────────────────────────────────────────
function Jobs({ jobs, setJobs }) {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailJob, setDetailJob] = useState(null);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({});
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = filter === "All" ? jobs : jobs.filter(j => j.status === filter);

  function openNew() { setForm({ name: "", client: "", address: "", type: "Deck", status: "Upcoming", value: "", paid: 0, startDate: "", endDate: "", progress: 0, notes: "", docs: [] }); setSelected(null); setShowModal(true); }
  function openEdit(job) { setForm({ ...job }); setSelected(job); setShowModal(true); }

  function save() {
    const updated = { ...form, value: +form.value, paid: +form.paid, progress: +form.progress, docs: form.docs || [] };
    if (selected) setJobs(js => js.map(j => j.id === selected.id ? { ...updated, id: j.id } : j));
    else setJobs(js => [...js, { ...updated, id: Date.now() }]);
    setShowModal(false);
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

  // Detail view
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
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <StatusBadge label={job.status} />
            <Btn size="sm" variant="ghost" onClick={() => { openEdit(job); }}>Edit</Btn>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Contract", value: fmt$(job.value), color: C.white },
            { label: "Received", value: fmt$(job.paid), color: "#4ade80" },
            { label: "Outstanding", value: fmt$(job.value - job.paid), color: C.warn },
          ].map(k => (
            <Card key={k.label} style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontFamily: font, fontSize: 20, color: k.color }}>{k.value}</div>
            </Card>
          ))}
        </div>

        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, marginBottom: 8 }}>
            <span>Progress</span><span style={{ color: C.gold }}>{job.progress}%</span>
          </div>
          <div style={{ background: C.border, borderRadius: 6, height: 8 }}>
            <div style={{ background: job.progress === 100 ? "#4ade80" : C.gold, borderRadius: 6, height: 8, width: `${job.progress}%`, transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 13, color: C.muted }}>
            <span>Start: <b style={{ color: C.white }}>{fmtDate(job.startDate)}</b></span>
            <span>End: <b style={{ color: C.white }}>{fmtDate(job.endDate)}</b></span>
          </div>
          {job.notes && <div style={{ marginTop: 10, color: C.muted, fontSize: 13 }}>📝 {job.notes}</div>}
        </Card>

        {/* Document Upload */}
        <Card>
          <div style={{ fontWeight: 700, color: C.white, fontSize: 15, marginBottom: 14 }}>📁 Project Documents</div>

          {/* Drop zone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleFileDrop}
            style={{ border: `2px dashed ${C.border}`, borderRadius: 8, padding: "24px 16px", textAlign: "center", marginBottom: 14, transition: "border-color 0.2s" }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
            <div style={{ color: C.muted, fontSize: 14, marginBottom: 8 }}>Drag & drop files here, or</div>
            <label style={{ cursor: "pointer" }}>
              <span style={{ background: C.gold, color: C.navy, padding: "6px 16px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>Browse Files</span>
              <input type="file" multiple style={{ display: "none" }} onChange={handleFileDrop} accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx" />
            </label>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>PDF, images, Word, Excel</div>
          </div>

          {/* Existing docs */}
          {(job.docs || []).length === 0 ? (
            <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "10px 0" }}>No documents yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {(job.docs || []).map((doc, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.navy, borderRadius: 8, padding: "10px 14px" }}>
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
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Progress ({form.progress || 0}%)</label>
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: font, color: C.white, fontSize: 28, margin: 0 }}>Projects</h1>
        <Btn onClick={openNew}>+ New Project</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["All", ...JOB_STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${filter === s ? C.gold : C.border}`, background: filter === s ? C.gold + "22" : "transparent", color: filter === s ? C.gold : C.muted, cursor: "pointer", fontSize: 13, fontFamily: fontBody }}>
            {s}
          </button>
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
                {(job.docs || []).length > 0 && <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>📁 {job.docs.length} document{job.docs.length !== 1 ? "s" : ""}</div>}
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
                  <div style={{ background: job.progress === 100 ? "#4ade80" : C.gold, borderRadius: 4, height: 5, width: `${job.progress}%` }} />
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
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Progress ({form.progress || 0}%)</label>
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

// ─── LEADS / CRM ──────────────────────────────────────────────────────────────
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
                <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stage}</div>
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

// ─── MONTHLY CALENDAR ─────────────────────────────────────────────────────────
function Schedule({ events, setEvents, jobs }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", job: "", date: "", time: "09:00", type: "site" });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const typeColors = { inspection: C.warn, site: C.gold, quote: "#60A5FA", sub: C.success, other: C.muted };

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
    setForm({ title: "", job: "", date: selectedDay || "", time: "09:00", type: "site" });
  }

  function openAddForDay(d) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    setForm({ title: "", job: "", date: dateStr, time: "09:00", type: "site" });
    setShowModal(true);
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  // Build grid cells
  const cells = [];
  // Prev month days
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, current: false });
  // Current month
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  // Next month fill
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false });

  const selectedDayEvents = selectedDay ? eventsOnDay(selectedDay) : [];

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

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        {[["inspection", "Inspection"], ["site", "Site Visit"], ["quote", "Quote"], ["sub", "Subtrade"], ["other", "Other"]].map(([type, label]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.muted }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: typeColors[type] }} />
            {label}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${C.border}` }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{d}</div>
          ))}
        </div>

        {/* Weeks */}
        {Array.from({ length: 6 }, (_, week) => (
          <div key={week} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: week < 5 ? `1px solid ${C.border}` : "none" }}>
            {cells.slice(week * 7, week * 7 + 7).map((cell, idx) => {
              const dayEvents = cell.current ? eventsOnDay(cell.day) : [];
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(cell.day).padStart(2,"0")}`;
              const isToday = cell.current && dateStr === todayStr;
              const isSelected = cell.current && selectedDay === cell.day;

              return (
                <div
                  key={idx}
                  onClick={() => { if (cell.current) setSelectedDay(selectedDay === cell.day ? null : cell.day); }}
                  style={{
                    minHeight: 90,
                    padding: "8px 6px",
                    borderRight: idx < 6 ? `1px solid ${C.border}` : "none",
                    background: isSelected ? C.gold + "11" : "transparent",
                    cursor: cell.current ? "pointer" : "default",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: isToday ? C.gold : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: isToday || isSelected ? 700 : 400,
                    color: isToday ? C.navy : cell.current ? C.white : C.border,
                  }}>
                    {cell.day}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <div key={i} style={{ background: ev.color + "33", borderLeft: `2px solid ${ev.color}`, borderRadius: "0 3px 3px 0", padding: "1px 4px", fontSize: 10, color: ev.color, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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

      {/* Selected day detail */}
      {selectedDay && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: font, fontSize: 18, color: C.white }}>
              {MONTHS[viewMonth]} {selectedDay}, {viewYear}
            </div>
            <Btn size="sm" onClick={() => openAddForDay(selectedDay)}>+ Add</Btn>
          </div>
          {selectedDayEvents.length === 0 ? (
            <div style={{ color: C.muted, fontSize: 14 }}>Nothing scheduled. Click + Add to create an event.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {selectedDayEvents.map(ev => (
                <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 12, background: C.navy, borderRadius: 8, padding: "10px 14px" }}>
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

// ─── SUBCONTRACTORS ───────────────────────────────────────────────────────────
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
              <div style={{ fontSize: 20 }}>{"⭐".repeat(sub.rating)}</div>
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
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rating ({form.rating}/5)</label>
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

// ─── CLIENT PORTAL ────────────────────────────────────────────────────────────
function ClientPortal({ jobs }) {
  const [selectedJob, setSelectedJob] = useState(jobs[0]);
  const photos = ["🏗️ Site prep complete", "🪵 Framing in progress", "🔌 Electrical rough-in", "📐 Drywall stage"];

  return (
    <div>
      <h1 style={{ fontFamily: font, color: C.white, fontSize: 28, marginBottom: 4 }}>Client Portal Preview</h1>
      <p style={{ color: C.muted, marginBottom: 20, fontSize: 14 }}>This is what your clients see when you share their project link.</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {jobs.map(j => (
          <button key={j.id} onClick={() => setSelectedJob(j)} style={{ padding: "6px 16px", borderRadius: 20, border: `1px solid ${selectedJob?.id === j.id ? C.gold : C.border}`, background: selectedJob?.id === j.id ? C.gold + "22" : "transparent", color: selectedJob?.id === j.id ? C.gold : C.muted, cursor: "pointer", fontFamily: fontBody, fontSize: 13 }}>
            {j.name}
          </button>
        ))}
      </div>
      {selectedJob && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: font, fontSize: 22, color: C.white }}>{selectedJob.name}</div>
                <div style={{ color: C.muted, fontSize: 14 }}>{selectedJob.address}</div>
              </div>
              <StatusBadge label={selectedJob.status} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, marginBottom: 6 }}>
                <span>Overall Progress</span><span style={{ color: C.gold }}>{selectedJob.progress}% Complete</span>
              </div>
              <div style={{ background: C.border, borderRadius: 6, height: 10 }}>
                <div style={{ background: C.gold, borderRadius: 6, height: 10, width: `${selectedJob.progress}%`, transition: "width 0.5s" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
              <div style={{ background: C.navy, borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Start Date</div>
                <div style={{ color: C.white, fontWeight: 600 }}>{fmtDate(selectedJob.startDate)}</div>
              </div>
              <div style={{ background: C.navy, borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Est. Completion</div>
                <div style={{ color: C.white, fontWeight: 600 }}>{fmtDate(selectedJob.endDate)}</div>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: C.white, marginBottom: 14 }}>📸 Photo Updates</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {photos.map((p, i) => (
                <div key={i} style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, height: 100, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, color: C.muted, fontSize: 12, textAlign: "center", padding: 8 }}>
                  <span style={{ fontSize: 24 }}>{p.split(" ")[0]}</span>
                  <span>{p.slice(3)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "jobs", label: "Projects", icon: "🏗" },
  { id: "leads", label: "Pipeline", icon: "🎯" },
  { id: "schedule", label: "Schedule", icon: "📅" },
  { id: "subs", label: "Subtrades", icon: "👷" },
  { id: "client", label: "Client Portal", icon: "👁" },
];

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [jobs, setJobs] = useState(initJobs);
  const [leads, setLeads] = useState(initLeads);
  const [subs, setSubs] = useState(initSubs);
  const [events, setEvents] = useState(initEvents);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard jobs={jobs} leads={leads} />;
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
      <div style={{ width: 220, background: "#16212E", borderRight: `1px solid ${C.border}`, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ padding: "22px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: font, fontSize: 20, color: C.gold, lineHeight: 1.1 }}>Tall Guy</div>
          <div style={{ fontFamily: font, fontSize: 20, color: C.white, lineHeight: 1.1 }}>Builds</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4, letterSpacing: "0.06em" }}>PROJECT MANAGEMENT</div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "9px 12px", borderRadius: 7, border: "none", background: page === n.id ? C.gold + "20" : "transparent", color: page === n.id ? C.gold : C.muted, cursor: "pointer", fontFamily: fontBody, fontSize: 14, fontWeight: page === n.id ? 700 : 400, marginBottom: 2, textAlign: "left", transition: "all 0.15s" }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>Built Right. Designed to Last.</div>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "30px 24px" }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
