import { useState, useEffect } from 'react';
import { Icons } from '../icons';
import { Button, Field, Modal } from '../ui';

const storageKey = (id) => `dc_evo_${id}`;

const load = (id) => {
  try { return JSON.parse(localStorage.getItem(storageKey(id)) || '[]'); }
  catch { return []; }
};
const persist = (id, list) => localStorage.setItem(storageKey(id), JSON.stringify(list));

const emptyForm = () => ({
  fecha:         new Date().toISOString().split('T')[0],
  motivo:        '',
  hallazgos:     '',
  procedimiento: '',
  indicaciones:  '',
  prescripcion:  '',
  proximaCita:   '',
});

const fmtDate = (iso) => {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-BO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return iso; }
};

const SECTION = ({ label, value, bg = 'var(--dc-slate-50)', color = 'var(--dc-fg-1)' }) =>
  value ? (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color, lineHeight: 1.6, padding: '8px 12px', background: bg, borderRadius: 8 }}>
        {value}
      </div>
    </div>
  ) : null;

const Evoluciones = ({ patientId, user }) => {
  const [list, setList]         = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(emptyForm);

  useEffect(() => { setList(load(patientId)); }, [patientId]);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    const entry = {
      id:            Date.now().toString(),
      fecha:         form.fecha,
      doctor:        user?.name || 'Doctor',
      motivo:        form.motivo.trim(),
      hallazgos:     form.hallazgos.trim(),
      procedimiento: form.procedimiento.trim(),
      indicaciones:  form.indicaciones.trim(),
      prescripcion:  form.prescripcion.trim(),
      proximaCita:   form.proximaCita.trim(),
    };
    const next = [entry, ...list];
    setList(next);
    persist(patientId, next);
    setModal(false);
    setForm(emptyForm());
    setExpanded(entry.id);
  };

  const handlePrint = (e, entry) => {
    e.stopPropagation();
    const win = window.open('', '_blank', 'width=700,height=900');
    win.document.write(`
      <html><head><title>Evolución clínica</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; padding: 32px; }
        h2 { color: #0d9488; margin: 0 0 4px; } .sub { color: #64748b; font-size: 12px; margin-bottom: 20px; }
        .section { margin-bottom: 14px; } .label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.08em; margin-bottom: 4px; }
        .value { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; line-height: 1.6; }
        .rx { background: #fffbeb; border-color: #fde68a; color: #78350f; }
        .next { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
        .footer { margin-top: 40px; text-align: right; border-top: 1px solid #cbd5e1; padding-top: 12px; }
      </style></head><body>
      <h2>Evolución Clínica</h2>
      <div class="sub">Fecha: ${fmtDate(entry.fecha)} · ${entry.doctor}</div>
      ${entry.motivo ? `<div class="section"><div class="label">Motivo de consulta</div><div class="value">${entry.motivo}</div></div>` : ''}
      ${entry.hallazgos ? `<div class="section"><div class="label">Hallazgos clínicos</div><div class="value">${entry.hallazgos}</div></div>` : ''}
      ${entry.procedimiento ? `<div class="section"><div class="label">Procedimiento realizado</div><div class="value">${entry.procedimiento}</div></div>` : ''}
      ${entry.indicaciones ? `<div class="section"><div class="label">Indicaciones</div><div class="value">${entry.indicaciones}</div></div>` : ''}
      ${entry.prescripcion ? `<div class="section"><div class="label">Prescripción</div><div class="value rx">${entry.prescripcion}</div></div>` : ''}
      ${entry.proximaCita ? `<div class="section"><div class="label">Próxima cita</div><div class="value next">${entry.proximaCita}</div></div>` : ''}
      <div class="footer">${entry.doctor} · DentalCare Pro</div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const isValid = !!(form.motivo.trim() || form.procedimiento.trim());

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Evoluciones clínicas</h3>
          <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginTop: 4 }}>
            {list.length} sesión{list.length !== 1 ? 'es' : ''} registrada{list.length !== 1 ? 's' : ''}
          </div>
        </div>
        <Button icon={Icons.Plus} onClick={() => { setForm(emptyForm()); setModal(true); }}>
          Nueva evolución
        </Button>
      </div>

      {list.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 24px', color: 'var(--dc-fg-3)',
          background: 'var(--dc-slate-50)', borderRadius: 12, border: '1px dashed var(--dc-border)',
        }}>
          <Icons.FileText size={36} style={{ opacity: 0.25, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dc-fg-2)', marginBottom: 6 }}>
            Sin evoluciones registradas
          </div>
          <div style={{ fontSize: 13 }}>Registra la primera nota clínica de este paciente.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((e) => (
            <div key={e.id} style={{
              border: expanded === e.id ? '1.5px solid var(--dc-primary)' : '1px solid var(--dc-border)',
              borderRadius: 12, overflow: 'hidden', background: '#fff',
              boxShadow: expanded === e.id ? '0 0 0 3px rgba(13,148,136,0.08)' : 'none',
              transition: 'box-shadow 150ms, border-color 150ms',
            }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setExpanded(ex => ex === e.id ? null : e.id)}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--dc-teal-50)', color: 'var(--dc-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.FileText size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{fmtDate(e.fecha)}</div>
                  <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.doctor}
                    {e.motivo && ` · ${e.motivo}`}
                  </div>
                </div>
                <Button variant="ghost" size="sm" icon={Icons.Download}
                  onClick={(ev) => handlePrint(ev, e)}
                  style={{ flexShrink: 0 }}
                >
                  Imprimir
                </Button>
                <div style={{ transform: expanded === e.id ? 'rotate(90deg)' : 'none', transition: 'transform 150ms', flexShrink: 0 }}>
                  <Icons.ChevronR size={16} style={{ color: 'var(--dc-fg-3)' }} />
                </div>
              </div>

              {expanded === e.id && (
                <div style={{ padding: '0 18px 20px', borderTop: '1px solid var(--dc-divider)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
                    <SECTION label="Motivo de consulta" value={e.motivo} />
                    <SECTION label="Hallazgos clínicos" value={e.hallazgos} />
                    <SECTION label="Procedimiento realizado" value={e.procedimiento} />
                    <SECTION label="Indicaciones post-operatorias" value={e.indicaciones} />
                  </div>
                  {e.prescripcion && (
                    <div style={{ marginTop: 14 }}>
                      <SECTION label="Prescripción médica" value={e.prescripcion} bg="#FFFBEB" color="#78350F" />
                    </div>
                  )}
                  {e.proximaCita && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icons.Calendar size={14} style={{ color: '#1D4ED8', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#1D4ED8' }}>
                        Próxima cita: <strong>{e.proximaCita}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Nueva nota de evolución"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button icon={Icons.Check} onClick={handleSave} disabled={!isValid}>
              Guardar evolución
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Fecha de sesión">
              <input className="input" type="date" value={form.fecha}
                onChange={e => upd('fecha', e.target.value)} />
            </Field>
            <Field label="Profesional">
              <input className="input" value={user?.name || 'Doctor'} readOnly
                style={{ background: 'var(--dc-slate-50)', color: 'var(--dc-fg-2)' }} />
            </Field>
          </div>
          <Field label="Motivo de consulta / Subjetivo *">
            <textarea className="input" rows={2} value={form.motivo}
              onChange={e => upd('motivo', e.target.value)}
              placeholder="¿Por qué vino el paciente? ¿Qué refiere?"
              style={{ resize: 'vertical' }} />
          </Field>
          <Field label="Hallazgos clínicos / Objetivo">
            <textarea className="input" rows={2} value={form.hallazgos}
              onChange={e => upd('hallazgos', e.target.value)}
              placeholder="Examen clínico, observaciones del doctor…"
              style={{ resize: 'vertical' }} />
          </Field>
          <Field label="Procedimiento realizado *">
            <textarea className="input" rows={2} value={form.procedimiento}
              onChange={e => upd('procedimiento', e.target.value)}
              placeholder="Descripción de lo que se realizó en esta sesión…"
              style={{ resize: 'vertical' }} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Indicaciones post-operatorias">
              <textarea className="input" rows={2} value={form.indicaciones}
                onChange={e => upd('indicaciones', e.target.value)}
                placeholder="Cuidados a seguir por el paciente…"
                style={{ resize: 'vertical' }} />
            </Field>
            <Field label="Prescripción indicada">
              <textarea className="input" rows={2} value={form.prescripcion}
                onChange={e => upd('prescripcion', e.target.value)}
                placeholder="Medicamentos prescritos en esta sesión…"
                style={{ resize: 'vertical' }} />
            </Field>
          </div>
          <Field label="Nota para próxima cita">
            <input className="input" value={form.proximaCita}
              onChange={e => upd('proximaCita', e.target.value)}
              placeholder="Ej: Control en 7 días / Continuar endodoncia pieza #16" />
          </Field>
          {!isValid && (
            <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', padding: '6px 12px', background: 'var(--dc-slate-50)', borderRadius: 6 }}>
              * Completa al menos el motivo de consulta o el procedimiento realizado.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Evoluciones;
