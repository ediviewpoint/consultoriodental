import { useState, useEffect } from 'react';
import { Icons } from '../icons';
import { Button, Badge, Progress, Field, Modal, fmtBs } from '../ui';
import { getPlanTratamiento, updatePasoEstado, createAbono } from '../../lib/db';

const ESTADO_CYCLE = ['pendiente', 'en-curso', 'completado'];

const Tratamientos = ({ patientId, user }) => {
  const [plan, setPlan]           = useState(null);
  const [pasos, setPasos]         = useState([]);
  const [abonos, setAbonos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [planModal, setPlanModal] = useState(false);
  const [saved, setSaved]         = useState(false);
  const [abonoModal, setAbonoModal] = useState(false);
  const [nuevoAbono, setNuevoAbono] = useState({ monto: '', metodo: 'efectivo', recibo: '' });
  const [abonoError, setAbonoError] = useState(false);
  const [savingAbono, setSavingAbono] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPlanTratamiento(patientId).then(data => {
      if (!data) { setLoading(false); return; }
      setPlan(data);
      setPasos(data.pasos.map(p => ({ ...p })));
      setAbonos(data.abonos || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 13 }}>Cargando plan de tratamiento…</div>;
  if (!plan)   return <div style={{ padding: 32, textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 13 }}>Sin plan de tratamiento registrado.</div>;

  const montoTotal = plan.montoTotal || pasos.reduce((s, p) => s + p.monto, 0);
  const pagado     = abonos.reduce((s, a) => s + a.monto, 0);
  const saldo      = Math.max(0, montoTotal - pagado);
  const progreso   = pasos.length ? Math.round((pasos.filter(p => p.estado === 'completado').length / pasos.length) * 100) : 0;

  const cycleEstado = async (paso) => {
    const idx  = ESTADO_CYCLE.indexOf(paso.estado);
    const next = ESTADO_CYCLE[(idx + 1) % ESTADO_CYCLE.length];
    try {
      await updatePasoEstado(paso._id, next);
      setPasos(prev => prev.map(p => p._id === paso._id ? { ...p, estado: next } : p));
    } catch (err) { console.error(err); }
  };

  const handleSavePlan = () => { setPlanModal(false); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const handleRegistrarAbono = async () => {
    const monto = Number(nuevoAbono.monto);
    if (!monto || monto <= 0) { setAbonoError(true); return; }
    setSavingAbono(true);
    try {
      await createAbono(plan.id, { monto, metodo: nuevoAbono.metodo, recibo: nuevoAbono.recibo.trim() }, user?.doctorId || null);
      setAbonos(prev => [...prev, {
        fecha:  new Date().toLocaleDateString('es-BO'),
        monto,
        metodo: nuevoAbono.metodo,
        recibo: nuevoAbono.recibo.trim() || null,
        doctor: '—',
      }]);
      setNuevoAbono({ monto: '', metodo: 'efectivo', recibo: '' });
      setAbonoError(false);
      setAbonoModal(false);
    } catch (err) { console.error(err); }
    finally { setSavingAbono(false); }
  };

  const METODO_LABEL = { efectivo: 'Efectivo', qr: 'QR Simple', transferencia: 'Transferencia' };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{plan.titulo}</h3>
          <div style={{ fontSize: 13, color: 'var(--dc-fg-3)', marginTop: 4 }}>Iniciado el {plan.inicio}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {saved && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dc-positive)' }}>✓ Guardado</span>}
          <Button variant="secondary" size="sm" icon={Icons.Edit} onClick={() => setPlanModal(true)}>Editar plan</Button>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Progreso de tratamientos</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--dc-primary)' }}>{progreso}% completado</span>
        </div>
        <Progress value={progreso} />
      </div>

      <table className="table" style={{ marginBottom: 20 }}>
        <thead>
          <tr><th style={{ width: 60 }}>Paso</th><th>Descripción</th><th style={{ textAlign: 'right' }}>Monto</th><th style={{ width: 160 }}>Estado</th></tr>
        </thead>
        <tbody>
          {pasos.map((p) => (
            <tr key={p._id}>
              <td style={{ fontWeight: 700, fontFamily: 'var(--dc-font-mono)' }}>0{p.n}</td>
              <td style={{ fontWeight: 500 }}>{p.descripcion}</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtBs(p.monto)}</td>
              <td>
                {p.estado === 'completado' && <Badge status="paid">✓ COMPLETADO</Badge>}
                {p.estado === 'en-curso'   && <Badge status="en-curso">EN CURSO</Badge>}
                {p.estado === 'pendiente'  && <Badge status="pendiente">PENDIENTE</Badge>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Resumen financiero */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, background: 'var(--dc-slate-50)', padding: 18, borderRadius: 12, marginBottom: 24 }}>
        <div><div style={{ fontSize: 11, color: 'var(--dc-fg-3)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total acordado</div><div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{fmtBs(montoTotal)}</div></div>
        <div><div style={{ fontSize: 11, color: 'var(--dc-fg-3)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pagado</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--dc-positive)', marginTop: 4 }}>{fmtBs(pagado)}</div></div>
        <div><div style={{ fontSize: 11, color: 'var(--dc-fg-3)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Saldo</div><div style={{ fontSize: 22, fontWeight: 700, color: saldo > 0 ? 'var(--dc-alert)' : 'var(--dc-positive)', marginTop: 4 }}>{fmtBs(saldo)}</div></div>
      </div>

      {/* Abonos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Abonos registrados</h4>
        <Button size="sm" icon={Icons.Plus} variant="secondary" onClick={() => setAbonoModal(true)}>
          Registrar abono
        </Button>
      </div>

      {abonos.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 13, background: 'var(--dc-slate-50)', borderRadius: 10 }}>
          Sin abonos registrados.
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Fecha</th><th style={{ textAlign: 'right' }}>Monto</th><th>Método</th><th>Recibo</th><th>Doctor</th></tr>
          </thead>
          <tbody>
            {abonos.map((a, i) => (
              <tr key={a._id || i}>
                <td style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 12 }}>{a.fecha}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--dc-positive)' }}>{fmtBs(a.monto)}</td>
                <td><span className="tag">{METODO_LABEL[a.metodo] || a.metodo}</span></td>
                <td>
                  {a.recibo
                    ? <span style={{ fontSize: 11, fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-fg-2)' }}>{a.recibo}</span>
                    : <span style={{ fontSize: 11, color: 'var(--dc-alert)' }}>⚠ sin recibo</span>
                  }
                </td>
                <td style={{ fontSize: 12, color: 'var(--dc-fg-3)' }}>{a.doctor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal editar plan */}
      <Modal open={planModal} onClose={() => setPlanModal(false)} title="Editar plan de tratamiento"
        footer={<><Button variant="secondary" onClick={() => setPlanModal(false)}>Cancelar</Button><Button onClick={handleSavePlan} icon={Icons.Check}>Guardar cambios</Button></>}
      >
        <div style={{ fontSize: 13, color: 'var(--dc-fg-3)', marginBottom: 16 }}>Clic en el estado para cambiarlo</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pasos.map((p) => (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--dc-slate-50)', borderRadius: 10 }}>
              <span style={{ fontWeight: 700, fontFamily: 'var(--dc-font-mono)', fontSize: 13, width: 24 }}>0{p.n}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{p.descripcion}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dc-fg-3)' }}>{fmtBs(p.monto)}</span>
              <button onClick={() => cycleEstado(p)} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                background: p.estado === 'completado' ? '#D1FAE5' : p.estado === 'en-curso' ? '#DBEAFE' : '#FEF9C3',
                color:      p.estado === 'completado' ? '#065F46' : p.estado === 'en-curso' ? '#1D4ED8' : '#92400E',
              }}>
                {p.estado === 'completado' ? '✓ Completado' : p.estado === 'en-curso' ? 'En curso' : 'Pendiente'}
              </button>
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal nuevo abono */}
      <Modal open={abonoModal} onClose={() => { setAbonoModal(false); setAbonoError(false); }} title="Registrar abono"
        footer={<>
          <Button variant="secondary" onClick={() => { setAbonoModal(false); setAbonoError(false); }}>Cancelar</Button>
          <Button icon={Icons.Check} onClick={handleRegistrarAbono} disabled={savingAbono}>
            {savingAbono ? 'Guardando…' : 'Registrar'}
          </Button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Monto (Bs.)">
            <input className={`input${abonoError ? ' input-error' : ''}`} type="number" min="0" value={nuevoAbono.monto} onChange={e => { setNuevoAbono(a => ({ ...a, monto: e.target.value })); setAbonoError(false); }} placeholder="0" style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 18, fontWeight: 700 }} />
          </Field>
          <Field label="Método de pago">
            <select className="select" value={nuevoAbono.metodo} onChange={e => setNuevoAbono(a => ({ ...a, metodo: e.target.value }))}>
              <option value="efectivo">Efectivo</option>
              <option value="qr">QR Simple</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </Field>
          <Field label="N° de recibo / comprobante">
            <input className="input" value={nuevoAbono.recibo} onChange={e => setNuevoAbono(a => ({ ...a, recibo: e.target.value }))} placeholder="EFV-XXXXX o N° comprobante QR" style={{ fontFamily: 'var(--dc-font-mono)' }} />
          </Field>
          <div style={{ padding: '10px 14px', background: 'var(--dc-slate-50)', borderRadius: 10, fontSize: 12, color: 'var(--dc-fg-2)' }}>
            Saldo actual: <strong>{fmtBs(saldo)}</strong> · Quedaría: <strong style={{ color: Math.max(0, saldo - (Number(nuevoAbono.monto) || 0)) > 0 ? 'var(--dc-alert)' : 'var(--dc-positive)' }}>{fmtBs(Math.max(0, saldo - (Number(nuevoAbono.monto) || 0)))}</strong>
          </div>
          {abonoError && (
            <div style={{ fontSize: 12, color: 'var(--dc-alert)', padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 6 }}>
              Ingresa un monto mayor a 0 para registrar el abono.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Tratamientos;
