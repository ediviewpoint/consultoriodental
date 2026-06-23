import { useState, useEffect } from 'react';
import { Icons } from './icons';
import { Button, Card, CardHead, fmtBs } from './ui';
import { getCitasCompletadas, getCitasHistorial, getCatalogo, getLiquidacion, marcarLiquidacion } from '../lib/db';

// ── Utilidades de fecha ───────────────────────────────────────────────────────
const pad = n => String(n).padStart(2, '0');
const toISO = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const MON_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

const fmtFecha = iso =>
  new Date(iso + 'T00:00:00').toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' });

// Genera 8 quincenas hacia atrás desde hoy
const buildPeriodos = () => {
  const result = [];
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let isSecond = now.getDate() >= 16;
  for (let i = 0; i < 8; i++) {
    const lastDay = new Date(year, month + 1, 0).getDate();
    const start = isSecond ? `${year}-${pad(month+1)}-16` : `${year}-${pad(month+1)}-01`;
    const end   = isSecond ? `${year}-${pad(month+1)}-${pad(lastDay)}` : `${year}-${pad(month+1)}-15`;
    const label = isSecond ? `16–${lastDay} ${MON_ES[month]} ${year}` : `1–15 ${MON_ES[month]} ${year}`;
    result.push({ id: `${year}-${month+1}-${isSecond?2:1}`, label, start, end });
    if (isSecond) { isSecond = false; }
    else { isSecond = true; month--; if (month < 0) { month = 11; year--; } }
  }
  return result;
};

// buildPeriodos y buildPeriodosDoctor se llaman dentro de los componentes para evitar fechas obsoletas

// Períodos para la vista del doctor
const buildPeriodosDoctor = () => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  return [
    { id: 'hoy',         label: 'Hoy',          start: toISO(now),            end: toISO(now)           },
    { id: 'semana',      label: 'Esta semana',   start: toISO(startOfWeek),    end: toISO(now)           },
    { id: 'mes',         label: 'Este mes',      start: toISO(startOfMonth),   end: toISO(now)           },
    { id: 'mes-ant',     label: 'Mes anterior',  start: toISO(startPrevMonth), end: toISO(endPrevMonth)  },
  ];
};


const ESTADO_COLOR = {
  confirmada: { bg: '#ECFDF5', color: '#047857', label: 'Confirmada' },
  'en-curso':  { bg: '#EFF6FF', color: '#1D4ED8', label: 'En curso'   },
  completada:  { bg: '#F8FAFC', color: '#64748B', label: 'Completada' },
  pendiente:   { bg: '#FFFBEB', color: '#B45309', label: 'Pendiente'  },
};

