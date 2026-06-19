import { useState, useEffect } from 'react';
import { Icons } from '../icons';
import { Button, Field, Modal } from '../ui';

const storageKey = (id) => `dc_rec_${id}`;
const load   = (id) => { try { return JSON.parse(localStorage.getItem(storageKey(id)) || '[]'); } catch { return []; } };
const persist = (id, list) => localStorage.setItem(storageKey(id), JSON.stringify(list));

const TODAY = () => new Date().toISOString().split('T')[0];

const fmtDate = (iso) => {
  try { return new Date(iso + 'T00:00:00').toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return iso; }
};

const DRUG_TEMPLATES = [
  {
    grupo: 'Antibióticos',
    bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8',
    drugs: [
      { id: 'amox',  nombre: 'Amoxicilina 500mg caps',                       cant: 21, instruccion: '1 cápsula cada 8 horas por 7 días',                            indicacion: 'Infección bacteriana odontogénica' },
      { id: 'amoxc', nombre: 'Amoxicilina + Clavulánico 500/125mg tabs',      cant: 21, instruccion: '1 tableta cada 8 horas por 7 días (con alimentos)',             indicacion: 'Infección severa o resistente' },
      { id: 'metro', nombre: 'Metronidazol 500mg tabs',                        cant: 21, instruccion: '1 tableta cada 8 horas por 7 días',                            indicacion: 'Infección anaeróbica / periodontitis' },
    ],
  },
  {
    grupo: 'Analgésicos / Antiinflamatorios',
    bg: '#FEF3C7', border: '#FCD34D', text: '#92400E',
    drugs: [
      { id: 'ibup',  nombre: 'Ibuprofeno 600mg tabs',                          cant: 15, instruccion: '1 tableta cada 8 horas por 5 días (con alimentos)',             indicacion: 'Dolor e inflamación post-operatoria' },
      { id: 'parac', nombre: 'Paracetamol 500mg tabs',                          cant: 20, instruccion: '1-2 tabletas cada 6-8 horas (máx 4g/día)',                    indicacion: 'Dolor leve a moderado' },
      { id: 'diclo', nombre: 'Diclofenaco sódico 50mg tabs',                   cant: 9,  instruccion: '1 tableta cada 8 horas por 3 días (con alimentos)',             indicacion: 'Dolor e inflamación severa' },
    ],
  },
  {
    grupo: 'Corticosteroides',
    bg: '#F3E8FF', border: '#D8B4FE', text: '#6B21A8',
    drugs: [
      { id: 'dexa',  nombre: 'Dexametasona 4mg tabs',                          cant: 2,  instruccion: '2 tabletas como dosis única (pre o post quirúrgico)',           indicacion: 'Prevención de edema post-quirúrgico' },
    ],
  },
  {
    grupo: 'Antisépticos bucales',
    bg: '#ECFDF5', border: '#6EE7B7', text: '#065F46',
    drugs: [
      { id: 'clor',  nombre: 'Clorhexidina 0.12% enjuague 120ml',             cant: 1,  instruccion: 'Enjuagarse con 15ml durante 30s, 2 veces al día por 7-10 días. No ingerir.', indicacion: 'Antiséptico post-cirugía / periodontal' },
    ],
  },
];

