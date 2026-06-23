import { useState, useEffect, useRef } from 'react';
import { BANCOS } from '../lib/constants';
import { Icons } from './icons';
import { Button, Card, Avatar, Field, fmtBs, fmtBs2 } from './ui';
import { getPlanTratamiento, createPago, createAbono } from '../lib/db';

const loadQRImages = () => { try { return JSON.parse(localStorage.getItem('dc_qr_bancos') || '{}'); } catch { return {}; } };

// ── Pad de firma ──────────────────────────────────────────────────────────────
const SignaturePad = () => {
  const ref = useRef(null);
  const drawing = useRef(false);
  const last    = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width  = rect.width  * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 2;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  }, []);

  const getXY = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const ev   = e.touches ? e.touches[0] : e;
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  };
  const start = (e) => { drawing.current = true; last.current = getXY(e); };
  const move  = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const { x, y } = getXY(e);
    const ctx = ref.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(x, y); ctx.stroke();
    last.current = { x, y };
  };
  const end   = () => { drawing.current = false; };
  const clear = () => { const c = ref.current; c.getContext('2d').clearRect(0, 0, c.width, c.height); };

  return (
    <div>
      <canvas ref={ref} className="signature-canvas"
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--dc-fg-3)' }}>Firme con el dedo o mouse</span>
        <button onClick={clear} style={{ background: 'none', border: 'none', color: 'var(--dc-fg-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Limpiar</button>
      </div>
    </div>
  );
};

