import { useState, useEffect } from 'react';
import { Icons } from './icons';
import { Button, Card, CardHead, Tabs, Field, Modal, fmtBs } from './ui';
import { getCatalogo, saveCatalogo, saveDocorComision, createDoctor, updateDoctor, deleteDoctor, getPerfiles, updatePerfil, sendPasswordReset, inviteNewUser } from '../lib/db';

// ── Tab: Catálogo de precios ──────────────────────────────────────────────────
const TabCatalogo = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    getCatalogo()
      .then(setCatalog)
      .catch(() => setCatalog([]))
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
const PRESET_COLORS = [
  '#0D9488', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EF4444', '#10B981', '#FB923C', '#EC4899',
];

const EMPTY_FORM = { nombre: '', iniciales: '', sucursal_id: 'A', pct: 40, color: '#0D9488', email: '' };

const TabDoctores = ({ doctors: doctorsProp = [], sucursales = {} }) => {
  const [doctors,      setDoctors]     = useState(doctorsProp.map(d => ({ ...d, pct: Math.round(d.comision * 100) })));
  const [saved,        setSaved]       = useState(false);
  const [saving,       setSaving]      = useState(false);
  const [modal,        setModal]       = useState(false);
  const [editingId,    setEditingId]   = useState(null);
  const [form,         setForm]        = useState(EMPTY_FORM);
  const [submitting,   setSubmitting]  = useState(false);
  const [formErr,      setFormErr]     = useState('');
  const [deleting,     setDeleting]    = useState(null);
  const [inviteStatus, setInviteStatus]= useState(null); // null | 'ok' | 'ok_existente' | 'err'

  useEffect(() => {
    setDoctors(doctorsProp.map(d => ({ ...d, pct: Math.round(d.comision * 100) })));
  }, [doctorsProp]); // eslint-disable-line react-hooks/exhaustive-deps

  const updPct = (id, pct) => setDoctors(prev => prev.map(d => d.id === id ? { ...d, pct } : d));
  const upd    = (k, v)    => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setFormErr(''); setInviteStatus(null); setModal(true); };
  const openEdit   = (d) => {
    setEditingId(d.id);
    setForm({ nombre: d.name, iniciales: d.short, sucursal_id: d.consultorio, pct: d.pct, color: d.color, email: '' });
    setFormErr('');
    setInviteStatus(null);
    setModal(true);
  };

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

  const handleSubmit = async () => {
    if (!form.nombre.trim())    { setFormErr('El nombre es obligatorio.'); return; }
    if (!form.iniciales.trim()) { setFormErr('Las iniciales son obligatorias.'); return; }
    setSubmitting(true); setFormErr('');
    const payload = {
      nombre:      form.nombre.trim(),
      iniciales:   form.iniciales.trim().toUpperCase().slice(0, 3),
      sucursal_id: form.sucursal_id,
      comision:    form.pct / 100,
      color:       form.color,
    };
    try {
      if (editingId) {
        const data = await updateDoctor(editingId, payload);
        setDoctors(prev => prev.map(d => d.id === editingId ? {
          ...d, name: data.nombre, short: data.iniciales,
          color: data.color, consultorio: data.sucursal_id,
          comision: Number(data.comision), pct: Math.round(Number(data.comision) * 100),
        } : d));
        setModal(false);
        setForm(EMPTY_FORM);
      } else {
        const data = await createDoctor(payload);
        const newDoc = {
          id: data.id, name: data.nombre, short: data.iniciales,
          color: data.color, consultorio: data.sucursal_id,
          comision: Number(data.comision), pct: Math.round(Number(data.comision) * 100),
        };
        setDoctors(prev => [...prev, newDoc]);

        if (form.email.trim()) {
          try {
            await inviteNewUser({
              email:    form.email.trim(),
              nombre:   form.nombre.trim(),
              rol:      'doctor',
              doctorId: data.id,
            });
            setInviteStatus('ok');
          } catch (invErr) {
            console.error('INVITE ERROR:', invErr, JSON.stringify(invErr));
            if (invErr?.message === 'EMAIL_EXISTS') {
              setInviteStatus('ok_existente');
            } else {
              setInviteStatus('err');
              setFormErr(invErr?.message || invErr?.details || invErr?.hint || JSON.stringify(invErr) || 'Error desconocido');
            }
          }
        } else {
          setModal(false);
          setForm(EMPTY_FORM);
        }
      }
    } catch (err) {
      setFormErr('Error al guardar. Intenta de nuevo.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este doctor? Esta acción no se puede deshacer.')) return;
    setDeleting(id);
    try {
      await deleteDoctor(id);
      setDoctors(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const EJ_BASE = 530;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Doctores y comisiones</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--dc-fg-3)' }}>
            % aplicado sobre la base comisionable (precio − material)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dc-positive)' }}>✓ Guardado</span>}
          <Button variant="secondary" icon={Icons.Plus} onClick={openCreate}>
            Nuevo doctor
          </Button>
          <Button icon={Icons.Check} onClick={handleSave} disabled={saving || doctors.length === 0}>
            {saving ? 'Guardando…' : 'Guardar comisiones'}
          </Button>
        </div>
      </div>

      {/* Lista de doctores */}
      {doctors.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', border: '2px dashed var(--dc-border)', borderRadius: 12 }}>
          <Icons.Users size={32} style={{ color: 'var(--dc-fg-4)', marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: 'var(--dc-fg-3)', margin: '0 0 16px' }}>No hay doctores registrados aún.</p>
          <Button icon={Icons.Plus} onClick={openCreate}>
            Agregar primer doctor
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {doctors.map(d => (
            <Card key={d.id} pad="lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${d.color}22`, color: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                  {d.short}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--dc-fg-3)' }}>{sucursales[d.consultorio]?.nombre || `Sucursal ${d.consultorio}`}</div>
                </div>
                <button
                  onClick={() => openEdit(d)}
                  title="Editar doctor"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dc-fg-3)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                >
                  <Icons.Edit size={15} />
                </button>
                <button
                  onClick={() => handleDelete(d.id)}
                  disabled={deleting === d.id}
                  title="Eliminar doctor"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dc-fg-4)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                >
                  {deleting === d.id ? <Icons.Clock size={15} /> : <Icons.X size={15} />}
                </button>
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
                Ejemplo · base Bs. {EJ_BASE} →{' '}
                <strong style={{ color: d.color }}>Bs. {Math.round(EJ_BASE * d.pct / 100)}</strong>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal nuevo doctor */}
      <Modal
        open={modal}
        onClose={() => { setModal(false); setForm(EMPTY_FORM); setInviteStatus(null); }}
        title={editingId ? 'Editar doctor' : 'Nuevo doctor'}
        footer={
          inviteStatus ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button icon={Icons.Check} onClick={() => { setModal(false); setForm(EMPTY_FORM); setInviteStatus(null); }}>
                Cerrar
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
              <Button icon={editingId ? Icons.Check : Icons.Plus} onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? (form.email.trim() && !editingId ? 'Guardando y enviando invitación…' : 'Guardando…')
                  : editingId ? 'Guardar cambios'
                  : form.email.trim() ? 'Agregar y enviar invitación'
                  : 'Agregar doctor'}
              </Button>
            </div>
          )
        }
      >
        {/* Pantalla de resultado de invitación */}
        {inviteStatus === 'ok' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icons.Mail size={26} style={{ color: 'var(--dc-primary)' }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#134E4A', marginBottom: 8 }}>
              ¡Doctor registrado e invitación enviada!
            </div>
            <div style={{ fontSize: 13, color: 'var(--dc-fg-3)', lineHeight: 1.6 }}>
              Se envió un correo a <strong>{form.email}</strong> con un enlace para que el doctor establezca su contraseña y acceda al sistema con rol <strong>Doctor</strong>.
            </div>
          </div>
        )}

        {inviteStatus === 'ok_existente' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icons.CheckCircle size={26} style={{ color: '#059669' }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#134E4A', marginBottom: 8 }}>
              ¡Doctor registrado!
            </div>
            <div style={{ fontSize: 13, color: 'var(--dc-fg-3)', lineHeight: 1.6 }}>
              El correo <strong>{form.email}</strong> ya tenía una cuenta en el sistema. Se configuró el acceso como <strong>Doctor</strong> y se le envió un enlace para iniciar sesión.
            </div>
          </div>
        )}

        {inviteStatus === 'err' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icons.AlertCircle size={26} style={{ color: '#DC2626' }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#991B1B', marginBottom: 8 }}>
              Doctor agregado, pero falló el envío del correo
            </div>
            <div style={{ fontSize: 13, color: 'var(--dc-fg-3)', lineHeight: 1.6 }}>
              El perfil del doctor fue creado. Puedes enviar el correo manualmente desde la pestaña <strong>Usuarios → Restablecer contraseña</strong>.
            </div>
            {formErr && (
              <div style={{ marginTop: 12, fontSize: 11, color: '#991B1B', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', textAlign: 'left', fontFamily: 'var(--dc-font-mono)', wordBreak: 'break-all' }}>
                Error: {formErr}
              </div>
            )}
          </div>
        )}

        {/* Formulario principal */}
        {!inviteStatus && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Nombre completo *">
              <input
                className="input"
                value={form.nombre}
                onChange={e => { upd('nombre', e.target.value); setFormErr(''); }}
                placeholder="Ej: Dra. María López"
                autoFocus
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Iniciales * (máx. 3)">
                <input
                  className="input"
                  value={form.iniciales}
                  onChange={e => { upd('iniciales', e.target.value.slice(0, 3)); setFormErr(''); }}
                  placeholder="Ej: ML"
                  style={{ fontFamily: 'var(--dc-font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                />
              </Field>
              <Field label="Sucursal">
                <select className="select" value={form.sucursal_id} onChange={e => upd('sucursal_id', e.target.value)}>
                  {Object.entries(sucursales).map(([key, s]) => (
                    <option key={key} value={key}>{s.nombre || `Sucursal ${key}`}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label={`Comisión: ${form.pct}%`}>
              <input
                type="range" min="0" max="60" step="1" value={form.pct}
                onChange={e => upd('pct', Number(e.target.value))}
                style={{ width: '100%', accentColor: form.color, marginTop: 4 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--dc-fg-4)', marginTop: 2 }}>
                <span>0%</span><span>30%</span><span>60%</span>
              </div>
            </Field>

            <Field label="Color de identificación">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => upd('color', c)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, background: c, border: 'none',
                      cursor: 'pointer', flexShrink: 0,
                      outline: form.color === c ? `3px solid ${c}` : '3px solid transparent',
                      outlineOffset: 2,
                      transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.12s',
                    }}
                  />
                ))}
              </div>
            </Field>

            {/* Preview */}
            <div style={{ background: 'var(--dc-slate-50)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${form.color}22`, color: form.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                {form.iniciales.toUpperCase() || '??'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dc-fg-1)' }}>{form.nombre || 'Nombre del doctor'}</div>
                <div style={{ fontSize: 12, color: 'var(--dc-fg-3)' }}>{sucursales[form.sucursal_id]?.nombre || `Suc. ${form.sucursal_id}`} · Comisión {form.pct}%</div>
              </div>
            </div>

            {/* Sección de invitación al sistema */}
            {!editingId && (
              <div style={{ borderTop: '1px solid var(--dc-border)', paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 10 }}>
                  Acceso al sistema (opcional)
                </div>
                <Field label="Correo electrónico del doctor">
                  <input
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={e => upd('email', e.target.value)}
                    placeholder="doctor@email.com"
                  />
                </Field>
                {form.email.trim() && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'flex-start', background: '#F0FDFA', borderRadius: 8, padding: '10px 12px' }}>
                    <Icons.Mail size={14} style={{ color: 'var(--dc-primary)', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ margin: 0, fontSize: 12, color: '#0F766E', lineHeight: 1.5 }}>
                      Se creará una cuenta con rol <strong>Doctor</strong> y se enviará un correo para que establezca su contraseña.
                    </p>
                  </div>
                )}
              </div>
            )}

            {formErr && (
              <div style={{ fontSize: 13, color: '#DC2626', padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA' }}>
                {formErr}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// ── Tab: Sucursales ──────────────────────────────────────────────────────────
const TabSucursales = ({ sucursales: sucProp, onSaveSucursales }) => {
  const initSuc = sucProp || {};
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
const ROL_LABEL = { admin: 'Administrador', recepcion: 'Recepción', doctor: 'Doctor' };

const INVITE_EMPTY = { nombre: '', email: '', rol: 'recepcion', doctorId: '' };

const TabUsuarios = ({ doctors = [] }) => {
  const [perfiles,     setPerfiles]    = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [saving,       setSaving]      = useState(false);
  const [saved,        setSaved]       = useState(false);
  const [resetEmail,   setResetEmail]  = useState('');
  const [resetStatus,  setResetStatus] = useState('');
  const [invForm,      setInvForm]     = useState(INVITE_EMPTY);
  const [inviting,     setInviting]    = useState(false);
  const [invStatus,    setInvStatus]   = useState(null); // null | 'ok' | 'err'
  const [invErr,       setInvErr]      = useState('');

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

  const handleInvite = async () => {
    if (!invForm.nombre.trim()) { setInvErr('El nombre es obligatorio.'); return; }
    if (!invForm.email.trim())  { setInvErr('El correo es obligatorio.'); return; }
    if (invForm.rol === 'doctor' && !invForm.doctorId) { setInvErr('Selecciona el doctor vinculado.'); return; }
    setInviting(true); setInvErr('');
    try {
      await inviteNewUser({
        email:    invForm.email.trim(),
        nombre:   invForm.nombre.trim(),
        rol:      invForm.rol,
        doctorId: invForm.rol === 'doctor' ? invForm.doctorId : null,
      });
      setInvStatus('ok');
      setInvForm(INVITE_EMPTY);
      getPerfiles().then(setPerfiles).catch(console.error);
    } catch (err) {
      setInvErr(err?.message === 'EMAIL_EXISTS' || err?.message?.toLowerCase().includes('already') ? 'Este correo ya tiene una cuenta. Se le envió un enlace para establecer su contraseña.' : 'Error al enviar la invitación. Intenta de nuevo.');
      console.error(err);
    } finally {
      setInviting(false);
    }
  };

  return (
    <div>
      {/* ── Invitar usuario nuevo ── */}
      <div style={{ marginBottom: 28, padding: 20, background: 'var(--dc-slate-50)', borderRadius: 14, border: '1px solid var(--dc-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--dc-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icons.Mail size={17} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Invitar nuevo usuario</div>
            <div style={{ fontSize: 12, color: 'var(--dc-fg-3)' }}>Se enviará un correo para que establezca su contraseña</div>
          </div>
        </div>

        {invStatus === 'ok' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#F0FDFA', borderRadius: 10, border: '1px solid #A7F3D0' }}>
            <Icons.CheckCircle size={18} style={{ color: 'var(--dc-primary)', flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: '#0F766E', flex: 1 }}>
              Invitación enviada correctamente. El usuario recibirá un correo para establecer su contraseña.
            </div>
            <Button variant="ghost" size="sm" onClick={() => setInvStatus(null)}>Invitar otro</Button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="Nombre completo *">
                <input className="input" value={invForm.nombre} onChange={e => { setInvForm(f => ({ ...f, nombre: e.target.value })); setInvErr(''); }} placeholder="Ej: Ana Rodríguez" />
              </Field>
              <Field label="Correo electrónico *">
                <input className="input" type="email" value={invForm.email} onChange={e => { setInvForm(f => ({ ...f, email: e.target.value })); setInvErr(''); }} placeholder="correo@ejemplo.com" />
              </Field>
              <Field label="Rol">
                <select className="select" value={invForm.rol} onChange={e => setInvForm(f => ({ ...f, rol: e.target.value, doctorId: '' }))}>
                  {Object.entries(ROL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              {invForm.rol === 'doctor' && (
                <Field label="Doctor vinculado *">
                  <select className="select" value={invForm.doctorId} onChange={e => setInvForm(f => ({ ...f, doctorId: e.target.value }))}>
                    <option value="">Seleccionar…</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </Field>
              )}
            </div>
            {invErr && (
              <div style={{ fontSize: 13, color: '#DC2626', padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', marginBottom: 12 }}>
                {invErr}
              </div>
            )}
            <Button icon={Icons.Mail} onClick={handleInvite} disabled={inviting}>
              {inviting ? 'Enviando invitación…' : 'Enviar invitación'}
            </Button>
          </>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Usuarios del sistema</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--dc-fg-3)' }}>Gestiona roles y vinculación con doctores</p>
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
          {tab === 'doctores'   && <TabDoctores doctors={doctors} sucursales={sucursales} />}
          {tab === 'sucursales' && <TabSucursales sucursales={sucursales} onSaveSucursales={onSaveSucursales} />}
          {tab === 'usuarios'   && <TabUsuarios doctors={doctors} />}
        </div>
      </Card>
    </div>
  );
};

export default Configuracion;