// ── Vista historial del doctor ────────────────────────────────────────────────
const HistorialDoctor = ({ user }) => {
  const [periodoId, setPeriodoId] = useState('semana');
  const [citas, setCitas]         = useState([]);
  const [loading, setLoading]     = useState(false);

  const periodosDoctor = buildPeriodosDoctor();
  const periodo = periodosDoctor.find(p => p.id === periodoId);

  useEffect(() => {
    if (!periodo || !user?.doctorId) return;
    setLoading(true);
    getCitasHistorial(periodo.start, periodo.end, user.doctorId)
      .then(setCitas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [periodoId, user?.doctorId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Agrupar por fecha
  const porFecha = citas.reduce((acc, c) => {
    if (!acc[c.fecha]) acc[c.fecha] = [];
    acc[c.fecha].push(c);
    return acc;
  }, {});
  const fechas = Object.keys(porFecha).sort((a, b) => b.localeCompare(a));

  const completadas = citas.filter(c => c.estado === 'completada').length;
  const confirmadas = citas.filter(c => c.estado === 'confirmada').length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">Mis Citas</h2>
          <p className="page-sub">{periodo?.label} · {citas.length} cita{citas.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Selector de período */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {periodosDoctor.map(p => (
            <button key={p.id} onClick={() => setPeriodoId(p.id)} style={{
              padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              border: `1.5px solid ${periodoId === p.id ? 'var(--dc-primary)' : 'var(--dc-border)'}`,
              background: periodoId === p.id ? 'var(--dc-primary)' : '#fff',
              color: periodoId === p.id ? '#fff' : 'var(--dc-fg-2)',
            }}>
              {p.label}
            </button>
          ))}
        </div>
      </Card>

      {/* KPIs */}
      <div className="metric-grid" style={{ marginBottom: 20 }}>
        <Card className="metric-card">
          <div className="icon-pill"><Icons.Calendar size={18} /></div>
          <div className="eyebrow">Total citas</div>
          <div className="value">{loading ? '…' : citas.length}</div>
          <div className="delta">{periodo?.label}</div>
        </Card>
        <Card className="metric-card">
          <div className="icon-pill" style={{ background: 'rgba(16,185,129,0.14)', color: '#047857' }}>
            <Icons.CheckCircle size={18} />
          </div>
          <div className="eyebrow">Completadas</div>
          <div className="value" style={{ color: '#047857' }}>{loading ? '…' : completadas}</div>
          <div className="delta up">citas finalizadas</div>
        </Card>
        <Card className="metric-card">
          <div className="icon-pill" style={{ background: 'rgba(59,130,246,0.14)', color: '#1D4ED8' }}>
            <Icons.Clock size={18} />
          </div>
          <div className="eyebrow">Confirmadas</div>
          <div className="value" style={{ color: '#1D4ED8' }}>{loading ? '…' : confirmadas}</div>
          <div className="delta">próximas citas</div>
        </Card>
      </div>

      {/* Listado por fecha */}
      {loading ? (
        <Card style={{ padding: '40px 0', textAlign: 'center', color: 'var(--dc-fg-3)' }}>Cargando…</Card>
      ) : fechas.length === 0 ? (
        <Card style={{ padding: '40px 0', textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 14 }}>
          No hay citas en este período.
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fechas.map(fecha => (
            <Card key={fecha} flush>
              <div style={{ padding: '12px 18px', background: 'var(--dc-slate-50)', borderBottom: '1px solid var(--dc-border)', fontWeight: 700, fontSize: 13, color: 'var(--dc-fg-2)' }}>
                {fmtFecha(fecha)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {porFecha[fecha].map((c, i) => {
                  const est = ESTADO_COLOR[c.estado] || ESTADO_COLOR.pendiente;
                  return (
                    <div key={c.id} style={{
                      padding: '14px 18px',
                      borderBottom: i < porFecha[fecha].length - 1 ? '1px solid var(--dc-border)' : 'none',
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                      <div style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--dc-fg-2)', minWidth: 44, flexShrink: 0 }}>
                        {c.hora?.slice(0, 5)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{c.paciente_nombre}</div>
                        <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginTop: 2 }}>
                          {c.tratamiento || 'Sin tratamiento'}{c.notas ? ` · ${c.notas}` : ''}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        background: est.bg, color: est.color, flexShrink: 0,
                      }}>
                        {est.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Vista liquidación admin ───────────────────────────────────────────────────
const LiquidacionAdmin = ({ user, doctors }) => {
  const [periodoIdx, setPeriodoIdx] = useState(0);
  const [doctorId, setDoctorId]     = useState(doctors[0]?.id ?? null);
  const [citas, setCitas]           = useState([]);
  const [catalogo, setCatalogo]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [liquidado, setLiquidado]   = useState(false);
  const [liquidando, setLiquidando] = useState(false);

  const periodosLiquidacion = buildPeriodos();

  useEffect(() => {
    getCatalogo().then(setCatalogo).catch(console.error);
  }, []);

  useEffect(() => {
    if (doctors.length && !doctorId) setDoctorId(doctors[0].id);
  }, [doctors, doctorId]);

  const periodo = periodosLiquidacion[periodoIdx];

  useEffect(() => {
    if (!periodo) return;
    setLoading(true);
    getCitasCompletadas(periodo.start, periodo.end, doctorId || null)
      .then(setCitas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [periodoIdx, doctorId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLiquidado(false);
    if (!periodo || !doctorId) return;
    getLiquidacion(periodo.id, doctorId)
      .then(data => setLiquidado(data?.liquidado ?? false))
      .catch(() => {});
  }, [periodoIdx, doctorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLiquidar = async () => {
    if (!periodo || !doctorId) return;
    setLiquidando(true);
    try {
      await marcarLiquidacion(periodo.id, doctorId);
      setLiquidado(true);
    } catch (err) {
      console.error('Error al liquidar:', err);
      alert('No se pudo registrar la liquidación. Intenta de nuevo.');
    } finally {
      setLiquidando(false);
    }
  };

  const doctor   = doctors.find(d => d.id === doctorId);
  const docColor = doctor?.color || 'var(--dc-primary)';
  const pct      = Math.round((doctor?.comision ?? 0) * 100);

  const rows = citas.map(c => {
    const cat         = catalogo.find(t => t.tratamiento === c.tratamiento) || { precio: 0, material: 0 };
    const comisionPct = doctor?.comision ?? Number(c.doctores?.comision ?? 0);
    const precioBase  = Number(cat.precio);
    const material    = Number(cat.material);
    const comisionable = Math.max(0, precioBase - material);
    const comision    = Math.round(comisionable * comisionPct);
    return { id: c.id, fecha: c.fecha, paciente: c.paciente_nombre, tratamiento: c.tratamiento, precioBase, material, comisionable, comision };
  });

  const totalBruto    = rows.reduce((s, r) => s + r.precioBase,    0);
  const totalBase     = rows.reduce((s, r) => s + r.comisionable,  0);
  const totalComision = rows.reduce((s, r) => s + r.comision,      0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">Liquidación quincenal</h2>
          <p className="page-sub">{periodo?.label}{doctor ? ` · ${doctor.name}` : ''}</p>
        </div>
        <Button variant="secondary" icon={Icons.Download} onClick={() => window.print()}>
          Exportar PDF
        </Button>
      </div>

      {/* Filtros */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 10 }}>
              Período
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {periodosLiquidacion.map((p, i) => (
                <button key={p.id} onClick={() => setPeriodoIdx(i)} style={{
                  padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${periodoIdx === i ? 'var(--dc-primary)' : 'var(--dc-border)'}`,
                  background: periodoIdx === i ? 'var(--dc-primary)' : '#fff',
                  color: periodoIdx === i ? '#fff' : 'var(--dc-fg-2)',
                }}>
                  {i === 0 ? '★ ' : ''}{p.label}
                </button>
              ))}
            </div>
          </div>

          {doctors.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 10 }}>
                Doctor
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {doctors.map(d => (
                  <button key={d.id} onClick={() => setDoctorId(d.id)} style={{
                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    border: `1.5px solid ${doctorId === d.id ? d.color : 'var(--dc-border)'}`,
                    background: doctorId === d.id ? d.color : '#fff',
                    color: doctorId === d.id ? '#fff' : d.color,
                  }}>
                    {d.short} — {d.name.split(' ').slice(-1)[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* KPIs */}
      <div className="metric-grid" style={{ marginBottom: 20 }}>
        <Card className="metric-card">
          <div className="icon-pill" style={{ background: 'rgba(16,185,129,0.14)', color: '#047857' }}>
            <Icons.Wallet size={18} />
          </div>
          <div className="eyebrow">Total bruto</div>
          <div className="value" style={{ fontSize: 20, fontFamily: 'var(--dc-font-mono)' }}>
            {loading ? '…' : fmtBs(totalBruto)}
          </div>
          <div className="delta">{rows.length} citas completadas</div>
        </Card>
        <Card className="metric-card">
          <div className="icon-pill" style={{ background: `${docColor}22`, color: docColor }}>
            <Icons.TrendUp size={18} />
          </div>
          <div className="eyebrow">Base comisionable</div>
          <div className="value" style={{ fontSize: 20, fontFamily: 'var(--dc-font-mono)' }}>
            {loading ? '…' : fmtBs(totalBase)}
          </div>
          <div className="delta">precio − material</div>
        </Card>
        <Card className="metric-card">
          <div className="icon-pill" style={{ background: `${docColor}22`, color: docColor }}>
            <Icons.Receipt size={18} />
          </div>
          <div className="eyebrow">
            Comisión {doctor?.name?.split(' ').slice(-1)[0] ?? ''}
          </div>
          <div className="value" style={{ fontSize: 20, fontFamily: 'var(--dc-font-mono)', color: docColor }}>
            {loading ? '…' : fmtBs(totalComision)}
          </div>
          <div className="delta">{pct}% sobre base</div>
        </Card>
        <Card className="metric-card">
          <div className="icon-pill" style={{ background: 'rgba(59,130,246,0.14)', color: '#1D4ED8' }}>
            <Icons.CheckCircle size={18} />
          </div>
          <div className="eyebrow">Promedio por cita</div>
          <div className="value" style={{ fontSize: 20, fontFamily: 'var(--dc-font-mono)' }}>
            {rows.length > 0 ? fmtBs(Math.round(totalComision / rows.length)) : '—'}
          </div>
          <div className="delta">comisión / cita</div>
        </Card>
      </div>

      {/* Tabla detalle */}
      <Card flush>
        <CardHead title={doctor ? `Detalle · ${doctor.name} · ${periodo?.label}` : `Detalle · ${periodo?.label}`} />
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 14 }}>Cargando…</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 14 }}>
              No hay citas completadas en este período.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Paciente</th>
                  <th>Tratamiento</th>
                  <th style={{ textAlign: 'right' }}>Precio</th>
                  <th style={{ textAlign: 'right' }}>Material</th>
                  <th style={{ textAlign: 'right' }}>Comisionable</th>
                  <th style={{ textAlign: 'right' }}>Comisión</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {fmtFecha(r.fecha)}
                    </td>
                    <td style={{ fontWeight: 500 }}>{r.paciente}</td>
                    <td>{r.tratamiento}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontSize: 13 }}>{fmtBs(r.precioBase)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontSize: 13, color: 'var(--dc-fg-3)' }}>{fmtBs(r.material)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontSize: 13, fontWeight: 600 }}>{fmtBs(r.comisionable)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontSize: 13, fontWeight: 700, color: docColor }}>{fmtBs(r.comision)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--dc-border-strong)' }}>
                  <td colSpan={3} style={{ padding: '12px 16px', fontWeight: 700, fontSize: 13 }}>TOTAL</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontWeight: 700 }}>{fmtBs(totalBruto)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--dc-fg-3)' }}>—</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontWeight: 700 }}>{fmtBs(totalBase)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontWeight: 800, fontSize: 16, color: docColor }}>{fmtBs(totalComision)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </Card>

      {rows.length > 0 && (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="secondary" icon={Icons.Download} onClick={() => window.print()}>
            Exportar liquidación
          </Button>
          <Button icon={Icons.Check} onClick={handleLiquidar} disabled={liquidado || liquidando}>
            {liquidado ? 'Quincena liquidada ✓' : liquidando ? 'Guardando…' : 'Marcar quincena como liquidada'}
          </Button>
        </div>
      )}
    </div>
  );
};

// ── Exportación principal ─────────────────────────────────────────────────────
const Liquidacion = ({ user, doctors = [] }) => {
  if (user?.role === 'doctor') return <HistorialDoctor user={user} />;
  return <LiquidacionAdmin user={user} doctors={doctors} />;
};

export default Liquidacion;
