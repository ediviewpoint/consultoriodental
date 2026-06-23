import { useState, useMemo, useRef, useEffect } from 'react';
import { Icons } from './icons';
import { Button, IconButton, Card, Badge, Field, Modal, fmtBs } from './ui';
import { getPacientes, getDoctores, getCatalogo, getPresupuestos, createPresupuesto, updatePresupuestoEstado } from '../lib/db';

// ── Helpers ──────────────────────────────────────────────────────────────────
const calcTotals = (items, descuentoGlobal = 0) => {
  const bruto        = items.reduce((s, it) => s + it.precio * it.cantidad, 0);
  const descItems    = items.reduce((s, it) => s + it.precio * it.cantidad * (it.descuento / 100), 0);
  const subtotal     = bruto - descItems;
  const descGlobal   = subtotal * (descuentoGlobal / 100);
  const total        = subtotal - descGlobal;
  return { bruto, descItems, subtotal, descGlobal, total };
};

const PLAN_LABELS = {
  contado:    { short: 'Contado',   detail: '1 pago único'         },
  'cuotas-2': { short: '2 cuotas',  detail: '2 pagos iguales'      },
  'cuotas-3': { short: '3 cuotas',  detail: '3 pagos mensuales'    },
  'cuotas-6': { short: '6 cuotas',  detail: '6 pagos mensuales'    },
};

const STATUS_CFG = {
  borrador:  { label: 'Borrador',  badgeCls: 'badge-complete',  color: '#64748B' },
  enviado:   { label: 'Enviado',   badgeCls: 'badge-progress',  color: '#1D4ED8' },
  aceptado:  { label: 'Aceptado',  badgeCls: 'badge-confirmed', color: '#047857' },
  rechazado: { label: 'Rechazado', badgeCls: 'badge-cancel',    color: '#B91C1C' },
  vencido:   { label: 'Vencido',   badgeCls: 'badge-pending',   color: '#B45309' },
};

const STATUS_NEXT = {
  borrador:  ['enviado'],
  enviado:   ['aceptado', 'rechazado'],
  aceptado:  [],
  rechazado: ['borrador'],
  vencido:   [],
};

const calcToday  = () => new Date().toLocaleDateString('es-BO');
const calcExpiry = () => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toLocaleDateString('es-BO'); };

