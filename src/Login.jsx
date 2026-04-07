import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const C = {
  bg: '#16212E',
  navyLight: '#243044',
  gold: '#D4A853',
  white: '#FFFFFF',
  muted: '#7B8A9B',
  border: '#263345',
  danger: '#EF4444',
  success: '#34C778',
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px' },
  card: { backgroundColor: C.navyLight, borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '380px', border: `1px solid ${C.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  logoWrap: { textAlign: 'center', marginBottom: '32px' },
  logo: { width: '64px', height: '64px', borderRadius: '12px', marginBottom: '16px', objectFit: 'contain', boxShadow: '0 4px 20px #00000060' },
  brandName: { color: C.white, fontSize: '24px', fontWeight: '700', margin: 0, fontFamily: 'Georgia, serif' },
  tagline: { color: C.gold, fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '6px' },
  sectionTitle: { fontSize: '15px', color: C.white, fontWeight: '700', marginBottom: '20px' },
  label: { display: 'block', color: C.muted, fontSize: '11px', fontWeight: '600', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.08em' },
  input: { width: '100%', padding: '11px 14px', backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.white, fontSize: '15px', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' },
  button: { width: '100%', padding: '13px', backgroundColor: C.gold, color: C.bg, border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '6px' },
  buttonDisabled: { width: '100%', padding: '13px', backgroundColor: '#8a6e25', color: C.bg, border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'not-allowed', marginTop: '6px' },
  error: { color: '#F87171', fontSize: '13px', marginBottom: '14px', backgroundColor: '#7f1d1d33', padding: '10px 14px', borderRadius: '7px', border: '1px solid #ef444444' },
  success: { color: C.success, fontSize: '15px', textAlign: 'center', backgroundColor: 'rgba(52,199,120,0.1)', padding: '16px', borderRadius: '8px', border: `1px solid ${C.success}44`, lineHeight: '1.6' },
  switchLink: { display: 'block', textAlign: 'center', marginTop: '20px', background: 'none', border: 'none', color: C.muted, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' },
};

// ── Admin login (email + password) ──────────────────────────────────────────
function AdminLogin({ onSwitchToClient }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setLoading(false);
  }

  return (
    <div style={styles.card}>
      <div style={styles.sectionTitle}>Admin sign in</div>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={styles.input} />
        <label style={styles.label}>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={styles.input} />
        <button type="submit" disabled={loading} style={loading ? styles.buttonDisabled : styles.button}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <button onClick={onSwitchToClient} style={styles.switchLink}>
        Client? Sign in to your project portal
      </button>
    </div>
  );
}

// ── Client magic-link login ──────────────────────────────────────────────────
function ClientLogin({ onSwitchToAdmin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: 'https://app.tallguybuilds.ca?portal=1' },
      });
      if (authError) throw authError;
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.sectionTitle}>Client Portal</div>
      {sent ? (
        <div style={styles.success}>
          <strong>Check your email!</strong><br />
          We sent a login link to <strong>{email}</strong>.<br />
          Click the link to access your project portal.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={styles.input} />
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} style={loading ? styles.buttonDisabled : styles.button}>
            {loading ? 'Sending link…' : 'Send Login Link'}
          </button>
        </form>
      )}
      <button onClick={onSwitchToAdmin} style={styles.switchLink}>
        ← Back to admin login
      </button>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function Login() {
  const [showClient, setShowClient] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/dashboard');
    });
  }, [navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.logoWrap}>
        <img src="/tgb-logo.svg" alt="Tall Guy Builds Logo" style={styles.logo} />
        <h1 style={styles.brandName}>Tall Guy Builds</h1>
        <p style={styles.tagline}>Built Right. Designed to Last.</p>
      </div>
      {showClient
        ? <ClientLogin onSwitchToAdmin={() => setShowClient(false)} />
        : <AdminLogin onSwitchToClient={() => setShowClient(true)} />
      }
    </div>
  );
}
