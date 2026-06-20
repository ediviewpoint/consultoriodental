import { useState, useEffect } from 'react';
import { Icons } from './icons';
import { createSolicitud, getOcupadosDia, getDoctores } from '../lib/db';

const MOTIVOS = [
  'Consulta general', 'Limpieza dental', 'Control y revisión',
  'Dolor dental urgente', 'Ortodoncia', 'Endodoncia', 'Extracción',
  'Corona o funda', 'Blanqueamiento dental', 'Radiografía', 'Otro motivo',
];

const HORAS = [
  '08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00',
];

const DAY_NAMES  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MON_LABELS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

const getNextDays = (n = 8) => {
  const days = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  while (days.length < n) {
    if (d.getDay() !== 0) {
      const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      days.push({ iso, label: DAY_NAMES[d.getDay()], day: d.getDate(), month: MON_LABELS[d.getMonth()] });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
};

const DAYS = getNextDays(8);

const BookingPage = ({ sucursales, doctors: doctorsProp = [], onBack }) => {
  const suc = sucursales || {};

  const [step, setStep]                   = useState(1);
  const [sucursal, setSucursal]           = useState('A');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDay, setSelectedDay]     = useState(null);
  const [selectedTime, setTime]           = useState(null);
  const [form, setForm]                   = useState({ nombre: '', tel: '', motivo: MOTIVOS[0] });
  const [errors, setErrors]               = useState({});
  const [occupied, setOccupied]           = useState(new Set());
  const [submitting, setSubmitting]       = useState(false);
  const [doctorsList, setDoctorsList]     = useState(doctorsProp);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (doctorsProp.length > 0) { setDoctorsList(doctorsProp); return; }
    getDoctores().then(setDoctorsList).catch(() => {});
  }, [doctorsProp.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const docsBySuc = doctorsList.filter(d => d.consultorio === sucursal);

  const handleSucursal = (k) => {
    setSucursal(k);
    setSelectedDoctor(null);
    setSelectedDay(null);
    setTime(null);
  };

  useEffect(() => {
    if (!selectedDay) { setOccupied(new Set()); return; }
    getOcupadosDia(selectedDay.iso, selectedDoctor?.id || null)
      .then(setOccupied)
      .catch(() => setOccupied(new Set()));
  }, [selectedDay, selectedDoctor]);

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = true;
    if (!form.tel.trim() || form.tel.replace(/\D/g, '').length < 7) e.tel = true;
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    try {
      await createSolicitud({
        fecha:       selectedDay.iso,
        hora:        selectedTime,
        sucursal_id: sucursal,
        nombre:      form.nombre.trim(),
        telefono:    form.tel.trim(),
        motivo:      form.motivo,
        doctor_id:   selectedDoctor?.id || null,
        estado:      'pendiente',
      });
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const dayLabel = selectedDay
    ? `${selectedDay.label} ${selectedDay.day} de ${selectedDay.month}`
    : '';

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'var(--dc-font)' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--dc-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icons.Tooth size={20} style={{ color: '#fff' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#1E293B', letterSpacing: '-0.01em' }}>DentalCare Pro</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>Reserva de citas en línea · Santa Cruz, Bolivia</div>
        </div>
        {onBack && (
          <button onClick={onBack} style={{ fontSize: 12, color: '#64748B', background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 500 }}>
            Ir al sistema →
          </button>
        )}
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Indicador de pasos */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, justifyContent: 'center' }}>
            {[['1', 'Horario'], ['2', 'Tus datos'], ['3', 'Confirmado']].map(([n, label], i) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                    background: step === i+1 ? 'var(--dc-primary)' : step > i+1 ? 'rgba(13,148,136,0.15)' : '#E2E8F0',
                    color: step === i+1 ? '#fff' : step > i+1 ? 'var(--dc-primary)' : '#94A3B8',
                  }}>{step > i+1 ? '✓' : n}</div>
                  <span style={{ fontSize: 12, fontWeight: step === i+1 ? 700 : 400, color: step === i+1 ? '#1E293B' : '#94A3B8' }}>{label}</span>
                </div>
                {i < 1 && <div style={{ width: 28, height: 1, background: '#E2E8F0' }} />}
              </div>
            ))}
          </div>
        )}

        {/* ── PASO 1: Elegir fecha y hora ── */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Reserva tu cita
              </h1>
              <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
                Elige un horario y te confirmaremos por WhatsApp
              </p>
            </div>

            {/* Sucursal */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 12 }}>¿En qué sucursal?</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {Object.entries(suc).map(([k, s]) => (
                  <button key={k} onClick={() => handleSucursal(k)} style={{
                    flex: 1, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${sucursal === k ? 'var(--dc-primary)' : '#E2E8F0'}`,
                    background: sucursal === k ? 'rgba(13,148,136,0.06)' : '#fff',
                    transition: 'all 0.12s',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: sucursal === k ? 'var(--dc-primary)' : '#334155' }}>Suc. {k} — {s.nombre}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{s.dir}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor */}
            {docsBySuc.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '18px 20px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 12 }}>¿Con qué doctor?</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {docsBySuc.map(d => {
                    const sel = selectedDoctor?.id === d.id;
                    return (
                      <button key={d.id} onClick={() => { setSelectedDoctor(d); setTime(null); }} style={{
                        flex: 1, minWidth: 140, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                        border: `2px solid ${sel ? d.color : '#E2E8F0'}`,
                        background: sel ? `${d.color}12` : '#fff',
                        transition: 'all 0.12s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{d.short}</span>
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: sel ? d.color : '#334155' }}>{d.name}</div>
                            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>Suc. {d.consultorio}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Días */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 14 }}>Día disponible</div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {DAYS.map((day) => {
                  const isSel = selectedDay?.iso === day.iso;
                  return (
                    <button key={day.iso} onClick={() => { setSelectedDay(day); setTime(null); }} style={{
                      flexShrink: 0, width: 66, padding: '10px 0', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                      border: `2px solid ${isSel ? 'var(--dc-primary)' : '#E2E8F0'}`,
                      background: isSel ? 'var(--dc-primary)' : '#fff',
                      color: isSel ? '#fff' : '#1E293B', transition: 'all 0.12s',
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.75 }}>{day.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{day.day}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>{day.month}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Horas */}
            {selectedDay && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '18px 20px', marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 14 }}>
                  Horarios disponibles — {dayLabel}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {HORAS.map(t => {
                    const busy  = occupied.has(t);
                    const isSel = selectedTime === t;
                    return (
                      <button key={t} onClick={() => !busy && setTime(t)} style={{
                        padding: '11px 0', borderRadius: 8, cursor: busy ? 'not-allowed' : 'pointer',
                        fontSize: 13, fontWeight: 700, fontFamily: 'var(--dc-font-mono)',
                        border: `2px solid ${isSel ? 'var(--dc-primary)' : busy ? '#F1F5F9' : '#E2E8F0'}`,
                        background: isSel ? 'var(--dc-primary)' : busy ? '#F8FAFC' : '#fff',
                        color: isSel ? '#fff' : busy ? '#CBD5E1' : '#334155',
                        textDecoration: busy ? 'line-through' : 'none',
                        opacity: busy ? 0.55 : 1, transition: 'all 0.1s',
                      }}>{t}</button>
                    );
                  })}
                </div>
                {occupied.size > 0 && (
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 10 }}>Los horarios tachados ya están reservados.</div>
                )}
              </div>
            )}

            {(() => {
              const needDoctor = docsBySuc.length > 0 && !selectedDoctor;
              const canContinue = selectedDay && selectedTime && !needDoctor;
              let hint = 'Selecciona un día y horario para continuar';
              if (needDoctor) hint = 'Elige un doctor para continuar';
              else if (canContinue) hint = `Continuar — ${dayLabel} a las ${selectedTime}`;
              return (
                <button onClick={() => { if (canContinue) setStep(2); }} disabled={!canContinue} style={{
                  width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                  cursor: canContinue ? 'pointer' : 'not-allowed',
                  background: canContinue ? 'var(--dc-primary)' : '#E2E8F0',
                  color: canContinue ? '#fff' : '#94A3B8',
                  fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', transition: 'all 0.15s',
                }}>{hint}</button>
              );
            })()}
          </div>
        )}

        {/* ── PASO 2: Datos del paciente ── */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#64748B', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 5, padding: 0, fontWeight: 500 }}>
              <Icons.ChevronL size={14} /> Cambiar horario
            </button>

            {/* Resumen */}
            <div style={{ background: 'rgba(13,148,136,0.08)', border: '1.5px solid rgba(13,148,136,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--dc-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icons.Calendar size={20} style={{ color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1E293B' }}>{dayLabel} · {selectedTime}</div>
                <div style={{ fontSize: 12, color: 'var(--dc-primary)', fontWeight: 600, marginTop: 2 }}>
                  Suc. {sucursal} — {suc[sucursal]?.nombre}
                  {selectedDoctor && ` · Dr. ${selectedDoctor.name}`}
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: 24, marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: '#1E293B' }}>Tus datos de contacto</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: errors.nombre ? '#DC2626' : '#64748B', display: 'block', marginBottom: 6 }}>
                    Nombre completo *
                  </label>
                  <input
                    className={`input${errors.nombre ? ' input-error' : ''}`}
                    value={form.nombre}
                    onChange={e => { upd('nombre', e.target.value); setErrors(er => ({ ...er, nombre: false })); }}
                    placeholder="Tu nombre y apellido"
                    style={{ width: '100%', fontSize: 15, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: errors.tel ? '#DC2626' : '#64748B', display: 'block', marginBottom: 6 }}>
                    Celular / WhatsApp *
                  </label>
                  <input
                    className={`input${errors.tel ? ' input-error' : ''}`}
                    value={form.tel} type="tel"
                    onChange={e => { upd('tel', e.target.value); setErrors(er => ({ ...er, tel: false })); }}
                    placeholder="Ej: 7823 4512"
                    style={{ width: '100%', fontSize: 15, fontFamily: 'var(--dc-font-mono)', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 5 }}>
                    Te enviaremos la confirmación por WhatsApp a este número
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: 6 }}>
                    Motivo de consulta
                  </label>
                  <select
                    className="select"
                    value={form.motivo}
                    onChange={e => upd('motivo', e.target.value)}
                    style={{ width: '100%', fontSize: 14 }}
                  >
                    {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {Object.values(errors).some(Boolean) && (
                <div style={{ marginTop: 14, fontSize: 12, color: '#DC2626', padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 8 }}>
                  Completa los campos obligatorios para continuar.
                </div>
              )}
            </div>

            <button onClick={handleSubmit} disabled={submitting} style={{
              width: '100%', padding: '16px', borderRadius: 12, border: 'none', cursor: submitting ? 'default' : 'pointer',
              background: submitting ? '#94A3B8' : 'var(--dc-primary)', color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
            }}>
              {submitting ? 'Enviando…' : 'Enviar solicitud de turno →'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: 12, lineHeight: 1.5 }}>
              El equipo del consultorio revisará tu solicitud y recibirás respuesta por WhatsApp en breve.
            </p>
          </div>
        )}

        {/* ── PASO 3: Confirmación ── */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Icons.CheckCircle size={48} style={{ color: '#10B981' }} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1E293B', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              ¡Solicitud enviada!
            </h1>
            <p style={{ fontSize: 15, color: '#475569', margin: '0 0 4px' }}>
              Tu solicitud para el <strong style={{ color: '#1E293B' }}>{dayLabel} a las {selectedTime}</strong>
            </p>
            <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 32px' }}>
              en Suc. {sucursal} — {suc[sucursal]?.nombre} fue recibida.
            </p>

            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: '16px 20px', marginBottom: 16, textAlign: 'left', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <Icons.WhatsApp size={22} style={{ color: '#25D366', flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46', marginBottom: 4 }}>¿Qué pasa ahora?</div>
                <div style={{ fontSize: 13, color: '#047857', lineHeight: 1.6 }}>
                  Nuestro equipo revisará tu solicitud y te enviará un <strong>mensaje de WhatsApp</strong> al <strong>{form.tel}</strong> con la confirmación o una alternativa de horario.
                </div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', marginBottom: 28, fontSize: 12, color: '#64748B', textAlign: 'left', lineHeight: 1.5 }}>
              📍 <strong>Suc. {sucursal} — {suc[sucursal]?.nombre}</strong><br />
              {suc[sucursal]?.dir} · Tel: {suc[sucursal]?.tel}
            </div>

            <button onClick={() => { setStep(1); setSelectedDay(null); setTime(null); setForm({ nombre: '', tel: '', motivo: MOTIVOS[0] }); setErrors({}); }} style={{
              padding: '12px 28px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff',
              cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#475569',
            }}>
              Reservar otra cita
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #E2E8F0', padding: '14px 24px', textAlign: 'center', fontSize: 11, color: '#94A3B8' }}>
        DentalCare Pro · {suc[sucursal]?.ciudad || 'Santa Cruz, Bolivia'} · {suc[sucursal]?.tel}
      </div>
    </div>
  );
};

export default BookingPage;
