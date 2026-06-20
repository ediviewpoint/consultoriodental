import { useState, useEffect } from 'react';
import { Icons } from './icons';
import { Button, Card, CardHead, Badge, Avatar, fmtBs } from './ui';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getDeudaViva, getCitasHoy, getIngresosHoy, getIngresosRango } from '../lib/db';

const fmtHora = (h) => {
  if (typeof h === 'string') return h.slice(0, 5);
  return `${String(Math.floor(h)).padStart(2,'0')}:${String(Math.round((h % 1) * 60)).padStart(2,'0')}`;
};

const getWeekBounds = () => {
  const now = new Date();
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return [mon.toISOString().slice(0, 10), sun.toISOString().slice(0, 10)];
};

const Dashboard = ({ onOpenPatient, onNavigate, user }) => {
  const [deudaViva, setDeudaViva]     = useState([]);
  const [citasHoy, setCitasHoy]       = useState([]);
  const [ingresosHoy, setIngresosHoy] = useState(0);
  const [weekChart, setWeekChart]     = useState([]);

  const isDoctor = user?.role === 'doctor';
  const ALERTS = []; // TODO: Fetch from db

  const todayLabel = new Date().toLocaleDateString('es-BO', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const [wMon, wSun] = getWeekBounds();
  const weekLabel = `${new Date(wMon + 'T12:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })} – ${new Date(wSun + 'T12:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  const weekTotal = weekChart.reduce((s, d) => s + d.y, 0);

  const citasCount        = citasHoy.length;
  const citasConfirmadas  = citasHoy.filter(c => c.estado === 'confirmada').length;
  const citasPendientes   = citasHoy.filter(c => ['pendiente', 'en-curso'].includes(c.estado)).length;
  const pacientesAtendidos = citasHoy.filter(c => c.estado === 'completada').length;

  const antiFugaCount      = 0;
  const sinRecibo          = 0;
  const projectedCommission = 0;

  const ALERT_COLOR = { info: 'var(--dc-primary)', warning: '#D97706', alert: 'var(--dc-alert)' };

  useEffect(() => {
    getCitasHoy(isDoctor ? user?.doctorId : null)
      .then(setCitasHoy)
      .catch(() => setCitasHoy([]));

    if (!isDoctor) {
      getDeudaViva().then(setDeudaViva).catch(() => setDeudaViva([]));
      getIngresosHoy().then(setIngresosHoy).catch(() => {});
      const [mon, sun] = getWeekBounds();
      getIngresosRango(mon, sun).then(setWeekChart).catch(() => {});
    }
  }, [isDoctor, user?.doctorId]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">{isDoctor ? `Panel Médico · ${user.name}` : 'Panel principal'}</h2>
          <p className="page-sub">{todayLabel} · Suc. A Benjer &amp; Suc. B BRISA</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" icon={Icons.Calendar} onClick={() => onNavigate('agenda')}>
            Ver agenda
          </Button>
          {!isDoctor && (
            <Button icon={Icons.Plus} onClick={() => onNavigate('admision')}>
              Nuevo paciente
            </Button>
          )}
        </div>
      </div>

      {/* Anti-fuga banner (Oculto para doctores) */}
      {antiFugaCount > 0 && !isDoctor && (
        <div
          style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={() => onNavigate('liquidacion')}
        >
          <Icons.AlertCircle size={18} style={{ color: '#DC2626', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#DC2626' }}>
              Caja — {antiFugaCount} irregularidad{antiFugaCount !== 1 ? 'es' : ''} detectada{antiFugaCount !== 1 ? 's' : ''}
            </span>
            {sinRecibo > 0 && (
              <span style={{ fontSize: 12, color: '#B91C1C', marginLeft: 10 }}>
                {sinRecibo} tratamiento{sinRecibo !== 1 ? 's' : ''} sin recibo
              </span>
            )}
          </div>
          <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 600, flexShrink: 0 }}>Ver liquidación →</span>
        </div>
      )}

      {/* KPIs */}
      <div className="metric-grid">
        <Card className="metric-card">
          <div className="icon-pill"><Icons.Users size={18} /></div>
          <div className="eyebrow">{isDoctor ? 'Mis Pacientes Hoy' : 'Pacientes hoy'}</div>
          <div className="value">{citasCount}</div>
          <div className="delta">{pacientesAtendidos} atendidos · {citasPendientes} pendientes</div>
        </Card>
        <Card className="metric-card">
          <div className="icon-pill" style={{ background: 'rgba(59,130,246,0.14)', color: '#1D4ED8' }}>
            <Icons.Calendar size={18} />
          </div>
          <div className="eyebrow">Citas confirmadas</div>
          <div className="value">{citasConfirmadas}</div>
          <div className="delta">{citasPendientes > 0 ? `${citasPendientes} por confirmar` : 'Todas confirmadas'}</div>
        </Card>
        
        {/* Métricas financieras ocultas para doctores */}
        {!isDoctor ? (
          <>
            <Card className="metric-card">
              <div className="icon-pill" style={{ background: 'rgba(16,185,129,0.14)', color: '#047857' }}>
                <Icons.Wallet size={18} />
              </div>
              <div className="eyebrow">Ingresos del día</div>
              <div className="value" style={{ fontSize: 20, fontFamily: 'var(--dc-font-mono)' }}>
                {fmtBs(ingresosHoy)}
              </div>
              <div className="delta up">{ingresosHoy > 0 ? 'Ingresos registrados hoy' : 'Sin cobros registrados hoy'}</div>
            </Card>
            <Card className="metric-card">
              <div className="icon-pill" style={{
                background: antiFugaCount > 0 ? 'rgba(220,38,38,0.14)' : 'rgba(16,185,129,0.14)',
                color: antiFugaCount > 0 ? '#B91C1C' : '#047857',
              }}>
                <Icons.Receipt size={18} />
              </div>
              <div className="eyebrow">Control de caja</div>
              <div className="value" style={{ color: antiFugaCount > 0 ? 'var(--dc-alert)' : 'var(--dc-positive)' }}>
                {antiFugaCount > 0 ? antiFugaCount : '✓'}
              </div>
              <div className={`delta ${antiFugaCount > 0 ? 'down' : ''}`}>
                {antiFugaCount > 0 ? `${sinRecibo} sin recibo` : 'Sin irregularidades'}
              </div>
            </Card>
          </>
        ) : (
          <Card className="metric-card">
            <div className="icon-pill" style={{ background: 'rgba(13, 148, 136, 0.14)', color: '#0D9488' }}>
              <Icons.TrendUp size={18} />
            </div>
            <div className="eyebrow">Proyección Comisión</div>
            <div className="value" style={{ fontSize: 20, fontFamily: 'var(--dc-font-mono)' }}>{fmtBs(projectedCommission)}</div>
            <div className="delta">{new Date().toLocaleDateString('es-BO', { month: 'long', year: 'numeric' })}</div>
          </Card>
        )}
      </div>

      {/* Main grid */}
      <div className="grid-2" style={{ marginBottom: 22 }}>
        {/* Agenda hoy */}
        <Card flush>
          <CardHead
            title={isDoctor ? 'Mi Agenda de Hoy' : 'Agenda de hoy'}
            action={
              <Button variant="ghost" size="sm" onClick={() => onNavigate('agenda')}>Ver semana →</Button>
            }
          />
          {citasHoy.length === 0 ? (
            <div className="empty-state">Sin citas registradas para hoy.</div>
          ) : (
            <div>
              {citasHoy.map((a, i) => (
                <div
                  key={i}
                  className="agenda-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onNavigate('agenda')}
                >
                  <div style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 12, color: 'var(--dc-fg-3)', width: 44, flexShrink: 0 }}>
                    {fmtHora(a.hora)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.paciente}</div>
                    <div style={{ fontSize: 11, color: 'var(--dc-fg-3)' }}>
                      {a.tratamiento} {!isDoctor && `· ${a.doctor}`}
                    </div>
                  </div>
                  <Badge status={a.estado} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Bar chart (Oculto para doctores) */}
        {!isDoctor ? (
          <Card>
            <div style={{ padding: '18px 18px 0' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>Ingresos semanales</h3>
              <div style={{ fontSize: 12, color: 'var(--dc-fg-3)' }}>
                {weekLabel} · {fmtBs(weekTotal)} total
              </div>
            </div>
            <div style={{ padding: '16px 8px 8px' }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weekChart} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <XAxis
                    dataKey="x" axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'var(--dc-font-mono)' }}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v) => [`Bs. ${v.toLocaleString('es-BO')}`, 'Ingresos']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--dc-border)' }}
                  />
                  <Bar dataKey="y" radius={[4, 4, 0, 0]}>
                    {weekChart.map((entry, i) => (
                      <Cell key={i} fill={entry.y > 0 ? '#0D9488' : '#E2E8F0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ) : (
          <Card>
            <div style={{ padding: '18px 18px 0' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>Notificaciones de Clínica</h3>
            </div>
            <div style={{ padding: 18, fontSize: 13, color: 'var(--dc-fg-3)' }}>
              <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                <Icons.AlertCircle size={16} style={{ color: 'var(--dc-primary)' }} />
                <span>Reunión de equipo este viernes a las 14:00 hrs.</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Icons.CheckCircle size={16} style={{ color: '#047857' }} />
                <span>Nuevos insumos de resina 3M recibidos en el almacén.</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Alerts (Oculto para doctores, solo avisos clínicos) */}
      {!isDoctor && (
        <Card flush>
          <CardHead title="Avisos y alertas" />
          {ALERTS.length === 0 && <div className="empty-state">No hay avisos pendientes.</div>}
          {ALERTS.map((a, i) => (
            <div
              key={i}
              className="alert-row"
              style={{ cursor: 'pointer' }}
              onClick={() => a.navOpts ? onNavigate(a.nav, a.navOpts) : onNavigate(a.nav)}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 2, background: ALERT_COLOR[a.tipo] || 'var(--dc-primary)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="a-msg">{a.mensaje}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation();
                a.navOpts ? onNavigate(a.nav, a.navOpts) : onNavigate(a.nav);
              }}>
                {a.accion} →
              </Button>
            </div>
          ))}
        </Card>
      )}

      {/* Deuda viva (solo admin) */}
      {!isDoctor && deudaViva.length > 0 && (
        <Card flush style={{ marginTop: 22 }}>
          <CardHead
            title={`Deuda viva — ${deudaViva.length} paciente${deudaViva.length !== 1 ? 's' : ''}`}
            action={
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--dc-alert)', fontFamily: 'var(--dc-font-mono)' }}>
                Total: {fmtBs(deudaViva.reduce((s, d) => s + d.saldo, 0))}
              </span>
            }
          />
          {deudaViva.slice(0, 6).map((d, i) => (
            <div key={d.planId} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 22px', borderBottom: i < Math.min(deudaViva.length, 6) - 1 ? '1px solid var(--dc-divider)' : 'none',
            }}>
              <Avatar initials={d.avatar} color={d.avatarColor} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.paciente}</div>
                <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginTop: 2 }}>{d.titulo}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-alert)' }}>{fmtBs(d.saldo)}</div>
                <div style={{ fontSize: 11, color: 'var(--dc-fg-3)' }}>de {fmtBs(d.montoTotal)}</div>
              </div>
              {d.tel && (
                <Button variant="secondary" size="sm" icon={Icons.WhatsApp}
                  onClick={() => {
                    const msg = encodeURIComponent(
                      `Estimado/a ${d.paciente.split(' ')[0]}, le recordamos que tiene un saldo pendiente de *${fmtBs(d.saldo)}* en DentalCare Pro correspondiente a: _${d.titulo}_.\n\nPuede comunicarse con nosotros para coordinar el pago. ¡Gracias! 🦷`
                    );
                    window.open(`https://wa.me/591${d.tel.replace(/\s/g, '')}?text=${msg}`, '_blank');
                  }}
                />
              )}
            </div>
          ))}
          {deudaViva.length > 6 && (
            <div style={{ padding: '12px 22px', fontSize: 13, color: 'var(--dc-fg-3)', borderTop: '1px solid var(--dc-divider)', textAlign: 'center' }}>
              +{deudaViva.length - 6} paciente{deudaViva.length - 6 !== 1 ? 's' : ''} más con saldo pendiente
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
