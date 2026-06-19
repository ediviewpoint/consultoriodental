import { useState, useEffect } from 'react';
import DC_DATA from './data';
import { Icons } from './icons';
import { Button, Card, CardHead, fmtBs } from './ui';

const ALERTA_STYLES = {
  'sin-recibo':       { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', label: 'Sin recibo',          Icon: Icons.X             },
  'precio-bajo':      { bg: '#FFFBEB', border: '#FDE68A', color: '#B45309', label: 'Precio bajo catálogo', Icon: Icons.AlertTriangle },
  'salto-numeracion': { bg: '#FFF7ED', border: '#FED7AA', color: '#EA580C', label: 'Salto en numeración',  Icon: Icons.AlertCircle   },
};

const PERIODOS = [
  { id: 'q1', label: '1–15 jun 2025'  },
  { id: 'q2', label: '16–30 jun 2025' },
];

const Liquidacion = ({ user }) => {
  const [doctorId, setDoctorId] = useState(user?.role === 'doctor' ? user.doctorId : 'r');
  const [periodo,  setPeriodo]  = useState('q1');

  // Si el usuario es un doctor, forzar su ID
  useEffect(() => {
    if (user?.role === 'doctor') {
      setDoctorId(user.doctorId);
    }
  }, [user]);

  const doctor = DC_DATA.DOCTORS.find(d => d.id === doctorId) || DC_DATA.DOCTORS[0];
  const rows   = DC_DATA.LIQUIDACION_SAMPLE.rows.filter(r => r.doctorId === doctorId);

  const totalBruto    = rows.reduce((s, r) => s + r.precioBase,    0);
  const totalBase     = rows.reduce((s, r) => s + r.comisionable,  0);
  const totalComision = rows.reduce((s, r) => s + r.comision,      0);
  const alertCount    = rows.filter(r => r.alerta).length;
  const sinRecibo     = rows.filter(r => r.alerta === 'sin-recibo').length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">{user?.role === 'doctor' ? 'Mis Ingresos y Liquidación' : 'Liquidación quincenal'}</h2>
          <p className="page-sub">Control de caja central · anti-fuga de ingresos</p>
        </div>
        <Button variant="secondary" icon={Icons.Download}>Exportar PDF</Button>
      </div>

      {/* Filtros */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: '14px 18px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 8 }}>Período</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {PERIODOS.map(p => (
                <button key={p.id} onClick={() => setPeriodo(p.id)} style={{
                  padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${periodo === p.id ? 'var(--dc-primary)' : 'var(--dc-border)'}`,
                  background: periodo === p.id ? 'var(--dc-primary)' : '#fff',
                  color: periodo === p.id ? '#fff' : 'var(--dc-fg-2)',
                }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {user?.role !== 'doctor' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 8 }}>Doctor</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {DC_DATA.DOCTORS.map(d => (
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

      {/* Banner irregularidades */}
      {alertCount > 0 && user?.role !== 'doctor' && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icons.AlertCircle size={20} style={{ color: '#DC2626', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#DC2626' }}>
              {alertCount} irregularidad{alertCount > 1 ? 'es' : ''} detectada{alertCount > 1 ? 's' : ''}
            </span>
            {sinRecibo > 0 && (
              <span style={{ fontSize: 12, color: '#B91C1C', marginLeft: 10 }}>
                {sinRecibo} sin recibo · resuelve antes de liquidar
              </span>
            )}
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="metric-grid" style={{ marginBottom: 20 }}>
        <Card className="metric-card">
          <div className="icon-pill"><Icons.Wallet size={18} /></div>
          <div className="eyebrow">Total bruto</div>
          <div className="value" style={{ fontSize: 20, fontFamily: 'var(--dc-font-mono)' }}>{fmtBs(totalBruto)}</div>
          <div className="delta">{rows.length} tratamientos</div>
        </Card>
        <Card className="metric-card">
          <div className="icon-pill" style={{ background: `${doctor.color}22`, color: doctor.color }}>
            <Icons.TrendUp size={18} />
          </div>
          <div className="eyebrow">Base comisionable</div>
          <div className="value" style={{ fontSize: 20, fontFamily: 'var(--dc-font-mono)' }}>{fmtBs(totalBase)}</div>
          <div className="delta">precio − material</div>
        </Card>
        <Card className="metric-card">
          <div className="icon-pill" style={{ background: `${doctor.color}22`, color: doctor.color }}>
            <Icons.Receipt size={18} />
          </div>
          <div className="eyebrow">{user?.role === 'doctor' ? 'Mi Comisión' : `Comisión ${doctor.name.split(' ').slice(-1)[0]}`}</div>
          <div className="value" style={{ fontSize: 20, fontFamily: 'var(--dc-font-mono)', color: doctor.color }}>{fmtBs(totalComision)}</div>
          <div className="delta">{Math.round(doctor.comision * 100)}% sobre base</div>
        </Card>
        
        {user?.role !== 'doctor' && (
          <Card className="metric-card">
            <div className="icon-pill" style={{ background: alertCount > 0 ? 'rgba(220,38,38,0.14)' : 'rgba(16,185,129,0.14)', color: alertCount > 0 ? '#B91C1C' : '#047857' }}>
              <Icons.AlertCircle size={18} />
            </div>
            <div className="eyebrow">Alertas</div>
            <div className="value" style={{ color: alertCount > 0 ? 'var(--dc-alert)' : 'var(--dc-positive)' }}>
              {alertCount > 0 ? alertCount : '✓'}
            </div>
            <div className={`delta ${alertCount > 0 ? 'down' : ''}`}>
              {alertCount > 0 ? `${sinRecibo} sin recibo` : 'Todo en orden'}
            </div>
          </Card>
        )}
      </div>

      {/* Tabla */}
      <Card flush>
        <CardHead title={`Detalle · ${doctor.name} · ${PERIODOS.find(p => p.id === periodo)?.label}`} />
        <div style={{ overflowX: 'auto' }}>
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
                <th>Recibo en Caja</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const al = r.alerta && user?.role !== 'doctor' ? ALERTA_STYLES[r.alerta] : null;
                return (
                  <tr key={r.id} style={al ? { background: al.bg } : {}}>
                    <td style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 12, whiteSpace: 'nowrap' }}>{r.fecha}</td>
                    <td style={{ fontWeight: 500 }}>{r.paciente}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span>{r.tratamiento}</span>
                        {al && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: al.bg, color: al.color, border: `1px solid ${al.border}`, flexShrink: 0 }}>
                            <al.Icon size={10} />{al.label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontSize: 13 }}>{fmtBs(r.precioBase)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontSize: 13, color: 'var(--dc-fg-3)' }}>{fmtBs(r.material)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontSize: 13, fontWeight: 600 }}>{fmtBs(r.comisionable)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontSize: 13, fontWeight: 700, color: doctor.color }}>{fmtBs(r.comision)}</td>
                    <td>
                      {r.recibo
                        ? <span style={{ fontSize: 11, fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-positive)', fontWeight: 600 }}>{r.recibo}</span>
                        : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#DC2626', fontWeight: 600 }}><Icons.X size={11} />sin recibo</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--dc-border-strong)' }}>
                <td colSpan={3} style={{ padding: '12px 16px', fontWeight: 700, fontSize: 13 }}>TOTAL</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontWeight: 700 }}>{fmtBs(totalBruto)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--dc-fg-3)' }}>—</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontWeight: 700 }}>{fmtBs(totalBase)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--dc-font-mono)', fontWeight: 800, fontSize: 16, color: doctor.color }}>{fmtBs(totalComision)}</td>
                <td style={{ padding: '12px 16px' }}>
                  {alertCount > 0 && user?.role !== 'doctor' && <span style={{ color: '#DC2626', fontSize: 12, fontWeight: 700 }}>{alertCount} alerta{alertCount > 1 ? 's' : ''}</span>}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Acción liquidar (Solo Admin) */}
      {user?.role === 'admin' && (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="secondary" icon={Icons.Download}>Exportar liquidación</Button>
          <Button icon={Icons.Check} disabled={alertCount > 0}>
            {alertCount > 0 ? `Resolver ${alertCount} alerta${alertCount > 1 ? 's' : ''} para liquidar` : 'Aprobar y liquidar'}
          </Button>
        </div>
      )}
      
      {/* Acción descargar (Doctor) */}
      {user?.role === 'doctor' && (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="secondary" icon={Icons.Download}>Descargar detalle</Button>
        </div>
      )}
    </div>
  );
};

export default Liquidacion;