// ── Quote document (reutilizable en builder preview y modal) ─────────────────
const QuoteDoc = ({ q, compact = false }) => {
  const { bruto, descItems, descGlobal, total } = calcTotals(q.items, q.descuentoGlobal);
  const plan   = PLAN_LABELS[q.planPago] || PLAN_LABELS.contado;
  const nCuotas = q.planPago !== 'contado' ? parseInt(q.planPago.split('-')[1]) : null;
  const cuota   = nCuotas ? Math.ceil(total / nCuotas) : null;
  const fs      = compact ? { base: 11, sm: 10, title: 13, total: 15 } : { base: 13, sm: 11, title: 14, total: 18 };

  return (
    <div className="quote-doc" style={{ fontSize: fs.base }}>
      {/* Header */}
      <div className="qdoc-header">
        <div className="qdoc-brand">
          <img src="/assets/logo.svg" alt="" style={{ width: compact ? 22 : 28, height: compact ? 22 : 28 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: fs.title, color: 'var(--dc-primary)', letterSpacing: '-0.01em' }}>DentalCare Pro</div>
            <div style={{ fontSize: fs.sm, color: 'var(--dc-fg-3)' }}>Consultorio {q.consultorio} · Santa Cruz, Bolivia</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: compact ? 13 : 16, fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-fg-1)' }}>{q.id}</div>
          <div style={{ fontSize: fs.sm, color: 'var(--dc-fg-3)', marginTop: 2 }}>Emitido: {q.fecha}</div>
          <div style={{ fontSize: fs.sm, color: 'var(--dc-fg-3)' }}>Válido hasta: {q.vencimiento}</div>
        </div>
      </div>

      {/* Parties */}
      <div className="qdoc-parties">
        <div className="qdoc-party">
          <div className="qdoc-party-label">Paciente</div>
          <div style={{ fontWeight: 700 }}>{q.paciente}</div>
          <div style={{ fontSize: fs.sm, color: 'var(--dc-fg-3)', marginTop: 2 }}>Tel: {q.tel}</div>
        </div>
        <div className="qdoc-party">
          <div className="qdoc-party-label">Profesional</div>
          <div style={{ fontWeight: 700 }}>{q.doctor}</div>
          <div style={{ fontSize: fs.sm, color: 'var(--dc-fg-3)', marginTop: 2 }}>Consultorio {q.consultorio}</div>
        </div>
      </div>

      {/* Items table */}
      <table className="table qdoc-table" style={{ fontSize: compact ? 11 : 13 }}>
        <thead>
          <tr>
            <th style={{ width: 28 }}>#</th>
            <th>Tratamiento / Servicio</th>
            <th style={{ textAlign: 'center', width: 46 }}>Cant.</th>
            <th style={{ textAlign: 'right', width: 90 }}>Precio u.</th>
            <th style={{ textAlign: 'center', width: 56 }}>Desc.</th>
            <th style={{ textAlign: 'right', width: 90 }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {q.items.map((it, i) => {
            const sub = it.precio * it.cantidad * (1 - it.descuento / 100);
            return (
              <tr key={i}>
                <td style={{ color: 'var(--dc-fg-4)', fontFamily: 'var(--dc-font-mono)' }}>{i + 1}</td>
                <td style={{ fontWeight: 500 }}>{it.tratamiento}</td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--dc-font-mono)' }}>{it.cantidad}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)' }}>{fmtBs(it.precio)}</td>
                <td style={{ textAlign: 'center', fontWeight: 600, color: it.descuento > 0 ? 'var(--dc-positive)' : 'var(--dc-fg-4)' }}>
                  {it.descuento > 0 ? `-${it.descuento}%` : '—'}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontWeight: 600 }}>{fmtBs(sub)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals block */}
      <div className="qdoc-totals">
        {descItems > 0 && (
          <>
            <div className="qdoc-total-row"><span>Subtotal bruto</span><span>{fmtBs(bruto)}</span></div>
            <div className="qdoc-total-row" style={{ color: 'var(--dc-positive)' }}>
              <span>Descuentos por ítem</span><span>−{fmtBs(descItems)}</span>
            </div>
          </>
        )}
        {q.descuentoGlobal > 0 && (
          <div className="qdoc-total-row" style={{ color: 'var(--dc-positive)' }}>
            <span>Descuento general ({q.descuentoGlobal}%)</span><span>−{fmtBs(descGlobal)}</span>
          </div>
        )}
        <div className="qdoc-total-final" style={{ fontSize: fs.total }}>
          <span>TOTAL</span><span>{fmtBs(total)}</span>
        </div>
        <div className="qdoc-plan">
          <span className="qdoc-plan-badge">{plan.short}</span>
          <span className="qdoc-plan-detail">
            {cuota ? `${plan.detail} · ${fmtBs(cuota)} c/u` : plan.detail}
          </span>
        </div>
      </div>

      {q.notas && (
        <div className="qdoc-notes"><strong>Nota: </strong>{q.notas}</div>
      )}

      <div className="qdoc-footer">
        Presupuesto válido hasta el {q.vencimiento}. Precios expresados en bolivianos (Bs.).
        DentalCare Pro · Santa Cruz, Bolivia.
      </div>
    </div>
  );
};

