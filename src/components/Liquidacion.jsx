import { useState, useEffect } from 'react';
import { Icons } from './icons';
import { Button, Card, CardHead, fmtBs } from './ui';
import { getCitasCompletadas, getCatalogo } from '../lib/db';

const pad = n => String(n).padStart(2, '0');
const MON_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

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
    const label = isSecond
      ? `16–${lastDay} ${MON_ES[month]} ${year}`
      : `1–15 ${MON_ES[month]} ${year}`;
    result.push({ id: `${year}-${month+1}-${isSecond?2:1}`, label, start, end, year, month, isSecond });
    if (isSecond) { isSecond = false; }
    else { isSecond = true; month--; if (month < 0) { month = 11; year--; } }
  }
  return result;
};

const PERIODOS = buildPeriodos();

const fmtFecha = iso =>
  new Date(iso + 'T00:00:00').toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });

const Liquidacion = ({ user, doctors = [] }) => {
  const isDoctor = user?.role === 'doctor';

  const [periodoIdx, setPeriodoIdx] = useState(0);
  const [doctorId, setDoctorId]     = useState(
    isDoctor ? user?.doctorId : (doctors[0]?.id ?? null)
  );
  const [citas, setCitas]       = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    getCatalogo().then(setCatalogo).catch(console.error);
  }, []);

  useEffect(() => {
    if (isDoctor) setDoctorId(user?.doctorId);
  }, [user, isDoctor]);

  useEffect(() => {
    if (!isDoctor && doctors.length && !doctorId) {
      setDoctorId(doctors[0].id);
    }
  }, [doctors, isDoctor, doctorId]);

  const periodo = PERIODOS[periodoIdx];

  useEffect(() => {
    if (!periodo) return;
    const target = isDoctor ? user?.doctorId : doctorId;
    setLoading(true);
    getCitasCompletadas(periodo.start, periodo.end, target || null)
      .then(setCitas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [periodoIdx, doctorId, user?.doctorId, isDoctor]); // eslint-disable-line react-hooks/exhaustive-deps

  const doctor = isDoctor
    ? doctors.find(d => d.id === user?.doctorId)
    : doctors.find(d => d.id === doctorId);

  const rows = citas.map(c => {
    const cat          = catalogo.find(t => t.tratamiento === c.tratamiento) || { precio: 0, material: 0 };
    const docComision  = doctor?.comision ?? Number(c.doctores?.comision ?? 0);
    const precioBase   = Number(cat.precio);
    const material     = Number(cat.material);
    const comisionable = Math.max(0, precioBase - material);
    const comision     = Math.round(comisionable * docComision);
    return { id: c.id, fecha: c.fecha, paciente: c.paciente_nombre, tratamiento: c.tratamiento, precioBase, material, comisionable, comision };
  });

  const totalBruto    = rows.reduce((s, r) => s + r.precioBase,    0);
  const totalBase     = rows.reduce((s, r) => s + r.comisionable,  0);
  const totalComision = rows.reduce((s, r) => s + r.comision,      0);
  const docColor      = doctor?.color || 'var(--dc-primary)';
  const pct           = Math.round((doctor?.comision ?? 0) * 100);

  // Resumen global por doctor (solo admin, período actual)
  const resumenDoctores = !isDoctor ? doctors.map(d => {
    const dc = catalogo;
    const citasDoc = citas.filter(c => c.doctor_id === d.id || c.doctores?.nombre === d.name);
    const comTotal = citasDoc.reduce((s, c) => {
      const cat = dc.find(t => t.tratamiento === c.tratamiento) || { precio: 0, material: 0 };
      return s + Math.round(Math.max(0, Number(cat.precio) - Number(cat.material)) * d.comision);
    }, 0);
    return { ...d, citasCount: citasDoc.length, comTotal };
  }) : [];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">{isDoctor ? 'Mis Ingresos' : 'Liquidación quincenal'}</h2>
          <p className="page-sub">
            {periodo?.label}
            {doctor ? ` · ${doctor.name}` : ''}
          </p>
        </div>
        <Button variant="secondary" icon={Icons.Download} onClick={() => window.print()}>
          Exportar PDF
        </Button>
      </div>

      {/* Selector de período */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 10 }}>
              Período
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PERIODOS.map((p, i) => (
                <button key={p.id} onClick={() => setPeriodoIdx(i)} style={{
                  padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${periodoIdx === i ? 'var(--dc-primary)' : 'var(--dc-border)'}`,
                  background: periodoIdx === i ? 'var(--dc-primary)' : '#fff',
                  color: periodoIdx === i ? '#fff' : 'var(--dc-fg-2)',
                  opacity: i === 0 ? 1 : i < 4 ? 0.9 : 0.7,
                }}>
                  {i === 0 ? '★ ' : ''}{p.label}
                </button>
              ))}
            </div>
          </div>

          {!isDoctor && (
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
            {isDoctor ? 'Mi comisión' : `Comisión ${doctor?.name?.split(' ').slice(-1)[0] ?? ''}`}
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

      {/* Resumen de todos los doctores (solo admin, cuando se cargan todas las citas) */}
      {!isDoctor && !doctorId && resumenDoctores.length > 0 && (
        <Card flush style={{ marginBottom: 20 }}>
          <CardHead title={`Resumen por doctor · ${periodo?.label}`} />
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th style={{ textAlign: 'right' }}>Citas</th>
                <th style={{ textAlign: 'right' }}>Comisión %</th>
                <th style={{ textAlign: 'right' }}>A pagar</th>
              </tr>
            </thead>
            <tbody>
              {resumenDoctores.map(d => (
                <tr key={d.id} onClick={() => setDoctorId(d.id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                      <span style={{ fontWeight: 600 }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>{d.citasCount}</td>
                  <td style={{ textAlign: 'right' }}>{Math.round(d.comision * 100)}%</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: d.color, fontFamily: 'var(--dc-font-mono)' }}>
                    {fmtBs(d.comTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Tabla de detalle */}
      <Card flush>
        <CardHead
          title={doctor
            ? `Detalle · ${doctor.name} · ${periodo?.label}`
            : `Detalle · ${periodo?.label}`}
        />
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 14 }}>
              Cargando…
            </div>
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
                    <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontSize: 13 }}>
                      {fmtBs(r.precioBase)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontSize: 13, color: 'var(--dc-fg-3)' }}>
                      {fmtBs(r.material)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontSize: 13, fontWeight: 600 }}>
                      {fmtBs(r.comisionable)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontSize: 13, fontWeight: 700, color: docColor }}>
                      {fmtBs(r.comision)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--dc-border-strong)' }}>
                  <td colSpan={3} style={{ padding: '12px 16px', fontWeight: 700, fontSize: 13 }}>TOTAL</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontWeight: 700 }}>
                    {fmtBs(totalBruto)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--dc-fg-3)' }}>—</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontWeight: 700 }}>
                    {fmtBs(totalBase)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontWeight: 800, fontSize: 16, color: docColor }}>
                    {fmtBs(totalComision)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </Card>

      {/* Acción liquidar */}
      {user?.role === 'admin' && rows.length > 0 && (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="secondary" icon={Icons.Download} onClick={() => window.print()}>
            Exportar liquidación
          </Button>
          <Button icon={Icons.Check}>
            Marcar quincena como liquidada
          </Button>
        </div>
      )}

      {user?.role === 'doctor' && rows.length > 0 && (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" icon={Icons.Download} onClick={() => window.print()}>
            Descargar detalle
          </Button>
        </div>
      )}
    </div>
  );
};

export default Liquidacion;
