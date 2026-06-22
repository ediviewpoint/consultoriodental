import { useState } from 'react';
import { Icons } from './icons';
import { supabase } from '../lib/supabase';

const SetPassword = ({ onDone }) => {
  const [pass,    setPass]    = useState('');
  const [confirm, setConfirm] = useState('');
  const [showP1,  setShowP1]  = useState(false);
  const [showP2,  setShowP2]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pass.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (pass !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.updateUser({ password: pass });
    if (err) {
      setError('Error al guardar la contraseña. Intenta de nuevo.');
      setLoading(false);
      return;
    }
    setDone(true);
    setTimeout(onDone, 2200);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(145deg, #F0FDFA 0%, #F8FAFC 55%, #EFF6FF 100%)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 70, height: 70, borderRadius: 20,
            background: 'var(--dc-primary)', color: '#fff',
            marginBottom: 14, boxShadow: '0 8px 28px rgba(13,148,136,0.28)',
          }}>
            <Icons.Tooth size={36} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--dc-fg-1)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>
            DentalCare Pro
          </h1>
          <p style={{ fontSize: 13, color: 'var(--dc-fg-3)', margin: 0 }}>Sistema de gestión clínica</p>
        </div>

        {done ? (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '40px 32px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.08)', textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#F0FDFA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
            }}>
              <Icons.CheckCircle size={32} style={{ color: 'var(--dc-primary)' }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#134E4A', marginBottom: 8 }}>
              ¡Contraseña establecida!
            </div>
            <p style={{ fontSize: 13, color: 'var(--dc-fg-3)', margin: 0 }}>
              Ingresando al sistema…
            </p>
          </div>
        ) : (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '32px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
          }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: 'var(--dc-fg-1)' }}>
              Establecer contraseña
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--dc-fg-3)', lineHeight: 1.5 }}>
              Elige una contraseña para acceder al sistema con tu cuenta de doctor.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--dc-fg-2)', display: 'block', marginBottom: 6 }}>
                  Nueva contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showP1 ? 'text' : 'password'}
                    value={pass}
                    onChange={e => { setPass(e.target.value); setError(''); }}
                    placeholder="Mínimo 8 caracteres"
                    autoFocus
                    style={{ paddingRight: 40 }}
                  />
                  <button type="button" onClick={() => setShowP1(p => !p)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dc-fg-3)', display: 'flex', padding: 4 }}>
                    {showP1 ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--dc-fg-2)', display: 'block', marginBottom: 6 }}>
                  Confirmar contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showP2 ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError(''); }}
                    placeholder="Repetí la contraseña"
                    style={{ paddingRight: 40 }}
                  />
                  <button type="button" onClick={() => setShowP2(p => !p)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dc-fg-3)', display: 'flex', padding: 4 }}>
                    {showP2 ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#DC2626', padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !pass || !confirm}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
                  background: loading ? 'var(--dc-fg-4)' : 'var(--dc-primary)',
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                  marginTop: 4,
                }}
              >
                {loading ? 'Guardando…' : 'Establecer contraseña y entrar'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetPassword;
