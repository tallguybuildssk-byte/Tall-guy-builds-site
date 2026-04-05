import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// âââ Status pill ââââââââââââââââââââââââââââââââââââââââââââââââââ
function Pill({ type, children }) {
  const colours = {
    success: { bg: '#1a3a1a', border: '#2e6b2e', text: '#6fcf6f' },
    error:   { bg: '#3a1a1a', border: '#6b2e2e', text: '#cf6f6f' },
    info:    { bg: '#1a2a3a', border: '#2e4a6b', text: '#6faaef' },
  };
  const c = colours[type] || colours.info;
  return (
    <span style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      borderRadius: 4, fontSize: 11, padding: '2px 8px', fontWeight: 600
    }}>
      {children}
    </span>
  );
}

export default function DeckDesigner() {
  const iframeRef   = useRef(null);
  const [jobs, setJobs]       = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [designs, setDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState('');
  const [designName, setDesignName] = useState('New Design');
  const [ready, setReady]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [status, setStatus]   = useState(null); // { type, msg }
  const pendingSave = useRef(null);

  // â â Load jobs on mount âââââââââââââââââââââââââââââââââââââââââââââââ
  useEffect(() => {
    supabase.from('jobs').select('id, title').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setJobs(data);
      });
  }, []);

  // â â Load designs for selected job âââââââââââââââââââââââââââââââââââââââââââââ
  useEffect(() => {
    if (!selectedJob) { setDesigns([]); setSelectedDesign(''); return; }
    supabase.from('deck_designs')
      .select('id, name, design_json, updated_at')
      .eq('job_id', selectedJob)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setDesigns(data);
          setSelectedDesign(data[0]?.id || '');
        }
      });
  }, [selectedJob]);

  // â â Listen for messages from deck-designer iframe âââââââââââââââââââââââââââââ
  useEffect(() => {
    const handler = e => {
      if (!e.data?.type) return;
      if (e.data.type === 'DECK_DESIGNER_READY') setReady(true);
      if (e.data.type === 'DESIGN_STATE' && pendingSave.current) {
        pendingSave.current(e.data.state);
        pendingSave.current = null;
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // â â Load design into iframe when selection changes âââââââââââââââââââââââââââ
  useEffect(() => {
    if (!ready || !selectedDesign) return;
    const d = designs.find(x => x.id === selectedDesign);
    if (!d) return;
    setDesignName(d.name);
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'LOAD_DESIGN', state: d.design_json },
      '*'
    );
  }, [selectedDesign, ready]);

  // â â Save current design to Supabase âââââââââââââââââââââââââââââââ
  const handleSave = useCallback(() => {
    if (!ready || !selectedJob) {
      setStatus({ type: 'error', msg: 'Select a job first' });
      return;
    }
    setSaving(true);
    setStatus(null);

    // Ask iframe for its current state
    pendingSave.current = async (state) => {
      try {
        if (selectedDesign) {
          // Update existing
          const { error } = await supabase.from('deck_designs')
            .update({ name: designName, design_json: state })
            .eq('id', selectedDesign);
          if (error) throw error;
          setStatus({ type: 'success', msg: 'Design saved!' });
        } else {
          // Create new
          const { data, error } = await supabase.from('deck_designs')
            .insert({ job_id: selectedJob, name: designName, design_json: state })
            .select().single();
          if (error) throw error;
          setDesigns(prev => [data, ...prev]);
          setSelectedDesign(data.id);
          setStatus({ type: 'success', msg: 'Design created!' });
        }
      } catch (err) {
        setStatus({ type: 'error', msg: err.message });
      } finally {
        setSaving(false);
      }
    };

    iframeRef.current?.contentWindow?.postMessage({ type: 'GET_STATE' }, '*');
    // Fallback timeout if iframe doesn't respond
    setTimeout(() => {
      if (pendingSave.current) {
        pendingSave.current = null;
        setSaving(false);
        setStatus({ type: 'error', msg: 'Designer not responding â try again' });
      }
    }, 5000);
  }, [ready, selectedJob, selectedDesign, designName]);

  // â â New blank design ââââââââââââââââââââââââââââââââââââââââââââââ
  const handleNew = () => {
    setSelectedDesign('');
    setDesignName('New Design');
    iframeRef.current?.contentWindow?.postMessage({ type: 'LOAD_DESIGN', state: null }, '*');
  };

  // â â Delete design âââââââââââââââââââââââââââââââââââââââââââââââââââ
  const handleDelete = async () => {
    if (!selectedDesign) return;
    if (!window.confirm('Delete this design?')) return;
    const { error } = await supabase.from('deck_designs').delete().eq('id', selectedDesign);
    if (!error) {
      const remaining = designs.filter(d => d.id !== selectedDesign);
      setDesigns(remaining);
      setSelectedDesign(remaining[0]?.id || '');
      if (!remaining[0]) handleNew();
    }
  };

  // â â Toolbar styles âââââââââââââââââââââââââââââââââââââââââââââ
const bar   = { background: '#1F2A37', borderBottom: '1px solid #2e3a48', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' };
  const label = { color: '#8a96a8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' };
  const sel   = { background: '#253040', border: '1px solid #3a4a5a', borderRadius: 4, color: '#d0dce8', fontSize: 12, padding: '4px 8px', cursor: 'pointer' };
  const inp   = { ...sel, outline: 'none', width: 160 };
  const btn   = (accent) => ({ background: accent || '#253040', border: `1px solid ${accent || '#3a4a5a'}`, borderRadius: 4, color: accent ? '#000' : '#c0c8d4', fontSize: 11, fontWeight: 700, padding: '4px 12px', cursor: 'pointer', opacity: saving ? 0.6 : 1 });

  const jobName = jobs.find(j => j.id === selectedJob)?.title || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#111418' }}>
      {/* â ââ Toolbar ââ */}
      <div style={bar}>
        <span style={label}>Job</span>
        <select style={sel} value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
          <option value=''>Select a job</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>

        {selectedJob && (
          <>
            <span style={{...label, marginLeft: 4}}>Design</span>
            <select style={sel} value={selectedDesign} onChange={e => setSelectedDesign(e.target.value)}>
              <option value=''>â New design â</option>
              {designs.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <input
              style={inp}
              value={designName}
              onChange={e => setDesignName(e.target.value)}
              placeholder='Design nameâ¦'
            />

            <button style={btn('#C8A96A')} onClick={handleSave} disabled={saving}>
              {saving ? 'Savingâ¦' : 'ð¾ Save'}
            </button>

            <button style={btn()} onClick={handleNew}>+ New</button>

            {selectedDesign && (
              <button
                style={{...btn(), color: '#e06060', borderColor: '#6b2e2e'}}
                onClick={handleDelete}
              >
                ð Delete
              </button>
            )}
          </>
        )}

        <div style={{ flex: 1 }} />

        {!ready && <Pill type='info' >Loading designerâ¦</Pill>}
        {status && <Pill type={status.type}>{status.msg}</Pill>}
        {jobName && ready && !status && (
          <Pill type='info'>ð {jobName}</Pill>
        )}
      </div>

      {/* â ââ Deck Designer iframe ââ */}
      <iframe
        ref={iframeRef}
        src='/admin-assets/deck-designer.html'
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, border: 'none' }}
        title='Deck Designer'
      />
    </div>
  );
}

