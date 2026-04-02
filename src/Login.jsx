import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#1f2a37', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', padding: '20px' },
    card: { backgroundColor: '#263445', borderRadius: '12px', padding: '40px 36px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
    logoWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' },
    logo: { width: '90px', height: '90px', borderRadius: '16px', marginBottom: '12px', objectFit: 'cover' },
    brandName: { color: '#ffffff', fontSize: '22px', fontWeight: '700', margin: 0 },
    tagline: { color: '#d1a73a', fontSize: '13px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', margin: '4px 0 0 0' },
    label: { display: 'block', color: '#a0aec0', fontSize: '13px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' },
    input: { width: '100%', padding: '11px 14px', backgroundColor: '#1f2a37', border: '1px solid #3a4a5c', borderRadius: '8px', color: '#ffffff', fontSize: '15px', boxSizing: 'border-box', marginBottom: '18px' },
    button: { width: '100%', padding: '13px', backgroundColor: '#d1a73a', color: '#1f2a37', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '4px' },
    buttonDisabled: { width: '100%', padding: '13px', backgroundColor: '#8a6e25', color: '#1f2a37', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'not-allowed', marginTop: '4px' },
    error: { color: '#fc8181', fontSize: '14px', marginBottom: '14px', backgroundColor: 'rgba(252,129,129,0.1)', padding: '10px 12px', borderRadius: '6px', borderLeft: '3px solid #fc8181' },
    success: { color: '#68d391', fontSize: '15px', textAlign: 'center', backgroundColor: 'rgba(104,211,145,0.1)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #68d391', lineHeight: '1.6' },
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

  useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
                if (data.session) navigate('/dashboard');
        });
  }, [navigate]);

  async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
                const { error: authError } = await supabase.auth.signInWithOtp({
                          email,
                          options: {
                                      emailRedirectTo: 'https://app.tallguybuilds.ca/dashboard',
                          },
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
        <div style={styles.page}>
                <div style={styles.card}>
                          <div style={styles.logoWrap}>
                                      <img src="/tgb-logo.svg" alt="Tall Guy Builds Logo" style={styles.logo} />
                                      <h1 style={styles.brandName}>Tall Guy Builds Inc.</h1>h1>
                                      <p style={styles.tagline}>Client Portal</p>p>
                          </div>div>
                  {sent ? (
                    <div style={styles.success}>
                                  <strong>Check your email!</strong>strong><br />
                                We sent a login link to <strong>{email}</strong>strong>.<br />
                                Click the link to access your project portal.
                    </div>div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                                <label style={styles.label}>Email</label>label>
                                <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required
                                                placeholder="you@example.com"
                                                style={styles.input}
                                              />
                      {error && <div style={styles.error}>{error}</div>div>}
                                <button
                                                type="submit"
                                                disabled={loading}
                                                style={loading ? styles.buttonDisabled : styles.button}
                                              >
                                  {loading ? 'Sending link...' : 'Send Login Link'}
                                </button>button>
                    </form>form>
                        )}
                </div>div>
        </div>div>
      );
}</strong>
