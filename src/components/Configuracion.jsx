import { useState, useEffect } from 'react';
import DC_DATA from './data';
import { Icons } from './icons';
import { Button, Card, CardHead, Tabs, Field, fmtBs } from './ui';
import { getCatalogo, saveCatalogo, saveDocorComision, getPerfiles, updatePerfil, sendPasswordReset } from '../lib/db';

// ── Tab: Catálogo de precios ──────────────────────────────────────────────────
const TabCatalogo = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    getCatalogo()
      .then(setCatalog)
      .catch(() => setCatalog(DC_DATA.TREATMENT_CATALOG.map(t => ({ ...t }))))
      .finally(() => setLoading(false));
  }, []);

  const upd = (idx, key, val) =>
    setCatalog(prev => prev.map((t, i) => i === idx ? { ...t, [key]: Math.max(0, Number(val) || 0) } : t));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveCatalogo(catalog);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Catálogo de precios</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--dc-fg-3)' }}>Base comisionable = Precio − Material</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dc-positive)' }}>✓ Guardado</span>}
          <Button icon={Icons.Check} onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 13 }}>Cargando catálogo…</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Tratamiento</th>
              <th>Categoría</th>
              <th style={{ textAlign: 'right', width: 130 }}>Precio (Bs.)</th>
              <th style={{ textAlign: 'right', width: 130 }}>Material (Bs.)</th>
              <th style={{ textAlign: 'right', width: 150 }}>Base comisionable</th>
            </tr>
          </thead>
          <tbody>
            {catalog.map((t, i) => {
              const base = t.precio - t.material;
              return (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500 }}>{t.tratamiento}</td>
                  <td><span className="tag">{t.categoria}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={t.precio}
                      onChange={e => upd(i, 'precio', e.target.value)}
                      style={{ width: 90, textAlign: 'right', padding: '4px 8px', fontSize: 13 }}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={t.material}
                      onChange={e => upd(i, 'material', e.target.value)}
                      style={{ width: 90, textAlign: 'right', padding: '4px 8px', fontSize: 13 }}
                    />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--dc-primary)', fontFamily: 'var(--dc-font-mono)' }}>
                    {fmtBs(base)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ── Tab: Doctores y comisiones ───────────────────────────────────────────────
const TabDoctores = ({ doctors: doctorsProp = [] }) => {
  const [doctors, setDoctors] = useState(
    doctorsProp.map(d => ({ ...d, pct: Math.round(d.comision * 100) }))
  );
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDoctors(doctorsProp.map(d => ({ ...d, pct: Math.round(d.comision * 100) })));
  }, [doctorsProp]); // eslint-disable-line react-hooks/exhaustive-deps

  const updPct = (id, pct) => setDoctors(prev => prev.map(d => d.id === id ? { ...d, pct } : d));

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(doctors.map(d => saveDocorComision(d.id, d.pct / 100)));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const EJ_BASE = 530;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Doctores y comisiones</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--dc-fg-3)' }}>
            % aplicado sobre la base comisionable (precio − material)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dc-positive)' }}>✓ Guardado</span>}
          <Button icon={Icons.Check} onClick={handleSave} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 13 }}>Cargando doctores…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {doctors.map(d => (
            <Card key={d.id} pad="lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${d.color}22`, color: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                  {d.short}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--dc-fg-3)' }}>Suc. {d.consultorio}</div>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Comisión</span>
                  <span style={{ fontSize: 26, fontWeight: 800, color: d.color, fontFamily: 'var(--dc-font-mono)' }}>{d.pct}%</span>
                </div>
                <input
                  type="range" min="0" max="60" step="1" value={d.pct}
                  onChange={e => updPct(d.id, Number(e.target.value))}
                  style={{ width: '100%', accentColor: d.color }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--dc-fg-4)', marginTop: 2 }}>
                  <span>0%</span><span>30%</span><span>60%</span>
                </div>
              </div>

              <div style={{ background: 'var(--dc-slate-50)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--dc-fg-2)' }}>
                Ejemplo · Endodoncia Bs. 650 − mat. Bs. 120 = base Bs. {EJ_BASE} →{' '}
                <strong style={{ color: d.color }}>Bs. {Math.round(EJ_BASE * d.pct / 100)}</strong>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Tab: Sucursales ──────────────────────────────────────────────────────────
const TabSucursales = ({ sucursales: sucProp, onSaveSucursales }) => {
  const initSuc = sucProp || DC_DATA.CLINIC.sucursales;
  const [sucursales, setSucursales] = useState({ A: { ...initSuc.A }, B: { ...initSuc.B } });
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const upd = (k, field, val) => setSucursales(prev => ({ ...prev, [k]: { ...prev[k], [field]: val } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveSucursales?.(sucursales);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Datos de sucursales</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dc-positive)' }}>✓ Guardado</span>}
          <Button icon={Icons.Check} onClick={handleSave} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {['A', 'B'].map(k => {
          const s = sucursales[k] || {};
          return (
            <Card key={k} pad="lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--dc-teal-50)', color: 'var(--dc-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                  {k}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Sucursal {k}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Field label="Nombre comercial">
                  <input className="input" value={s.nombre || ''} onChange={e => upd(k, 'nombre', e.target.value)} />
                </Field>
                <Field label="Dirección">
                  <input className="input" value={s.dir || ''} onChange={e => upd(k, 'dir', e.target.value)} />
                </Field>
                <Field label="Ciudad">
                  <input className="input" value={s.ciudad || ''} onChange={e => upd(k, 'ciudad', e.target.value)} />
                </Field>
                <Field label="Teléfono">
                  <input className="input" value={s.tel || ''} onChange={e => upd(k, 'tel', e.target.value)} style={{ fontFamily: 'var(--dc-font-mono)' }} />
                </Field>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ── Tab: Usuarios del sistema ─────────────────────────────────────────────────
const TabUsuarios = ({ doctors = [] }) => {
  const [perfiles, setPerfiles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [resetEmail,  setResetEmail]  = useState('');
  const [resetStatus, setResetStatus] = useState('');

  useEffect(() => {
    getPerfiles()
      .then(setPerfiles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updPerfil = (id, key, val) =>
    setPerfiles(prev => prev.map(p => p.id === id ? { ...p, [key]: val } : p));

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(perfiles.map(p =>
        updatePerfil(p.id, { rol: p.rol, doctor_id: p.rol === 'doctor' ? p.doctor_id : null })
      ));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!resetEmail.trim()) return;
    try {
      await sendPasswordReset(resetEmail.trim());
      setResetStatus('ok');
      setResetEmail('');
    } catch {
      setResetStatus('err');
    }
    setTimeout(() => setResetStatus(''), 4000);
  };

  const ROL_LABEL = { admin: 'Administrador', recepcion: 'Recepción', doctor: 'Doctor' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Usuarios del sistema</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--dc-fg-3)' }}>
            Para crear nuevas cuentas use el panel de Supabase → Authentication.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dc-positive)' }}>✓ Guardado</span>}
          <Button icon={Icons.Check} onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 13 }}>Cargando usuarios…</div>
      ) : perfiles.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 13 }}>No hay usuarios registrados.</div>
      ) : (
        <table className="table" style={{ marginBottom: 28 }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Doctor vinculado</th>
            </tr>
          </thead>
          <tbody>
            {perfiles.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                <td>
                  <select
                    className="select"
                    value={p.rol}
                    onChange={e => updPerfil(p.id, 'rol', e.target.value)}
                    style={{ fontSize: 13, padding: '4px 10px', minWidth: 140 }}
                  >
                    {Object.entries(ROL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
                <td>
                  <select
                    className="select"
                    value={p.doctor_id || ''}
                    onChange={e => updPerfil(p.id, 'doctor_id', e.target.value || null)}
                    disabled={p.rol !== 'doctor'}
                    style={{ fontSize: 13, padding: '4px 10px', minWidth: 180, opacity: p.rol !== 'doctor' ? 0.4 : 1 }}
                  >
                    <option value="">— Ninguno —</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ borderTop: '1px solid var(--dc-border)', paddingTop: 22 }}>
        <h4 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600 }}>Restablecer contraseña</h4>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--dc-fg-3)' }}>
          Envía un enlace de restablecimiento al correo del usuario.
        </p>
        <div style={{ display: 'flex', gap: 10, maxWidth: 440 }}>
          <input
            className="input"
            type="email"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleReset()}
            placeholder="correo@ejemplo.com"
            style={{ flex: 1 }}
          />
          <Button variant="secondary" onClick={handleReset} disabled={!resetEmail.trim()}>
            Enviar reset
          </Button>
        </div>
        {resetStatus === 'ok' && (
          <p style={{ fontSize: 13, color: 'var(--dc-positive)', marginTop: 8, fontWeight: 600 }}>
            ✓ Email de restablecimiento enviado.
          </p>
        )}
        {resetStatus === 'err' && (
          <p style={{ fontSize: 13, color: 'var(--dc-alert)', marginTop: 8, fontWeight: 600 }}>
            Error al enviar. Verifica la dirección de correo.
          </p>
        )}
      </div>
    </div>
  );
};

// ── Principal ─────────────────────────────────────────────────────────────────
const Configuracion = ({ sucursales, onSaveSucursales, doctors = [], user }) => {
  const [tab, setTab] = useState('catalogo');
  const isAdmin = user?.role === 'admin';

  const tabs = [
    { id: 'catalogo',   label: 'Catálogo de precios'   },
    { id: 'doctores',   label: 'Doctores y comisiones' },
    { id: 'sucursales', label: 'Sucursales'             },
    ...(isAdmin ? [{ id: 'usuarios', label: 'Usuarios' }] : []),
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">Configuración</h2>
          <p className="page-sub">Precios, comisiones y datos del consultorio</p>
        </div>
      </div>

      <Card flush>
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <div style={{ padding: 24 }}>
          {tab === 'catalogo'   && <TabCatalogo />}
          {tab === 'doctores'   && <TabDoctores doctors={doctors} />}
          {tab === 'sucursales' && <TabSucursales sucursales={sucursales} onSaveSucursales={onSaveSucursales} />}
          {tab === 'usuarios'   && <TabUsuarios doctors={doctors} />}
        </div>
      </Card>
    </div>
  );
};

export default Configuracion;