// ── Builder de presupuesto ───────────────────────────────────────────────────
const QuoteBuilder = ({ onSave, onCancel, patients, doctors, catalog }) => {
  const today  = useMemo(calcToday,  []);
  const expiry = useMemo(calcExpiry, []);
  const [form, setForm]           = useState({
    pacienteId: '', doctor: '', consultorio: 'A',
    fecha: today, vencimiento: expiry,
    items: [], descuentoGlobal: 0, planPago: 'contado', notas: '',
  });
  const [catQuery, setCatQuery]   = useState('');
  const [catOpen, setCatOpen]     = useState(false);
  const nextId                    = useRef(1);
  const defaultDoctorSet          = useRef(false);

  useEffect(() => {
    if (!defaultDoctorSet.current && doctors.length > 0) {
      setForm(f => ({ ...f, doctor: f.doctor || doctors[0].name }));
      defaultDoctorSet.current = true;
    }
  }, [doctors]);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedPat = patients.find(p => p.id === Number(form.pacienteId));

  const filteredCat = catQuery.trim()
    ? catalog.filter(t =>
        t.tratamiento.toLowerCase().includes(catQuery.toLowerCase()) ||
        t.categoria.toLowerCase().includes(catQuery.toLowerCase()))
    : catalog;

  // Group catalog by category
  const catGroups = filteredCat.reduce((acc, t) => {
    (acc[t.categoria] = acc[t.categoria] || []).push(t);
    return acc;
  }, {});

  const addItem = (t) => {
    setForm(f => ({ ...f, items: [...f.items, { id: nextId.current++, tratamiento: t.tratamiento, cantidad: 1, precio: t.precio, descuento: 0 }] }));
    setCatQuery('');
    setCatOpen(false);
  };

  const updItem = (id, k, v) =>
    setForm(f => ({ ...f, items: f.items.map(it => it.id === id ? { ...it, [k]: v } : it) }));

  const removeItem = (id) =>
    setForm(f => ({ ...f, items: f.items.filter(it => it.id !== id) }));

  const { total } = calcTotals(form.items, form.descuentoGlobal);
  const isValid   = form.pacienteId && form.items.length > 0;

  const handleSave = () => {
    if (!isValid) return;
    const p = selectedPat;
    onSave({
      id: `PRES-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      pacienteId: p.id,
      paciente:   `${p.nombre} ${p.apellidos}`,
      tel:        p.tel,
      doctor:     form.doctor,
      consultorio: form.consultorio,
      fecha:      form.fecha,
      vencimiento: form.vencimiento,
      estado:     'borrador',
      items:      form.items,
      descuentoGlobal: Number(form.descuentoGlobal),
      planPago:   form.planPago,
      notas:      form.notas,
    });
  };

  const previewQ = selectedPat ? {
    id: `PRES-${new Date().getFullYear()}-NEW`,
    paciente: `${selectedPat.nombre} ${selectedPat.apellidos}`,
    tel: selectedPat.tel,
    doctor: form.doctor, consultorio: form.consultorio,
    fecha: form.fecha, vencimiento: form.vencimiento,
    items: form.items,
    descuentoGlobal: Number(form.descuentoGlobal),
    planPago: form.planPago, notas: form.notas,
  } : null;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <Button variant="ghost" size="sm" onClick={onCancel} style={{ marginBottom: 8 }}>
            <Icons.ChevronL size={14} /> Presupuestos
          </Button>
          <h1 className="page-title">Nuevo presupuesto</h1>
          <p className="page-sub">Construye un presupuesto detallado para el paciente</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" icon={Icons.Check} onClick={handleSave} disabled={!isValid}>
            Guardar presupuesto
          </Button>
        </div>
      </div>

      <div className="quote-builder-grid">

        {/* ── Left: Form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Datos generales */}
          <Card>
            <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700 }}>Datos generales</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Paciente">
                  <select className="select" value={form.pacienteId}
                    onChange={e => {
                      const pid = e.target.value;
                      const p   = patients.find(x => x.id === Number(pid));
                      setForm(f => ({ ...f, pacienteId: pid, doctor: p?.doctor || f.doctor, consultorio: p?.consultorio || f.consultorio }));
                    }}>
                    <option value="">— Seleccionar paciente —</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} {p.apellidos} · CI {p.ci}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Doctor">
                <select className="select" value={form.doctor} onChange={e => upd('doctor', e.target.value)}>
                  {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </Field>
              <Field label="Consultorio">
                <select className="select" value={form.consultorio} onChange={e => upd('consultorio', e.target.value)}>
                  <option value="A">Consultorio A</option>
                  <option value="B">Consultorio B</option>
                </select>
              </Field>
              <Field label="Fecha de emisión">
                <input className="input" value={form.fecha} onChange={e => upd('fecha', e.target.value)} />
              </Field>
              <Field label="Válido hasta">
                <input className="input" value={form.vencimiento} onChange={e => upd('vencimiento', e.target.value)} />
              </Field>
            </div>
          </Card>

          {/* Tratamientos */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                Tratamientos
                {form.items.length > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: 'var(--dc-fg-3)' }}>{form.items.length} ítems</span>
                )}
              </h3>
              {/* Catalog search */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dc-fg-3)', pointerEvents: 'none', display: 'flex' }}>
                    <Icons.Search size={13} />
                  </span>
                  <input
                    className="input"
                    style={{ paddingLeft: 30, width: 230, fontSize: 13 }}
                    placeholder="Agregar del catálogo..."
                    value={catQuery}
                    onChange={e => { setCatQuery(e.target.value); setCatOpen(true); }}
                    onFocus={() => setCatOpen(true)}
                    onBlur={() => setTimeout(() => setCatOpen(false), 180)}
                  />
                </div>
                {catOpen && (
                  <div className="catalog-dropdown">
                    {Object.entries(catGroups).map(([cat, items]) => (
                      <div key={cat}>
                        <div className="catalog-cat">{cat}</div>
                        {items.map((t, i) => (
                          <div key={i} className="catalog-item" onMouseDown={() => addItem(t)}>
                            <span>{t.tratamiento}</span>
                            <span style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 12, color: 'var(--dc-fg-3)', flexShrink: 0 }}>{fmtBs(t.precio)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    {Object.keys(catGroups).length === 0 && (
                      <div style={{ padding: '14px 16px', fontSize: 13, color: 'var(--dc-fg-3)', textAlign: 'center' }}>Sin resultados</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {form.items.length === 0 ? (
              <div className="quote-empty-items">
                <Icons.Plus size={28} style={{ opacity: 0.2 }} />
                <span>Busca tratamientos del catálogo para agregar</span>
              </div>
            ) : (
              <table className="table" style={{ fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Tratamiento</th>
                    <th style={{ width: 60, textAlign: 'center' }}>Cant.</th>
                    <th style={{ width: 110, textAlign: 'right' }}>Precio Bs.</th>
                    <th style={{ width: 72, textAlign: 'center' }}>Desc. %</th>
                    <th style={{ width: 100, textAlign: 'right' }}>Subtotal</th>
                    <th style={{ width: 32 }} />
                  </tr>
                </thead>
                <tbody>
                  {form.items.map(it => {
                    const sub = it.precio * it.cantidad * (1 - it.descuento / 100);
                    return (
                      <tr key={it.id}>
                        <td style={{ fontWeight: 500 }}>{it.tratamiento}</td>
                        <td>
                          <input type="number" min="1" max="20" className="input"
                            style={{ textAlign: 'center', width: 50, padding: '5px 2px', fontSize: 13 }}
                            value={it.cantidad}
                            onChange={e => updItem(it.id, 'cantidad', Math.max(1, Number(e.target.value)))} />
                        </td>
                        <td>
                          <input type="number" min="0" className="input"
                            style={{ textAlign: 'right', width: 100, padding: '5px 8px', fontSize: 13 }}
                            value={it.precio}
                            onChange={e => updItem(it.id, 'precio', Number(e.target.value))} />
                        </td>
                        <td>
                          <input type="number" min="0" max="100" className="input"
                            style={{ textAlign: 'center', width: 60, padding: '5px 2px', fontSize: 13 }}
                            value={it.descuento}
                            onChange={e => updItem(it.id, 'descuento', Math.min(100, Number(e.target.value)))} />
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {fmtBs(sub)}
                        </td>
                        <td>
                          <button className="qdoc-del-btn" onClick={() => removeItem(it.id)} title="Eliminar">
                            <Icons.X size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>

          {/* Condiciones */}
          <Card>
            <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700 }}>Condiciones y pago</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Descuento general (%)">
                <input type="number" min="0" max="50" className="input"
                  value={form.descuentoGlobal}
                  onChange={e => upd('descuentoGlobal', Math.min(50, Number(e.target.value)))} />
              </Field>
              <Field label="Plan de pago">
                <select className="select" value={form.planPago} onChange={e => upd('planPago', e.target.value)}>
                  <option value="contado">Contado · 1 pago</option>
                  <option value="cuotas-2">2 cuotas</option>
                  <option value="cuotas-3">3 cuotas</option>
                  <option value="cuotas-6">6 cuotas</option>
                </select>
              </Field>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Notas para el paciente">
                  <textarea className="textarea" rows="3" value={form.notas}
                    placeholder="Condiciones especiales, materiales incluidos, notas de seguimiento..."
                    onChange={e => upd('notas', e.target.value)} />
                </Field>
              </div>
            </div>

            {form.items.length > 0 && (
              <div className="quote-builder-totals">
                {(() => {
                  const t = calcTotals(form.items, form.descuentoGlobal);
                  const nC = form.planPago !== 'contado' ? parseInt(form.planPago.split('-')[1]) : null;
                  return (
                    <>
                      {t.descItems > 0 && (
                        <div className="qbt-row">
                          <span>Subtotal bruto</span><span>{fmtBs(t.bruto)}</span>
                        </div>
                      )}
                      {t.descItems > 0 && (
                        <div className="qbt-row" style={{ color: 'var(--dc-positive)' }}>
                          <span>Descuentos por ítem</span><span>−{fmtBs(t.descItems)}</span>
                        </div>
                      )}
                      {t.descGlobal > 0 && (
                        <div className="qbt-row" style={{ color: 'var(--dc-positive)' }}>
                          <span>Descuento general ({form.descuentoGlobal}%)</span><span>−{fmtBs(t.descGlobal)}</span>
                        </div>
                      )}
                      <div className="qbt-total"><span>TOTAL</span><span>{fmtBs(t.total)}</span></div>
                      {nC && (
                        <div className="qbt-row" style={{ marginTop: 6, fontWeight: 600, color: 'var(--dc-teal-700)' }}>
                          <span>{nC} cuotas de</span>
                          <span>{fmtBs(Math.ceil(t.total / nC))}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </Card>
        </div>

        {/* ── Right: Live preview ── */}
        <div className="quote-preview-panel">
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dc-fg-4)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--dc-primary)', display: 'inline-block', animation: 'pulse-dot 1.8s ease-in-out infinite' }} />
            Vista previa en tiempo real
          </div>
          {previewQ && form.items.length > 0 ? (
            <QuoteDoc q={previewQ} compact />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, minHeight: 280, color: 'var(--dc-fg-4)', textAlign: 'center' }}>
              <Icons.Receipt size={44} style={{ opacity: 0.18 }} />
              <span style={{ fontSize: 13 }}>
                {!form.pacienteId ? 'Selecciona un paciente para comenzar' : 'Agrega tratamientos para ver la previsualización'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Modal: detalle + acciones de presupuesto ─────────────────────────────────
const QuoteDetailModal = ({ quote, onClose, onStatusChange, onDuplicate }) => {
  if (!quote) return null;
  const { total } = calcTotals(quote.items, quote.descuentoGlobal);
  const nexts = STATUS_NEXT[quote.estado] || [];

  const handleWhatsApp = () => {
    const nombre = quote.paciente.split(' ')[0];
    const msg = encodeURIComponent(
      `Hola ${nombre}, te compartimos el presupuesto *${quote.id}* de *DentalCare Pro* por un total de *${fmtBs(total)}*.\n\nTratamientos incluidos:\n${quote.items.map(it => `• ${it.tratamiento}`).join('\n')}\n\nVálido hasta el ${quote.vencimiento}. ¿Tienes alguna consulta?`
    );
    window.open(`https://wa.me/591${quote.tel.replace(/\s/g, '')}?text=${msg}`, '_blank');
  };

  const STATUS_BTN = {
    enviado:   { variant: 'secondary', icon: Icons.Send,        label: 'Marcar enviado'   },
    aceptado:  { variant: 'primary',   icon: Icons.CheckCircle, label: 'Marcar aceptado'  },
    rechazado: { variant: 'danger',    icon: Icons.Ban,         label: 'Marcar rechazado' },
    borrador:  { variant: 'secondary', icon: Icons.Edit,        label: 'Volver a borrador'},
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--dc-font-mono)', letterSpacing: '-0.01em' }}>{quote.id}</h3>
              <div style={{ marginTop: 4 }}>
                <span className={`badge ${STATUS_CFG[quote.estado]?.badgeCls}`}>
                  <span className="dot" />
                  {STATUS_CFG[quote.estado]?.label}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button variant="ghost" size="sm" icon={Icons.Copy} onClick={() => { onDuplicate(quote); onClose(); }}>
              Duplicar
            </Button>
            <Button variant="ghost" size="sm" icon={Icons.WhatsApp} onClick={handleWhatsApp}
              style={{ color: '#25D366' }}>
              WhatsApp
            </Button>
            <Button variant="secondary" size="sm" icon={Icons.Download} onClick={() => window.print()}>
              Imprimir
            </Button>
            <IconButton icon={Icons.X} iconSize={16} onClick={onClose} aria-label="Cerrar" />
          </div>
        </div>

        <div className="modal-body" style={{ padding: 0, overflowY: 'auto' }}>
          <QuoteDoc q={quote} />
        </div>

        {nexts.length > 0 && (
          <div className="modal-foot">
            <span style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginRight: 'auto' }}>Cambiar estado del presupuesto:</span>
            {nexts.map(s => {
              const cfg = STATUS_BTN[s];
              return cfg ? (
                <Button key={s} variant={cfg.variant} size="sm" icon={cfg.icon}
                  onClick={() => { onStatusChange(quote.id, s); onClose(); }}>
                  {cfg.label}
                </Button>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Vista principal: lista de presupuestos ───────────────────────────────────
const Presupuestos = () => {
  const [quotes, setQuotes]             = useState([]);
  const [patients, setPatients]         = useState([]);
  const [doctors, setDoctors]           = useState([]);
  const [catalog, setCatalog]           = useState([]);
  const [view, setView]                 = useState('list');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [query, setQuery]               = useState('');
  const [detailQ, setDetailQ]           = useState(null);

  useEffect(() => {
    Promise.all([
      getPacientes().catch(() => []),
      getDoctores().catch(() => []),
      getCatalogo().catch(() => []),
      getPresupuestos().catch(() => []),
    ]).then(([pats, docs, cat, presups]) => {
      setPatients(pats);
      setDoctors(docs);
      setCatalog(cat);
      setQuotes(presups);
    });
  }, []);

  const handleSave = async (q) => {
    try {
      const saved = await createPresupuesto(q);
      setQuotes(prev => [saved, ...prev]);
    } catch {
      setQuotes(prev => [q, ...prev]);
    }
    setView('list');
  };

  const handleStatusChange = async (id, newStatus) => {
    try { await updatePresupuestoEstado(id, newStatus); } catch {}
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, estado: newStatus } : q));
  };

  const handleDuplicate = async (q) => {
    const copy = { ...q, estado: 'borrador', fecha: calcToday(), vencimiento: calcExpiry() };
    try {
      const saved = await createPresupuesto(copy);
      setQuotes(prev => [saved, ...prev]);
    } catch {
      setQuotes(prev => [{ ...copy, id: `PRES-D${Date.now().toString(36).slice(-4).toUpperCase()}` }, ...prev]);
    }
  };

  const filtered = useMemo(() =>
    quotes
      .filter(q => filterStatus === 'todos' || q.estado === filterStatus)
      .filter(q => !query.trim() ||
        q.paciente.toLowerCase().includes(query.toLowerCase()) ||
        q.id.toLowerCase().includes(query.toLowerCase())
      ),
    [quotes, filterStatus, query]
  );

  const stats = useMemo(() => {
    const aceptados = quotes.filter(q => q.estado === 'aceptado');
    return {
      total:       quotes.length,
      aceptados:   aceptados.length,
      pendientes:  quotes.filter(q => ['borrador', 'enviado'].includes(q.estado)).length,
      valorAcep:   aceptados.reduce((s, q) => s + calcTotals(q.items, q.descuentoGlobal).total, 0),
    };
  }, [quotes]);

  const pillFilters = [
    { id: 'todos',     label: 'Todos'     },
    { id: 'borrador',  label: 'Borrador'  },
    { id: 'enviado',   label: 'Enviado'   },
    { id: 'aceptado',  label: 'Aceptado'  },
    { id: 'rechazado', label: 'Rechazado' },
    { id: 'vencido',   label: 'Vencido'   },
  ].map(f => ({ ...f, count: f.id === 'todos' ? quotes.length : quotes.filter(q => q.estado === f.id).length }))
    .filter(f => f.id === 'todos' || f.count > 0);

  if (view === 'builder') {
    return <QuoteBuilder onSave={handleSave} onCancel={() => setView('list')} patients={patients} doctors={doctors} catalog={catalog} />;
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Presupuestos</h1>
          <p className="page-sub">
            {quotes.length} presupuesto{quotes.length !== 1 ? 's' : ''} registrados
            · {stats.aceptados} aceptados · Valor acumulado {fmtBs(stats.valorAcep)}
          </p>
        </div>
        <Button variant="primary" icon={Icons.Plus} onClick={() => setView('builder')}>
          Nuevo presupuesto
        </Button>
      </div>

      {/* Stat cards */}
      <div className="metric-grid" style={{ marginBottom: 22 }}>
        {[
          { label: 'Total presupuestos', value: stats.total,            Icon: Icons.Receipt,     color: '#0D9488' },
          { label: 'Aceptados',          value: stats.aceptados,        Icon: Icons.CheckCircle, color: '#10B981' },
          { label: 'Pendientes',         value: stats.pendientes,       Icon: Icons.Clock,       color: '#F59E0B' },
          { label: 'Valor aceptado',     value: fmtBs(stats.valorAcep), Icon: Icons.Wallet,      color: '#3B82F6', mono: true },
        ].map(({ label, value, Icon, color, mono }) => (
          <Card key={label} className="metric-card">
            <div className="icon-pill" style={{ background: color + '18', color }}>
              <Icon size={18} />
            </div>
            <div className="eyebrow">{label}</div>
            <div className="value" style={{ fontSize: mono ? 20 : 30, fontFamily: mono ? 'var(--dc-font-mono)' : undefined, marginTop: 6 }}>
              {value}
            </div>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card flush>
        {/* Filter bar */}
        <div className="quote-filter-bar">
          <div className="quote-pills">
            {pillFilters.map(f => (
              <button
                key={f.id}
                className={`quote-pill ${filterStatus === f.id ? 'active' : ''}`}
                onClick={() => setFilterStatus(f.id)}
              >
                {f.label}
                {f.id !== 'todos' && f.count > 0 && (
                  <span className={`quote-pill-count ${filterStatus === f.id ? 'active' : ''}`}>{f.count}</span>
                )}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dc-fg-3)', display: 'flex', pointerEvents: 'none' }}>
              <Icons.Search size={14} />
            </span>
            <input
              className="input"
              style={{ paddingLeft: 32, width: 250, fontSize: 13 }}
              placeholder="Buscar paciente o N° presupuesto..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 52 }}>
            <Icons.Receipt size={40} style={{ opacity: 0.18, display: 'block', margin: '0 auto 12px' }} />
            No hay presupuestos que coincidan con los filtros actuales.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>N° Presupuesto</th>
                <th>Paciente</th>
                <th>Tratamientos</th>
                <th>Válido hasta</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th>Estado</th>
                <th style={{ width: 110 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => {
                const { total } = calcTotals(q.items, q.descuentoGlobal);
                const pat       = patients.find(p => p.id === q.pacienteId);
                return (
                  <tr key={q.id} className="clickable" onClick={() => setDetailQ(q)}>
                    <td>
                      <span style={{ fontFamily: 'var(--dc-font-mono)', fontWeight: 700, fontSize: 12.5, color: 'var(--dc-primary)' }}>
                        {q.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {pat && (
                          <span className="avatar avatar-sm" style={{ background: pat.avatarColor, flexShrink: 0 }}>
                            {pat.avatar}
                          </span>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{q.paciente}</div>
                          <div style={{ fontSize: 11, color: 'var(--dc-fg-3)' }}>{q.doctor}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12.5, color: 'var(--dc-fg-2)' }}>
                        {q.items.slice(0, 2).map(it => it.tratamiento).join(', ')}
                        {q.items.length > 2 && (
                          <span style={{ color: 'var(--dc-fg-4)', fontWeight: 600 }}> +{q.items.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 13, color: 'var(--dc-fg-2)' }}>
                      {q.vencimiento}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontWeight: 700, fontSize: 14 }}>
                      {fmtBs(total)}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_CFG[q.estado]?.badgeCls}`}>
                        <span className="dot" />
                        {STATUS_CFG[q.estado]?.label}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button variant="ghost" size="sm" style={{ padding: '4px 8px', fontSize: 12 }}
                          onClick={() => setDetailQ(q)}>
                          Ver
                        </Button>
                        <IconButton title="Duplicar" icon={Icons.Copy} iconSize={13} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--dc-fg-3)' }}
                          onClick={() => handleDuplicate(q)} />
                        <IconButton title="Enviar por WhatsApp" icon={Icons.WhatsApp} iconSize={13} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#25D366' }}
                          onClick={() => {
                            const msg = encodeURIComponent(`Hola ${q.paciente.split(' ')[0]}, te compartimos el presupuesto *${q.id}* por *${fmtBs(total)}*. Válido hasta ${q.vencimiento}.`);
                            window.open(`https://wa.me/591${q.tel.replace(/\s/g, '')}?text=${msg}`, '_blank');
                          }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <QuoteDetailModal
        quote={detailQ}
        onClose={() => setDetailQ(null)}
        onStatusChange={handleStatusChange}
        onDuplicate={handleDuplicate}
      />
    </div>
  );
};

export default Presupuestos;