const PrintWindow = ({ receta, patient, sucNombre }) => {
  const open = () => {
    const items = receta.items.map((item, i) => `
      <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:${i < receta.items.length - 1 ? '1px dashed #e2e8f0' : 'none'}">
        <div style="font-weight:700;font-size:14px">${i + 1}. ${item.nombre}</div>
        <div style="font-size:12px;color:#475569;margin:3px 0 0 16px">${item.customInstruccion || item.instruccion}</div>
        <div style="font-size:11px;color:#94a3b8;margin:1px 0 0 16px">${item.indicacion}</div>
      </div>
    `).join('');

    const win = window.open('', '_blank', 'width=720,height=920');
    win.document.write(`<html><head><title>Receta Médica</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;padding:36px;max-width:680px;margin:auto}
      .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:2.5px solid #0d9488;margin-bottom:20px}
      .brand{font-size:20px;font-weight:800;color:#0d9488}
      .brand-sub{font-size:12px;color:#64748b}
      .rxnum{font-family:monospace;font-size:14px;font-weight:700;text-align:right}
      .pat-box{background:#f8fafc;border:1px solid #e2e8f0;padding:10px 14px;border-radius:6px;margin-bottom:18px}
      .label{font-size:10px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:.08em;margin-bottom:4px}
      .rp{font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:.08em;margin-bottom:12px}
      .obs{background:#fffbeb;border:1px solid #fde68a;padding:10px 14px;border-radius:6px;font-size:12px;color:#78350f;margin-top:14px}
      .footer{margin-top:48px;display:flex;justify-content:flex-end}
      .firma{text-align:center;border-top:1px solid #cbd5e1;padding-top:10px;min-width:200px}
      @media print{body{padding:20px}}
    </style></head><body>
    <div class="header">
      <div><div class="brand">RECETA MÉDICA</div><div class="brand-sub">DentalCare Pro · ${sucNombre || 'Consultorio'}</div></div>
      <div><div class="rxnum">N° RX-${receta.id.slice(-6)}</div><div style="font-size:11px;color:#64748b;text-align:right">Fecha: ${fmtDate(receta.fecha)}</div></div>
    </div>
    <div class="pat-box">
      <div class="label">Paciente</div>
      <div style="font-weight:700;font-size:15px">${patient ? `${patient.nombre} ${patient.apellidos}` : '—'}</div>
      ${patient?.ci ? `<div style="font-size:12px;color:#64748b">C.I. ${patient.ci} · ${patient.edad} años</div>` : ''}
    </div>
    <div class="rp">Rp/ Medicamentos prescritos</div>
    ${items}
    ${receta.observaciones ? `<div class="obs"><strong>Observaciones:</strong> ${receta.observaciones}</div>` : ''}
    <div class="footer"><div class="firma">
      <div style="font-weight:700;font-size:13px">${receta.doctor}</div>
      <div style="font-size:11px;color:#94a3b8">Odontólogo · Firma y sello</div>
    </div></div>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };
  return <Button icon={Icons.Download} onClick={open}>Imprimir receta</Button>;
};

const Recetas = ({ patientId, patient, user, sucursales }) => {
  const [list, setList]           = useState([]);
  const [modal, setModal]         = useState(false);
  const [items, setItems]         = useState([]);
  const [obs, setObs]             = useState('');
  const [viewReceta, setViewReceta] = useState(null);

  useEffect(() => { setList(load(patientId)); }, [patientId]);

  const sucNombre = sucursales ? Object.values(sucursales)[0]?.nombre : 'Consultorio';

  const toggleDrug = (drug) => {
    if (items.find(i => i.id === drug.id)) {
      setItems(prev => prev.filter(i => i.id !== drug.id));
    } else {
      setItems(prev => [...prev, { ...drug, customInstruccion: drug.instruccion }]);
    }
  };

  const updateInstruccion = (id, val) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, customInstruccion: val } : i));

  const handleSave = () => {
    if (!items.length) return;
    const receta = {
      id:     Date.now().toString(),
      fecha:  TODAY(),
      doctor: user?.name || 'Doctor',
      items,
      observaciones: obs.trim(),
    };
    const next = [receta, ...list];
    setList(next);
    persist(patientId, next);
    setModal(false);
    setItems([]);
    setObs('');
    setViewReceta(receta);
  };

  const sendWhatsApp = (r) => {
    const text = r.items.map((item, i) =>
      `${i + 1}. *${item.nombre}*\n   ${item.customInstruccion || item.instruccion}`
    ).join('\n\n');
    const msg = encodeURIComponent(
      `*RECETA MÉDICA · DentalCare Pro*\nFecha: ${fmtDate(r.fecha)}\nPaciente: ${patient ? `${patient.nombre} ${patient.apellidos}` : ''}\n\n${text}${r.observaciones ? `\n\n_Observaciones: ${r.observaciones}_` : ''}\n\n${r.doctor}`
    );
    window.open(`https://wa.me/591${patient?.tel?.replace(/\s/g, '') || ''}?text=${msg}`, '_blank');
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Recetas médicas</h3>
          <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginTop: 4 }}>
            {list.length} receta{list.length !== 1 ? 's' : ''} emitida{list.length !== 1 ? 's' : ''}
          </div>
        </div>
        <Button icon={Icons.Plus} onClick={() => { setItems([]); setObs(''); setViewReceta(null); setModal(true); }}>
          Nueva receta
        </Button>
      </div>

      {/* Vista / impresión de receta activa */}
      {viewReceta && (
        <div style={{ background: '#fff', border: '1.5px solid var(--dc-primary)', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 0 0 3px rgba(13,148,136,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 14, borderBottom: '2.5px solid #0D9488', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0D9488', letterSpacing: '-0.02em' }}>RECETA MÉDICA</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>DentalCare Pro · {sucNombre}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700 }}>N° RX-{viewReceta.id.slice(-6)}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Fecha: {fmtDate(viewReceta.fecha)}</div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, marginBottom: 18 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Paciente</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{patient ? `${patient.nombre} ${patient.apellidos}` : '—'}</div>
            {patient?.ci && <div style={{ fontSize: 12, color: '#64748B' }}>C.I. {patient.ci} · {patient.edad} años</div>}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Rp/ Medicamentos</div>
          {viewReceta.items.map((item, i) => (
            <div key={item.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < viewReceta.items.length - 1 ? '1px dashed #E2E8F0' : 'none' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{i + 1}. {item.nombre}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 3, marginLeft: 16 }}>{item.customInstruccion || item.instruccion}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1, marginLeft: 16 }}>{item.indicacion}</div>
            </div>
          ))}
          {viewReceta.observaciones && (
            <div style={{ padding: '10px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 12, color: '#78350F', marginTop: 10 }}>
              <strong>Observaciones:</strong> {viewReceta.observaciones}
            </div>
          )}
          <div style={{ marginTop: 32, textAlign: 'right' }}>
            <div style={{ display: 'inline-block', textAlign: 'center', borderTop: '1px solid #CBD5E1', paddingTop: 8, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{viewReceta.doctor}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Odontólogo · Firma y sello</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--dc-divider)' }}>
            <PrintWindow receta={viewReceta} patient={patient} sucNombre={sucNombre} />
            <Button variant="secondary" icon={Icons.WhatsApp} onClick={() => sendWhatsApp(viewReceta)}>
              Enviar por WhatsApp
            </Button>
            <Button variant="secondary" onClick={() => setViewReceta(null)}>Cerrar vista</Button>
          </div>
        </div>
      )}

      {/* Historial de recetas */}
      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--dc-fg-3)', background: 'var(--dc-slate-50)', borderRadius: 12, border: '1px dashed var(--dc-border)' }}>
          <Icons.FileText size={36} style={{ opacity: 0.25, display: 'block', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dc-fg-2)', marginBottom: 6 }}>Sin recetas emitidas</div>
          <div style={{ fontSize: 13 }}>Genera la primera receta médica para este paciente.</div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid var(--dc-border)', borderRadius: 12, overflow: 'hidden' }}>
          {list.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < list.length - 1 ? '1px solid var(--dc-divider)' : 'none' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FFFBEB', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icons.FileText size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{fmtDate(r.fecha)} · {r.doctor}</div>
                <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.items.map(it => it.nombre).join(' · ')}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewReceta(r)}>
                Ver / Imprimir
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Modal nueva receta */}
      <Modal open={modal} onClose={() => setModal(false)} title="Nueva receta médica"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button icon={Icons.Check} onClick={handleSave} disabled={!items.length}>
              Generar receta ({items.length} medicamento{items.length !== 1 ? 's' : ''})
            </Button>
          </>
        }
      >
        <div>
          {DRUG_TEMPLATES.map(grupo => (
            <div key={grupo.grupo} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 8 }}>
                {grupo.grupo}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {grupo.drugs.map(drug => {
                  const sel = !!items.find(i => i.id === drug.id);
                  const selItem = items.find(i => i.id === drug.id);
                  return (
                    <div key={drug.id}>
                      <button
                        onClick={() => toggleDrug(drug)}
                        style={{
                          width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 8,
                          border: `1.5px solid ${sel ? grupo.border : 'var(--dc-border)'}`,
                          background: sel ? grupo.bg : '#fff', cursor: 'pointer', transition: 'all 150ms',
                          display: 'flex', alignItems: 'center', gap: 10,
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                          border: `2px solid ${sel ? grupo.border : 'var(--dc-border)'}`,
                          background: sel ? grupo.border : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {sel && <Icons.Check size={10} style={{ color: '#fff' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: sel ? grupo.text : 'var(--dc-fg-1)' }}>{drug.nombre}</div>
                          <div style={{ fontSize: 11, color: 'var(--dc-fg-3)' }}>{drug.indicacion}</div>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--dc-fg-4)', flexShrink: 0 }}>×{drug.cant}</span>
                      </button>
                      {sel && selItem && (
                        <div style={{ padding: '0 6px 4px' }}>
                          <textarea
                            className="input"
                            rows={2}
                            value={selItem.customInstruccion}
                            onChange={e => updateInstruccion(drug.id, e.target.value)}
                            style={{ fontSize: 12, marginTop: 4, resize: 'vertical', borderColor: grupo.border }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <Field label="Observaciones generales (opcional)">
            <textarea className="input" rows={2} value={obs} onChange={e => setObs(e.target.value)}
              placeholder="Ej: Tomar con alimentos. Consultar ante reacción adversa."
              style={{ resize: 'vertical' }} />
          </Field>
          {items.length > 0 && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--dc-teal-50)', borderRadius: 8, fontSize: 12, color: 'var(--dc-teal-700)', fontWeight: 600 }}>
              {items.length} medicamento{items.length > 1 ? 's' : ''} seleccionado{items.length > 1 ? 's' : ''} · Listo para generar receta
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Recetas;
