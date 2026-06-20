import { useState } from 'react';
import DC_DATA from './data';
import { Icons } from './icons';
import { Button, Card, CardHead, Progress, fmtBs } from './ui';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const CONS_FACTOR = { todos: 1, A: 0.55, B: 0.45 };
const CONS_LABEL  = {
  todos: 'Ambos consultorios',
  A: `Consultorio A · ${DC_DATA.DOCTORS[0]?.name || 'Doctor A'}`,
  B: `Consultorio B · ${DC_DATA.DOCTORS[1]?.name || 'Doctor B'}`,
};

const Reportes = ({ consultorio: consGlobal }) => {
  const D = DC_DATA;
  const [periodo, setPeriodo] = useState('mayo');
  const [cons,    setCons]    = useState('todos');

  const rp  = D.REPORT_PERIODS[periodo] || D.REPORT_PERIODS.mayo;
  const fac = CONS_FACTOR[cons];

  const metrics = {
    ingresos:       Math.round(rp.ingresos     * fac),
    pacientes:      Math.round(rp.pacientes    * fac),
    tratamientos:   Math.round(rp.tratamientos * fac),
    canceladas:     Math.round(rp.canceladas   * fac),
  };

  const chartData = rp.chart.map(d => ({ ...d, y: Math.round(d.y * fac) }));
  const hasChart  = chartData.some(d => d.y > 0);

  const tableData = [
    { cons: 'A', label: 'Consultorio A', doctor: DC_DATA.DOCTORS[0]?.name || 'Doctor A', ingr: Math.round(metrics.ingresos * 0.55 / 0.55 * 0.55), pac: Math.round(metrics.pacientes * 0.59), pct: 55 },
    { cons: 'B', label: 'Consultorio B', doctor: DC_DATA.DOCTORS[1]?.name || 'Doctor B', ingr: Math.round(metrics.ingresos * 0.45 / 0.55 * 0.45), pac: Math.round(metrics.pacientes * 0.41), pct: 45 },
  ].filter(r => cons === 'todos' || r.cons === cons);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">Reportes</h2>
          <p className="page-sub">{rp.label} · {CONS_LABEL[cons]}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="select" value={periodo} onChange={e => setPeriodo(e.target.value)} style={{ width: 'auto' }}>
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mayo">Este mes</option>
            <option value="trimestre">Este trimestre</option>
            <option value="2025">2025</option>
          </select>
          <select className="select" value={cons} onChange={e => setCons(e.target.value)} style={{ width: 'auto' }}>
            <option value="todos">Todos los consultorios</option>
            <option value="A">Consultorio A</option>
            <option value="B">Consultorio B</option>
          </select>
          <Button variant="secondary" icon={Icons.Download} onClick={() => window.print()}>Exportar</Button>
        </div>
      </div>

      <div className="metric-grid">
        <Card className="metric-card">
          <div className="icon-pill" style={{ background: 'rgba(16,185,129,0.14)', color: '#047857' }}><Icons.Wallet size={18} /></div>
          <div className="eyebrow">Ingresos</div>
          <div className="value">{fmtBs(metrics.ingresos)}</div>
          <div className="delta up">{rp.deltaIngr}</div>
        </Card>
        <Card className="metric-card">
          <div className="icon-pill"><Icons.Users size={18} /></div>
          <div className="eyebrow">Pacientes atendidos</div>
          <div className="value">{metrics.pacientes}</div>
          <div className="delta up">{rp.deltaPac}</div>
        </Card>
        <Card className="metric-card">
          <div className="icon-pill" style={{ background: 'rgba(59,130,246,0.14)', color: '#1D4ED8' }}><Icons.CheckCircle size={18} /></div>
          <div className="eyebrow">Tratamientos completados</div>
          <div className="value">{metrics.tratamientos}</div>
          <div className="delta">{metrics.tratamientos > 0 ? `${(((metrics.tratamientos - metrics.canceladas) / metrics.tratamientos) * 100).toFixed(1)}% tasa de éxito` : '—'}</div>
        </Card>
        <Card className="metric-card">
          <div className="icon-pill" style={{ background: 'rgba(248,113,113,0.14)', color: '#B91C1C' }}><Icons.X size={18} /></div>
          <div className="eyebrow">Citas canceladas</div>
          <div className="value">{metrics.canceladas}</div>
          <div className="delta down">{metrics.canceladas > 0 ? 'Requiere atención' : 'Sin cancelaciones'}</div>
        </Card>
      </div>

      <div className="grid-2" style={{ marginBottom: 22 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{rp.chartLabel}</h3>
              <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginTop: 2 }}>{rp.chartSub}</div>
            </div>
          </div>
          {hasChart ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#0D9488" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0D9488" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="x" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'var(--dc-font-mono)' }} />
                <YAxis hide />
                <Tooltip
                  formatter={v => [`Bs. ${v.toLocaleString('es-BO')}`, 'Ingresos']}
                  cursor={{ stroke: '#0D9488', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
                />
                <Area type="monotone" dataKey="y" stroke="#0D9488" strokeWidth={2.5} fill="url(#rev-grad)"
                  dot={false} activeDot={{ r: 3, fill: '#0D9488', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dc-fg-3)', fontSize: 13 }}>
              Sin datos para el período seleccionado
            </div>
          )}
        </Card>

        <Card>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Tratamientos por tipo</h3>
          <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginTop: 2, marginBottom: 18 }}>Distribución de {metrics.tratamientos} tratamientos</div>
          <div className="donut-wrap">
            <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
              <PieChart width={180} height={180}>
                <Pie data={D.TREATMENT_TYPES} dataKey="pct" cx={90} cy={90}
                  innerRadius={59} outerRadius={81} strokeWidth={0} startAngle={90} endAngle={-270}
                >
                  {D.TREATMENT_TYPES.map((t, i) => <Cell key={i} fill={t.color} />)}
                </Pie>
              </PieChart>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>{metrics.tratamientos}</div>
                <div style={{ fontSize: 10, color: '#64748B', letterSpacing: '0.1em', marginTop: 3, fontFamily: 'var(--dc-font-mono)' }}>TRATAMIENTOS</div>
              </div>
            </div>
            <div className="donut-legend">
              {D.TREATMENT_TYPES.map(t => (
                <div key={t.name} className="l">
                  <span className="d" style={{ background: t.color }} />
                  <span>{t.name}</span>
                  <span className="pct">{t.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {cons === 'todos' && (
        <Card flush>
          <CardHead title="Comparativa consultorios" />
          <table className="table">
            <thead>
              <tr>
                <th>Consultorio</th>
                <th style={{ textAlign: 'right' }}>Ingresos</th>
                <th style={{ textAlign: 'right' }}>Pacientes</th>
                <th style={{ textAlign: 'right' }}>Promedio/paciente</th>
                <th>Doctor a cargo</th>
                <th style={{ width: 180 }}>Participación</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(r => (
                <tr key={r.cons}>
                  <td><span className={`tag${r.cons === 'A' ? ' tag-solid' : ''}`}>{r.cons}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 15 }}>{fmtBs(r.ingr)}</td>
                  <td style={{ textAlign: 'right' }}>{r.pac}</td>
                  <td style={{ textAlign: 'right', color: 'var(--dc-fg-2)' }}>{r.pac > 0 ? fmtBs(Math.round(r.ingr / r.pac)) : '—'}</td>
                  <td><span style={{ fontWeight: 500 }}>{r.doctor}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Progress value={r.pct} />
                      <span style={{ fontSize: 12, fontWeight: 700, width: 36, textAlign: 'right' }}>{r.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default Reportes;