// ── QR visual de respaldo ─────────────────────────────────────────────────────
const QrMatrix = ({ size = 190 }) => (
  <div style={{ width: size, height: size, display: 'grid', gridTemplateColumns: 'repeat(21,1fr)', background: '#fff' }}>
    {Array.from({ length: 441 }).map((_, i) => {
      const r = Math.floor(i / 21), c = i % 21;
      const corner = (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
      if (corner) {
        const rr = r > 13 ? r - 14 : r, cc = c > 13 ? c - 14 : c;
        return <span key={i} style={{ background: (rr===0||rr===6||cc===0||cc===6||(rr>=2&&rr<=4&&cc>=2&&cc<=4)) ? '#0F172A' : '#fff' }} />;
      }
      return <span key={i} style={{ background: ((r*17+c*31+r*c)%7)<3 ? '#0F172A' : '#fff' }} />;
    })}
  </div>
);

// ── Panel QR Simple ───────────────────────────────────────────────────────────
const QrPanel = ({ monto, onConfirm, onNavigateConfig }) => {
  const [bancoSel, setBancoSel]       = useState(null);
  const [fase, setFase]               = useState('esperando');
  const [pulse, setPulse]             = useState(true);
  const [comprobante, setComprobante] = useState('');
  const [warnComp, setWarnComp]       = useState(false);
  const qrImages = loadQRImages();

  useEffect(() => {
    if (fase === 'esperando') {
      const t = setInterval(() => setPulse(p => !p), 900);
      return () => clearInterval(t);
    }
  }, [fase]);

  const handleConfirm = () => {
    if (!comprobante.trim()) setWarnComp(true);
    setFase('recibido');
    setTimeout(() => onConfirm({ banco: bancoSel, comprobante: comprobante.trim() || null }), 900);
  };

  const realQR = bancoSel ? qrImages[bancoSel] : null;
  const anyQR  = Object.keys(qrImages).length > 0;

  return (
    <div className="qr-panel">
      <div className="qr-header">
        <div className="qr-header-brand">
          <div className="qr-simple-dot" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--dc-fg-1)', letterSpacing: '-0.01em' }}>QR Simple</div>
            <div style={{ fontSize: 11, color: 'var(--dc-fg-3)' }}>BCB · Interoperable Bolivia</div>
          </div>
        </div>
        <div className="qr-amount-badge">{fmtBs2(monto)}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dc-fg-4)', marginBottom: 10 }}>
          ¿Con qué app pagó el paciente?
        </div>
        <div className="banco-grid">
          {BANCOS.map(b => (
            <button key={b.id} className={`banco-pill ${bancoSel === b.id ? 'active' : ''}`}
              style={{ background: bancoSel === b.id ? b.color : b.bg, color: bancoSel === b.id ? '#fff' : b.color, borderColor: bancoSel === b.id ? b.color : 'transparent' }}
              onClick={() => setBancoSel(bancoSel === b.id ? null : b.id)} title={b.name}>
              {b.short}
            </button>
          ))}
        </div>
        <div className="banco-sel-hint">
          {bancoSel
            ? <><span style={{ width: 8, height: 8, borderRadius: '50%', background: BANCOS.find(b=>b.id===bancoSel)?.color, flexShrink: 0 }} />Pagando con <strong>{BANCOS.find(b=>b.id===bancoSel)?.name}</strong></>
            : <span style={{ color: 'var(--dc-fg-4)' }}>Selecciona el banco del paciente (opcional pero recomendado)</span>
          }
        </div>
      </div>

      <div className={`qr-code-wrap ${fase === 'recibido' ? 'confirmed' : ''}`}>
        {fase === 'recibido' ? (
          <div className="qr-confirmed-overlay">
            <div className="qr-check-anim"><Icons.CheckCircle size={52} /></div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#047857', marginTop: 10 }}>¡Pago recibido!</div>
          </div>
        ) : realQR ? (
          <img src={realQR} alt={`QR ${BANCOS.find(b=>b.id===bancoSel)?.name}`} className="qr-real-img" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <QrMatrix size={190} />
            {bancoSel && !anyQR && (
              <div className="qr-upload-hint">
                <Icons.AlertTriangle size={12} />
                <button onClick={onNavigateConfig} className="qr-hint-link">Sube el QR real en Configuración</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="qr-status-row">
        <span className={`qr-status-dot ${pulse ? 'on' : 'off'}`} />
        <span style={{ fontSize: 13, color: 'var(--dc-fg-2)', fontWeight: 500 }}>
          {fase === 'recibido' ? 'Pago confirmado' : 'Esperando que el paciente escanee…'}
        </span>
      </div>

      <div className="comprobante-section">
        <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', display: 'block', marginBottom: 8 }}>
          N° de comprobante del paciente
        </label>
        <input
          className="input"
          placeholder="Ej: 20260527123456789"
          value={comprobante}
          onChange={e => { setComprobante(e.target.value); if (e.target.value) setWarnComp(false); }}
          style={{ fontFamily: 'var(--dc-font-mono)', letterSpacing: '0.02em' }}
        />
        {warnComp
          ? <div className="comprobante-warn"><Icons.AlertTriangle size={13} />Sin comprobante será difícil verificar este pago si hay disputas</div>
          : <div style={{ fontSize: 11, color: 'var(--dc-fg-4)', marginTop: 6 }}>El paciente recibe este número en su app bancaria al confirmar el pago</div>
        }
      </div>

      <Button block icon={Icons.CheckCircle} onClick={handleConfirm} disabled={fase === 'recibido'} style={{ marginTop: 12 }}>
        Confirmar pago recibido
      </Button>
    </div>
  );
};

// ── Panel efectivo ─────────────────────────────────────────────────────────────
const EfectivoPanel = ({ monto, onConfirm }) => {
  const [recibido, setRecibido] = useState(monto);
  const vuelto = Math.max(0, recibido - monto);
  const faltan = Math.max(0, monto - recibido);
  const BILLETES = [10, 20, 50, 100, 200];

  return (
    <div className="efectivo-panel">
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dc-fg-4)', marginBottom: 14 }}>
        Pago en efectivo
      </div>
      <div className="ef-cobrar-row">
        <span style={{ fontSize: 13, color: 'var(--dc-fg-3)', fontWeight: 600 }}>A cobrar</span>
        <span style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--dc-font-mono)', letterSpacing: '-0.02em', color: 'var(--dc-fg-1)' }}>{fmtBs2(monto)}</span>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--dc-fg-4)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Billetes rápidos</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {BILLETES.map(b => (
            <button key={b} className="billete-btn" onClick={() => setRecibido(prev => {
              const rounded = Math.ceil(monto / b) * b;
              return rounded >= monto ? rounded : prev + b;
            })}>Bs. {b}</button>
          ))}
          <button className="billete-btn billete-exact" onClick={() => setRecibido(monto)}>Exacto</button>
        </div>
      </div>
      <Field label="Monto recibido del cliente (Bs.)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--dc-fg-2)' }}>Bs.</span>
          <input className="input" type="number" min="0" value={recibido} onChange={e => setRecibido(Number(e.target.value) || 0)} style={{ fontSize: 20, fontWeight: 700, padding: '10px 12px', flex: 1 }} />
        </div>
      </Field>
      <div className={`ef-result-row ${vuelto > 0 ? 'vuelto' : faltan > 0 ? 'falta' : 'exacto'}`}>
        {vuelto > 0 && <><span style={{ fontWeight: 600 }}>Vuelto</span><span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--dc-font-mono)' }}>{fmtBs2(vuelto)}</span></>}
        {faltan > 0 && <><span style={{ fontWeight: 600 }}>Faltan</span><span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--dc-font-mono)' }}>{fmtBs2(faltan)}</span></>}
        {vuelto === 0 && faltan === 0 && <><span style={{ fontWeight: 600 }}>✓ Monto exacto</span><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--dc-positive)' }}>Sin vuelto</span></>}
      </div>
      <div style={{ marginTop: 14 }}>
        <Field label="Firma del paciente (opcional)"><SignaturePad /></Field>
      </div>
      <Button block icon={Icons.Check} disabled={recibido < monto} onClick={() => onConfirm({ banco: null, comprobante: null })} style={{ marginTop: 16 }}>
        Confirmar pago en efectivo
      </Button>
      {recibido < monto && <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--dc-alert)', marginTop: 8 }}>El monto recibido es menor al total a cobrar</div>}
    </div>
  );
};

const DEFAULT_PATIENT = {
  nombre: 'María Elena', apellidos: 'Mamani Quispe',
  ci: '7823451', edad: 34, tel: '7823 4512', email: 'maria.mamani@gmail.com',
  avatar: 'ME', avatarColor: '#0D9488', consultorio: 'A', doctor: 'Dra. Rosa Chávez',
};

// ── Componente principal ───────────────────────────────────────────────────────
const Cobro = ({ patient, onNavigate, consultorio: consultorioProp, sucursales }) => {
  const pat       = patient || DEFAULT_PATIENT;
  const initials  = pat.avatar || `${pat.nombre[0]}${pat.apellidos?.[0] || ''}`;
  const sucKey    = consultorioProp || pat.consultorio || 'A';
  const clinicSuc = sucursales || {};
  const suc       = clinicSuc[sucKey] || clinicSuc.A;

  const [plan, setPlan]       = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  useEffect(() => {
    if (!pat.id) return;
    setLoadingPlan(true);
    getPlanTratamiento(pat.id)
      .then(p => {
        setPlan(p);
        if (p) {
          const prev = p.abonos.reduce((s, a) => s + a.monto, 0);
          setACuenta(Math.max(0, p.montoTotal - prev));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPlan(false));
  }, [pat.id]);

  const pagadoPrev = plan ? plan.abonos.reduce((s, a) => s + a.monto, 0) : 0;
  const totalTrat  = plan?.montoTotal ?? 0;
  const tratNombre = plan?.titulo || '—';
  const maxPago    = totalTrat > 0 ? Math.max(0, totalTrat - pagadoPrev) : 99999;

  const [reciboNum]                        = useState(() => String(Math.floor(Math.random() * 90000) + 10000));
  const [method, setMethod]               = useState(null);
  const [aCuenta, setACuenta]             = useState(0);
  const [step, setStep]                   = useState(1);
  const [bancoUsado, setBancoUsado]       = useState(null);
  const [comprobanteUsado, setComprobante] = useState(null);
  const [reciboRef, setReciboRef]         = useState('');

  const saldo = totalTrat - pagadoPrev - aCuenta;

  const handleConfirm = ({ banco, comprobante }) => {
    const ref = method === 'qr'
      ? `QRS-${Date.now().toString(36).toUpperCase().slice(-8)}`
      : `EFV-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    setBancoUsado(banco);
    setComprobante(comprobante);
    setReciboRef(ref);
    setStep(2);

    const saveAsync = async () => {
      try {
        await createPago({
          pacienteId: pat.id || null,
          doctorId:   pat.doctor_id || null,
          sucursalId: sucKey || null,
          monto: aCuenta,
          metodo: method,
          banco: banco || null,
          tratamiento: tratNombre,
          reciboRef: ref,
        });
        if (plan?.id) {
          await createAbono(plan.id, { monto: aCuenta, metodo: method, recibo: ref }, pat.doctor_id || null);
        }
      } catch (e) {
        console.error('Error guardando pago:', e);
      }
    };
    saveAsync();
  };

  const reset = () => {
    setStep(1); setMethod(null); setBancoUsado(null); setComprobante(null); setReciboRef('');
    setACuenta(Math.max(0, totalTrat - pagadoPrev));
  };

  // ── Paso 2: Recibo ─────────────────────────────────────────────────────────
  if (step === 2) {
    const bancoInfo = bancoUsado ? BANCOS.find(b => b.id === bancoUsado) : null;
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h2 className="page-title" style={{ color: 'var(--dc-positive)' }}>✓ Pago registrado</h2>
            <p className="page-sub">
              {new Date().toLocaleDateString('es-BO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              {' · '}{new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <Button variant="secondary" icon={Icons.Plus} onClick={reset}>Nuevo cobro</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
          {/* Recibo con datos reales de sucursal */}
          <div className="receipt" id="cobro-recibo">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--dc-teal-50)', color: 'var(--dc-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icons.Tooth size={18} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 2px', fontSize: 15 }}>{suc.nombre}</h3>
                <div style={{ fontSize: 11, color: 'var(--dc-fg-3)' }}>{suc.dir}</div>
                <div style={{ fontSize: 11, color: 'var(--dc-fg-3)' }}>{suc.ciudad} · Tel. {suc.tel}</div>
              </div>
            </div>
            <div className="r-divider" />
            <div className="r-line"><span>Recibo N°</span><span style={{ fontFamily: 'var(--dc-font-mono)' }}>{reciboNum}</span></div>
            <div className="r-line"><span>Fecha</span><span style={{ fontFamily: 'var(--dc-font-mono)' }}>{new Date().toLocaleDateString('es-BO')} {new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}</span></div>
            <div className="r-divider" />
            <div className="r-line"><span>Paciente</span><span style={{ fontWeight: 600 }}>{pat.nombre} {pat.apellidos}</span></div>
            <div className="r-line"><span>C.I.</span><span style={{ fontFamily: 'var(--dc-font-mono)' }}>{pat.ci}</span></div>
            <div className="r-line"><span>Tratamiento</span><span>{tratNombre}</span></div>
            <div className="r-line"><span>Profesional</span><span>{pat.doctor || 'Dra. Rosa Chávez'}</span></div>
            <div className="r-divider" />
            <div className="r-line">
              <span>Método</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {method === 'qr' ? (
                  <>
                    <span style={{ fontWeight: 700 }}>QR Simple</span>
                    {bancoInfo && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999, background: bancoInfo.bg, color: bancoInfo.color }}>{bancoInfo.name}</span>}
                  </>
                ) : 'Efectivo'}
              </span>
            </div>
            <div className="r-line"><span>Ref. interna</span><span style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 11 }}>{reciboRef}</span></div>
            {comprobanteUsado && (
              <div className="r-line">
                <span>Comprobante banco</span>
                <span style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 11, color: 'var(--dc-positive)', fontWeight: 700 }}>{comprobanteUsado}</span>
              </div>
            )}
            {!comprobanteUsado && method === 'qr' && (
              <div className="r-line" style={{ color: 'var(--dc-warning)' }}>
                <span>Comprobante</span><span style={{ fontSize: 11 }}>⚠ No registrado</span>
              </div>
            )}
            <div className="r-divider" />
            <div className="r-line"><span>Total tratamiento</span><span>{fmtBs2(totalTrat)}</span></div>
            <div className="r-line"><span>Pagado previamente</span><span>{fmtBs2(pagadoPrev)}</span></div>
            <div className="r-line" style={{ fontWeight: 700 }}>
              <span>Este pago</span><span style={{ color: 'var(--dc-positive)' }}>{fmtBs2(aCuenta)}</span>
            </div>
            <div className="r-line" style={{ fontWeight: 700 }}>
              <span>Saldo restante</span><span style={{ color: saldo > 0 ? 'var(--dc-alert)' : 'var(--dc-positive)' }}>{fmtBs2(saldo)}</span>
            </div>
            <div className="r-status">{saldo > 0 ? '✓ PAGO A CUENTA REGISTRADO' : '✓ CANCELADO EN TOTAL'}</div>
          </div>

          {/* Acciones */}
          <div className="cobro-acciones" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>Acciones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button block icon={Icons.Download} onClick={() => window.print()}>Imprimir / Descargar PDF</Button>
                <Button block variant="secondary" icon={Icons.WhatsApp}
                  onClick={() => {
                    const comp = comprobanteUsado ? `\nComprobante: *${comprobanteUsado}*` : '';
                    const msg = encodeURIComponent(`Estimado/a ${pat.nombre}, le confirmamos su pago de *${fmtBs2(aCuenta)}* en ${suc.nombre}.\n\nRef: ${reciboRef}${comp}\nFecha: ${new Date().toLocaleDateString('es-BO')}\n\n¡Gracias por su confianza! 🦷`);
                    window.open(`https://wa.me/591${pat.tel?.replace(/\s/g, '')}?text=${msg}`, '_blank');
                  }}>
                  Enviar por WhatsApp
                </Button>
                <Button block variant="secondary" icon={Icons.Mail}
                  onClick={() => window.open(`mailto:${pat.email}?subject=Recibo%20de%20pago%20-%20${encodeURIComponent(suc.nombre)}&body=Estimado/a%20${encodeURIComponent(pat.nombre)}%2C%0A%0AAdjuntamos%20su%20recibo%20por%20${fmtBs2(aCuenta)}.%0ARef%3A%20${reciboRef}%0A%0A${encodeURIComponent(suc.nombre)}%20%C2%B7%20${encodeURIComponent(suc.ciudad)}`)}>
                  Enviar por correo
                </Button>
              </div>
            </Card>
            <Card>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>Resumen</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icons.CheckCircle size={16} style={{ color: 'var(--dc-positive)' }} />
                  Saldo: <strong style={{ color: saldo > 0 ? 'var(--dc-alert)' : 'var(--dc-positive)' }}>{fmtBs2(saldo)}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icons.Calendar size={16} />
                  {plan?.pasos?.find(p => p.estado === 'pendiente') ? `Próximo paso: ${plan.pasos.find(p => p.estado === 'pendiente').descripcion}` : 'Sin próxima cita pendiente'}
                </div>
                {bancoInfo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: bancoInfo.color, flexShrink: 0 }} />
                    Banco: <strong>{bancoInfo.name}</strong>
                  </div>
                )}
                {comprobanteUsado
                  ? <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--dc-positive)' }}><Icons.CheckCircle size={14} />Comprobante registrado ✓</div>
                  : method === 'qr' && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#B45309', fontSize: 12 }}><Icons.AlertTriangle size={13} />Sin comprobante — vulnerable a disputas</div>
                }
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── Paso 1: Método y monto ─────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">Registrar cobro</h2>
          <p className="page-sub">{suc.nombre} · {suc.dir}</p>
        </div>
      </div>

      <div className="cobro-grid">
        <Card pad="lg">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 16 }}>
            Resumen de consulta
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--dc-divider)' }}>
            <Avatar initials={initials} color={pat.avatarColor || '#0D9488'} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{pat.nombre} {pat.apellidos}</div>
              <div style={{ fontSize: 12, color: 'var(--dc-fg-3)' }}>CI {pat.ci} · {pat.edad} años</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13.5, marginBottom: 20 }}>
            {[
              ['Doctor',      pat.doctor || 'Dra. Rosa Chávez'],
              ['Sucursal',    `Suc. ${sucKey} — ${suc.nombre}`],
              ['Tratamiento', tratNombre],
              ['Fecha',       new Date().toLocaleDateString('es-BO')],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--dc-fg-3)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--dc-slate-50)', border: '1px solid var(--dc-border)', borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: 'var(--dc-fg-3)' }}>Total tratamiento</span>
              <span style={{ fontWeight: 600 }}>{loadingPlan ? '…' : fmtBs2(totalTrat)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 16 }}>
              <span style={{ color: 'var(--dc-fg-3)' }}>Pagado previamente</span>
              <span style={{ fontWeight: 600, color: 'var(--dc-positive)' }}>{loadingPlan ? '…' : fmtBs2(pagadoPrev)}</span>
            </div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', display: 'block', marginBottom: 8 }}>
              A cobrar en este pago
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--dc-fg-2)' }}>Bs.</span>
              <input className="input" type="number" min="0" max={maxPago}
                value={aCuenta}
                onChange={e => setACuenta(Math.max(0, Math.min(maxPago, Number(e.target.value) || 0)))}
                style={{ fontSize: 22, fontWeight: 800, padding: '8px 12px', letterSpacing: '-0.01em' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1.5px dashed var(--dc-border-strong)' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dc-fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Saldo tras pago</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: saldo > 0 ? 'var(--dc-alert)' : 'var(--dc-positive)' }}>{fmtBs2(saldo)}</span>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 12 }}>Método de pago</div>
            <div className="payment-method">
              <div className={`pm-card ${method === 'efectivo' ? 'active' : ''}`} onClick={() => setMethod('efectivo')}>
                <div className="pm-icon-wrap" style={{ background: method === 'efectivo' ? 'rgba(13,148,136,0.15)' : 'var(--dc-slate-100)' }}><Icons.Cash size={24} /></div>
                <div className="pm-label">Efectivo</div>
                <div className="pm-sub">Billetes · vuelto automático</div>
              </div>
              <div className={`pm-card ${method === 'qr' ? 'active' : ''}`} onClick={() => setMethod('qr')}>
                <div className="pm-icon-wrap" style={{ background: method === 'qr' ? 'rgba(13,148,136,0.15)' : 'var(--dc-slate-100)' }}><Icons.QrCode size={24} /></div>
                <div className="pm-label">QR Simple</div>
                <div className="pm-sub">Todas las apps bancarias</div>
              </div>
            </div>
          </div>
        </Card>

        <Card pad="lg">
          {!method && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, gap: 14, color: 'var(--dc-fg-3)', textAlign: 'center' }}>
              <Icons.Wallet size={44} style={{ opacity: 0.2 }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dc-fg-2)', marginBottom: 6 }}>Selecciona un método</div>
                <div style={{ fontSize: 13 }}>Elige efectivo o QR Simple para continuar con el cobro</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                {BANCOS.slice(0, 6).map(b => (
                  <span key={b.id} style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: b.bg, color: b.color }}>{b.short}</span>
                ))}
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--dc-fg-4)', padding: '2px 6px' }}>+{BANCOS.length - 6} más</span>
              </div>
            </div>
          )}
          {method === 'qr' && <QrPanel monto={aCuenta} onConfirm={handleConfirm} onNavigateConfig={() => onNavigate?.('configuracion')} />}
          {method === 'efectivo' && <EfectivoPanel monto={aCuenta} onConfirm={handleConfirm} />}
        </Card>
      </div>
    </div>
  );
};

export default Cobro;
