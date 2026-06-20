import { useState, useEffect } from 'react';
import { Icons } from './icons';
import { Button, Modal, Field, Badge } from './ui';
import { getCitas, createCita, updateCitaEstado, getPacientes, getSolicitudesPendientes, updateSolicitudEstado, getCatalogo } from '../lib/db';

// Genera semana anterior / actual / siguiente basadas en la fecha real de hoy
const buildWeeks = () => {
  const today = new Date();
  const dow   = today.getDay();
  const toMon = dow === 0 ? -6 : 1 - dow;
  const toISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return [-1, 0, 1].map((offset) => {
    const mon = new Date(today);
    mon.setDate(today.getDate() + toMon + offset * 7);
    mon.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return d;
    });

    const todayIdx = days.findIndex((d) => d.toDateString() === today.toDateString());
    const dateMap = {};
    days.forEach((d, i) => { dateMap[toISO(d)] = i + 1; });

    const sl = days[0].toLocaleDateString('es-BO', { day: 'numeric', month: 'long' });
    const el = days[5].toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });

    return {
      label:   `Semana del ${sl} al ${el}`,
      days:    DAY_LABELS,
      dates:   days.map((d) => String(d.getDate())),
      todayIdx,
      dateMap,
      minDate: toISO(days[0]),
      maxDate: toISO(days[5]),
      monday:  toISO(mon),
    };
  });
};

const WEEKS        = buildWeeks();
const ESTADO_ORDER = ['pendiente', 'confirmada', 'en-curso', 'completada', 'cancelada'];

const citaToAppt = (c) => {
  const [hStr, mStr] = c.hora.split(':');
  const hora = Number(hStr) + Number(mStr) / 60;
  const d    = new Date(c.fecha + 'T00:00:00');
  const dow  = d.getDay();
  const dia  = dow === 0 ? 7 : dow;
  const mon  = new Date(d);
  mon.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  const pad   = n  => String(n).padStart(2, '0');
  const toISO = dt => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  return {
    _id: c.id, dia, hora, dur: Number(c.duracion || 1),
    paciente: c.paciente_nombre,
    doctor:   c.doctores?.nombre || '',
    tratamiento: c.tratamiento || '',
    notas:    c.notas || '',
    estado:   c.estado,
    weekMonday: toISO(mon),
    paciente_id: c.paciente_id,
    doctor_id:   c.doctor_id,
    fecha: c.fecha,
  };
};

const makeEmpty = (doctor, date) => ({
  patSelect: '', paciente: '', doctor,
  consultorio: 'A', fecha: date, hora: '09:00',
  dur: '1', tratamiento: '', notas: '',
});

const Agenda = ({ consultorio, user, sucursales, doctors = [] }) => {
  const suc = sucursales || {};

  const isDoctor  = user?.role === 'doctor';
  const doctorObj = isDoctor ? doctors.find((d) => d.id === user.doctorId) : null;
  const defDoctor = doctorObj?.name ?? doctors[0]?.name ?? '';

  const [weekIdx, setWeekIdx]           = useState(1);
  const [modal, setModal]               = useState(false);
  const [doctorFilter, setDoctorFilter] = useState(isDoctor && doctorObj ? doctorObj.name : 'todos');
  const [appts, setAppts]               = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [form, setForm]                 = useState(makeEmpty(defDoctor, WEEKS[1].minDate));
  const [saved, setSaved]               = useState(false);
  const [detailAppt, setDetailAppt]     = useState(null);
  const [patients, setPatients]         = useState([]);
  const [solicitudes, setSolicitudes]   = useState([]);
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectNote, setRejectNote]     = useState('');
  const [catalogo, setCatalogo]         = useState([]);


  const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const ROW_H = 52;

  const week        = WEEKS[weekIdx];
  const DATE_TO_DAY = week.dateMap;

  // Load citas for the current week
  useEffect(() => {
    setLoadingCitas(true);
    getCitas(week.minDate, week.maxDate)
      .then(raw => setAppts(raw.map(citaToAppt)))
      .catch(console.error)
      .finally(() => setLoadingCitas(false));
  }, [week.monday]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load patients for the appointment modal
  useEffect(() => {
    getPacientes().then(setPatients).catch(console.error);
    getCatalogo().then(setCatalogo).catch(console.error);
  }, []);

  // Load pending booking requests — for doctors, only their own
  useEffect(() => {
    getSolicitudesPendientes(isDoctor ? user?.doctorId : null)
      .then(setSolicitudes).catch(console.error);
  }, [isDoctor, user?.doctorId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update default doctor when doctors list loads
  useEffect(() => {
    if (defDoctor && !form.doctor) {
      setForm(f => ({ ...f, doctor: defDoctor }));
    }
  }, [defDoctor]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredAppts = appts.filter((a) => {
    const activeFilter = isDoctor && doctorObj ? doctorObj.name : doctorFilter;
    return activeFilter === 'todos' || a.doctor === activeFilter;
  });

  const upd       = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const resetForm = ()     => setForm(makeEmpty(defDoctor, week.minDate));

  const handlePatSelect = (val) => {
    upd('patSelect', val);
    if (val === '__nuevo__') { upd('paciente', ''); return; }
    upd('paciente', val);
    if (val) {
      const p = patients.find((px) => `${px.nombre} ${px.apellidos}` === val);
      if (p) {
        if (!isDoctor) upd('doctor', p.doctor);
        upd('consultorio', p.consultorio || 'A');
      }
    }
  };

  const handleSave = async () => {
    const nombre = form.paciente.trim();
    const dia    = DATE_TO_DAY[form.fecha];
    if (!nombre || !dia) return;
    const docObj = doctors.find(d => d.name === form.doctor);
    const patObj = patients.find(p => `${p.nombre} ${p.apellidos}` === nombre);
    try {
      const newCita = await createCita({
        paciente_nombre: nombre,
        paciente_id:     patObj?.id || null,
        doctor_id:       docObj?.id || null,
        sucursal_id:     form.consultorio || 'A',
        fecha:           form.fecha,
        hora:            form.hora,
        duracion:        Number(form.dur),
        tratamiento:     form.tratamiento || null,
        notas:           form.notas || null,
        estado:          'pendiente',
      });
      setAppts((prev) => [...prev, citaToAppt(newCita)]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creating cita:', err);
    }
  };

  const fmtHora = (h) => {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  const fmtDur = (d) =>
    d === 0.5 ? '30 min' : d === 1 ? '1 hora' : d === 1.5 ? '1h 30min' : `${d}h`;

  const updApptEstado = async (appt, nextEstado) => {
    if (appt._id) {
      try { await updateCitaEstado(appt._id, nextEstado); } catch (err) { console.error(err); }
    }
    setAppts((prev) => prev.map((a) => {
      const match = a._id !== undefined
        ? a._id === appt._id
        : a.dia === appt.dia && a.hora === appt.hora && a.paciente === appt.paciente;
      return match ? { ...a, estado: nextEstado } : a;
    }));
  };

  const advanceEstado = async () => {
    if (!detailAppt) return;
    const idx = ESTADO_ORDER.indexOf(detailAppt.estado);
    if (idx >= ESTADO_ORDER.length - 1) return;
    const next = ESTADO_ORDER[idx + 1];

    if (detailAppt.estado === 'pendiente') {
      const pat = patients.find((p) =>
        `${p.nombre} ${p.apellidos}` === detailAppt.paciente || detailAppt.paciente.startsWith(p.nombre)
      );
      if (pat?.tel) {
        const msg = encodeURIComponent(
          `Hola ${pat.nombre} 👋, le confirmamos su cita en *DentalCare Pro* para *${detailAppt.tratamiento}* a las *${fmtHora(detailAppt.hora)}* con ${detailAppt.doctor}. ¡Le esperamos!`
        );
        window.open(`https://wa.me/591${pat.tel.replace(/\s/g, '')}?text=${msg}`, '_blank');
      }
    }

    await updApptEstado(detailAppt, next);
    setDetailAppt((d) => ({ ...d, estado: next }));
  };

  const cancelAppt = async () => {
    if (!detailAppt) return;
    await updApptEstado(detailAppt, 'cancelada');
    setDetailAppt(null);
  };

  const fmtISO = (iso) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' });

  const acceptSolicitud = async (sol) => {
    const d   = new Date(sol.fecha + 'T00:00:00');
    const dow = d.getDay();
    const dia = dow === 0 ? 7 : dow;
    const mon = new Date(d);
    mon.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
    const pad     = (n) => String(n).padStart(2, '0');
    const toISO   = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
    const weekMon = toISO(mon);
    const [hStr, mStr] = sol.hora.split(':');
    const hora = Number(hStr) + Number(mStr) / 60;

    try {
      const docObj = sol.doctor_id
        ? doctors.find(d => d.id === sol.doctor_id) ?? doctors[0]
        : doctors[0];
      const newCita = await createCita({
        paciente_nombre: sol.nombre,
        paciente_id:     null,
        doctor_id:       docObj?.id || null,
        sucursal_id:     sol.sucursal_id || 'A',
        fecha:           sol.fecha,
        hora:            sol.hora,
        duracion:        1,
        tratamiento:     sol.motivo || 'Consulta',
        notas:           `Tel: ${sol.telefono} · Reserva web`,
        estado:          'confirmada',
      });
      setAppts((prev) => [...prev, citaToAppt({ ...newCita, weekMonday: weekMon })]);
      await updateSolicitudEstado(sol.id, 'aceptada');
    } catch (err) {
      console.error(err);
    }

    const msg = encodeURIComponent(
      `Hola ${sol.nombre} 👋, *confirmamos tu cita* en *DentalCare Pro* (Suc. ${sol.sucursal_id || 'A'}) para el *${fmtISO(sol.fecha)}* a las *${sol.hora}*. ¡Te esperamos!`
    );
    window.open(`https://wa.me/591${sol.telefono.replace(/\D/g, '')}?text=${msg}`, '_blank');
    setSolicitudes((prev) => prev.filter((s) => s.id !== sol.id));
  };

  const openRejectModal = (sol) => { setRejectModal(sol); setRejectNote(''); };

  const confirmReject = async () => {
    const sol  = rejectModal;
    const nota = rejectNote.trim();
    const msg  = encodeURIComponent(
      `Hola ${sol.nombre}, lamentablemente el horario del *${fmtISO(sol.fecha)} a las ${sol.hora}* no está disponible${nota ? `. Motivo: ${nota}` : ''}. Por favor escríbenos para coordinar una alternativa. — DentalCare Pro`
    );
    window.open(`https://wa.me/591${sol.telefono.replace(/\D/g, '')}?text=${msg}`, '_blank');
    try { await updateSolicitudEstado(sol.id, 'rechazada', nota || null); } catch (err) { console.error(err); }
    setSolicitudes((prev) => prev.filter((s) => s.id !== sol.id));
    setRejectModal(null);
    setRejectNote('');
  };

  const selectedPat = form.patSelect && form.patSelect !== '__nuevo__'
    ? patients.find((p) => `${p.nombre} ${p.apellidos}` === form.patSelect)
    : null;

  const isFormValid = form.paciente.trim() && form.fecha && DATE_TO_DAY[form.fecha];

  const nextBtnLabel = (estado) => {
    if (estado === 'pendiente')  return 'Confirmar + avisar por WhatsApp';
    if (estado === 'confirmada') return 'Marcar en curso';
    if (estado === 'en-curso')   return 'Completar cita';
    return 'Siguiente';
  };

  return (
    <div className="page">
      {/* Encabezado */}
      <div className="page-head">
        <div>
          <h2 className="page-title">{isDoctor ? `Mi Agenda · ${doctorObj?.name ?? ''}` : 'Agenda'}</h2>
          <p className="page-sub">{week.label} · Suc. {consultorio} — {suc[consultorio]?.nombre}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {saved && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dc-positive)' }}>✓ Cita guardada</span>}
          <Button variant="secondary" icon={Icons.ChevronL} size="sm" onClick={() => setWeekIdx((i) => Math.max(0, i - 1))} />
          <Button variant="secondary" size="sm" onClick={() => setWeekIdx(1)}>Hoy</Button>
          <Button variant="secondary" icon={Icons.ChevronR} size="sm" onClick={() => setWeekIdx((i) => Math.min(2, i + 1))} />
          <Button icon={Icons.Plus} onClick={() => setModal(true)}>Nueva cita</Button>
        </div>
      </div>

      {/* Barra de filtros y leyenda */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
        {!isDoctor ? (
          <select className="select" style={{ width: 'auto' }} value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
            <option value="todos">Todos los doctores</option>
            {doctors.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        ) : (
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dc-fg-2)', padding: '6px 12px', background: 'var(--dc-slate-50)', borderRadius: 8, border: '1px solid var(--dc-border)' }}>
            {doctorObj?.name}
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--dc-fg-3)', flexWrap: 'wrap' }}>
          {[
            { label: 'Confirmada', color: '#10B981' },
            { label: 'En curso',   color: '#3B82F6' },
            { label: 'Pendiente',  color: '#F59E0B' },
            { label: 'Completada', color: '#94A3B8' },
            { label: 'Cancelada',  color: '#F87171' },
          ].map(({ label, color }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Layout principal */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Grilla de calendario */}
        <div className="week-grid" style={{ flex: 1 }}>
          <div className="week-header">
            <div />
            {week.days.map((d, i) => (
              <div key={d} className={i === week.todayIdx ? 'today' : ''}>
                <div className="wd">{d}</div>
                <div className="wn">{week.dates[i]}</div>
              </div>
            ))}
          </div>
          <div className="week-body" style={{ minHeight: HOURS.length * ROW_H }}>
            <div className="hour-col">
              {HOURS.map((h) => <div key={h} className="hour-cell">{String(h).padStart(2, '0')}:00</div>)}
            </div>
            {loadingCitas && (
              <div className="week-empty">
                <Icons.Clock size={40} />
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--dc-fg-2)' }}>Cargando agenda…</p>
              </div>
            )}
            {!loadingCitas && filteredAppts.length === 0 && (
              <div className="week-empty">
                <Icons.Calendar size={40} />
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--dc-fg-2)' }}>Sin citas esta semana</p>
                <p>Usa "Nueva cita" para agendar una consulta.</p>
              </div>
            )}
            {[1, 2, 3, 4, 5, 6].map((dayN) => (
              <div key={dayN} className="day-col" style={{ position: 'relative' }}>
                {HOURS.map((h) => <div key={h} className="day-cell" />)}
                {filteredAppts.filter((a) => a.dia === dayN).map((a, i) => {
                  const top    = (a.hora - 8) * ROW_H;
                  const height = (a.dur || 1) * ROW_H - 4;
                  return (
                    <div
                      key={i}
                      className={`appt ${a.estado}`}
                      style={{ top: `${top + 2}px`, height: `${height}px`, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                      onClick={() => setDetailAppt(a)}
                    >
                      <div className="name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{a.paciente}</span>
                        {a.estado === 'confirmada' && <Icons.CheckCircle size={12} style={{ color: '#047857' }} />}
                      </div>
                      {a.tratamiento && <div className="treat">{a.tratamiento}</div>}
                      {!isDoctor && <div className="doc">{a.doctor}</div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Panel lateral derecho */}
        <div style={{ width: 280, flexShrink: 0 }}>

          {/* Solicitudes de reserva web */}
          {solicitudes.length > 0 && (
            <div style={{ background: '#fff', border: '1.5px solid #FCD34D', borderRadius: 12, padding: 18, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                    {isDoctor ? 'Mis solicitudes' : 'Solicitudes web'}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginTop: 2 }}>
                    {solicitudes.length} pendiente{solicitudes.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, letterSpacing: '0.04em' }}>
                  NUEVO{solicitudes.length !== 1 ? 'S' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {solicitudes.map((sol) => (
                  <div key={sol.id} style={{ padding: 12, background: 'var(--dc-slate-50)', borderRadius: 10, border: '1px solid #FDE68A' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{sol.nombre}</div>
                    {!isDoctor && sol.doctores?.nombre && (
                      <div style={{ fontSize: 11, color: 'var(--dc-primary)', fontWeight: 600, marginBottom: 2 }}>
                        Dr. {sol.doctores.nombre}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--dc-fg-3)', fontFamily: 'var(--dc-font-mono)', marginBottom: 3 }}>
                      {fmtISO(sol.fecha)} · {sol.hora}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--dc-fg-2)', marginBottom: 8 }}>
                      Suc. {sol.sucursal_id} · {sol.motivo}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button size="sm" style={{ flex: 1, fontSize: 11 }} onClick={() => acceptSolicitud(sol)}>
                        ✓ Aceptar
                      </Button>
                      <Button variant="secondary" size="sm"
                        style={{ fontSize: 11, color: 'var(--dc-alert)', borderColor: 'rgba(220,38,38,0.3)' }}
                        onClick={() => openRejectModal(sol)}>
                        ✗ Rechazar
                      </Button>
                      <Button variant="secondary" size="sm" icon={Icons.WhatsApp}
                        onClick={() => window.open(`https://wa.me/591${sol.telefono.replace(/\D/g, '')}`, '_blank')} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: '#fff', border: '1px solid var(--dc-border)', borderRadius: 12, padding: 18 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>Acciones rápidas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button variant="secondary" icon={Icons.Plus} style={{ justifyContent: 'flex-start', fontSize: 13 }}
                onClick={() => setModal(true)}>
                Nueva cita
              </Button>
              {!isDoctor && (
                <Button variant="secondary" icon={Icons.WhatsApp} style={{ justifyContent: 'flex-start', fontSize: 13 }}
                  onClick={() => {
                  const msg = encodeURIComponent('Hola, le recordamos su cita en DentalCare Pro. Por favor confirme su asistencia. Gracias.');
                  window.open(`https://web.whatsapp.com/send?text=${msg}`, '_blank');
                }}>
                  Recordatorio masivo
                </Button>
              )}
            </div>
            <div style={{ marginTop: 14, padding: 10, background: 'var(--dc-slate-50)', borderRadius: 8, fontSize: 11, color: 'var(--dc-fg-3)', lineHeight: 1.6 }}>
              Las citas pendientes aparecen en amarillo en el calendario. Haz clic en cualquier cita para ver su detalle.
            </div>
          </div>
        </div>
      </div>

      {/* Modal: nueva cita */}
      <Modal
        open={modal}
        onClose={() => { setModal(false); resetForm(); }}
        title="Nueva cita"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setModal(false); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSave} icon={Icons.Check} disabled={!isFormValid}>Guardar cita</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <Field label="Paciente">
            <select className="select" value={form.patSelect} onChange={(e) => handlePatSelect(e.target.value)}>
              <option value="">— Seleccionar paciente existente —</option>
              {patients.map((p) => (
                <option key={p.id} value={`${p.nombre} ${p.apellidos}`}>{p.nombre} {p.apellidos}</option>
              ))}
              <option value="__nuevo__">+ Paciente nuevo (ingresar nombre)</option>
            </select>
            {form.patSelect === '__nuevo__' && (
              <input
                className="input" style={{ marginTop: 8 }}
                value={form.paciente}
                onChange={(e) => upd('paciente', e.target.value)}
                placeholder="Nombre completo del paciente"
                autoFocus
              />
            )}
            {selectedPat && (
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--dc-fg-3)', display: 'flex', gap: 8 }}>
                <span>CI: {selectedPat.ci}</span>
                <span>·</span>
                <span>Tel: {selectedPat.tel}</span>
                <span>·</span>
                <span>{selectedPat.edad} años</span>
              </div>
            )}
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Doctor">
              <select className="select" value={form.doctor} onChange={(e) => upd('doctor', e.target.value)} disabled={isDoctor}>
                {doctors.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </Field>
            <Field label="Sucursal">
              <select className="select" value={form.consultorio} onChange={(e) => upd('consultorio', e.target.value)}>
                {Object.entries(suc).map(([k, s]) => (
                  <option key={k} value={k}>Suc. {k} — {s.nombre}</option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Fecha">
              <input
                className="input" type="date"
                value={form.fecha}
                min={week.minDate} max={week.maxDate}
                onChange={(e) => upd('fecha', e.target.value)}
              />
            </Field>
            <Field label="Hora">
              <input className="input" type="time" value={form.hora} onChange={(e) => upd('hora', e.target.value)} />
            </Field>
            <Field label="Duración">
              <select className="select" value={form.dur} onChange={(e) => upd('dur', e.target.value)}>
                <option value="0.5">30 min</option>
                <option value="1">1 hora</option>
                <option value="1.5">1h 30min</option>
                <option value="2">2 horas</option>
              </select>
            </Field>
          </div>

          <Field label="Tipo de tratamiento">
            <select className="select" value={form.tratamiento} onChange={(e) => upd('tratamiento', e.target.value)}>
              {catalogo.map((t) => <option key={t.id} value={t.tratamiento}>{t.tratamiento}</option>)}
            </select>
          </Field>

          <Field label="Notas adicionales">
            <textarea className="textarea" rows="2"
              placeholder="Observaciones para el profesional…"
              value={form.notas} onChange={(e) => upd('notas', e.target.value)} />
          </Field>

          {form.fecha && !DATE_TO_DAY[form.fecha] && (
            <div style={{ fontSize: 12, color: 'var(--dc-alert)', padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 6 }}>
              Fecha fuera de la semana visualizada. La cita se guardará pero navega a la semana correcta para verla en la grilla.
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: rechazar solicitud con nota */}
      <Modal
        open={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Rechazar solicitud"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectModal(null)}>Cancelar</Button>
            <Button
              style={{ background: '#DC2626', borderColor: '#DC2626' }}
              icon={Icons.WhatsApp}
              onClick={confirmReject}>
              Enviar rechazo por WhatsApp
            </Button>
          </>
        }
      >
        {rejectModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 14, background: 'var(--dc-slate-50)', borderRadius: 10, border: '1px solid var(--dc-border)' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{rejectModal.nombre}</div>
              <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginTop: 3, fontFamily: 'var(--dc-font-mono)' }}>
                {fmtISO(rejectModal.fecha)} · {rejectModal.hora} · Suc. {rejectModal.sucursal_id}
              </div>
              <div style={{ fontSize: 12, color: 'var(--dc-fg-2)', marginTop: 2 }}>{rejectModal.motivo}</div>
            </div>
            <Field label="Motivo del rechazo (opcional)">
              <textarea
                className="textarea"
                rows="3"
                placeholder="Ej: El horario ya está ocupado. Te ofrecemos el martes a las 10:00…"
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
              />
              <div style={{ fontSize: 11, color: 'var(--dc-fg-3)', marginTop: 5 }}>
                Se incluirá en el mensaje de WhatsApp al paciente.
              </div>
            </Field>
          </div>
        )}
      </Modal>

      {/* Modal: detalle de cita */}
      <Modal
        open={!!detailAppt}
        onClose={() => setDetailAppt(null)}
        title="Detalle de cita"
        footer={
          <>
            {detailAppt?.estado !== 'cancelada' && detailAppt?.estado !== 'completada' && (
              <Button variant="secondary" size="sm" icon={Icons.X}
                style={{ color: 'var(--dc-alert)', borderColor: 'rgba(220,38,38,0.3)' }}
                onClick={cancelAppt}>
                Cancelar cita
              </Button>
            )}
            <div style={{ flex: 1 }} />
            <Button variant="secondary" onClick={() => setDetailAppt(null)}>Cerrar</Button>
            {detailAppt && detailAppt.estado !== 'cancelada' && detailAppt.estado !== 'completada' && (
              <Button icon={Icons.Check} onClick={advanceEstado}>
                {nextBtnLabel(detailAppt.estado)}
              </Button>
            )}
          </>
        }
      >
        {detailAppt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {detailAppt.paciente}
                  {detailAppt.estado === 'confirmada' && (
                    <Icons.CheckCircle size={16} style={{ color: '#047857', marginLeft: 6, verticalAlign: 'middle' }} />
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--dc-fg-3)', marginTop: 4 }}>
                  {detailAppt.doctor} · Suc. {detailAppt.sucursal_id || 'A'}
                </div>
              </div>
              <Badge status={detailAppt.estado} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, background: 'var(--dc-slate-50)', padding: 16, borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--dc-fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Hora</div>
                <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--dc-font-mono)' }}>{fmtHora(detailAppt.hora)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--dc-fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Duración</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{fmtDur(detailAppt.dur || 1)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--dc-fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Tratamiento</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{detailAppt.tratamiento || 'Consulta'}</div>
              </div>
            </div>

            {detailAppt.estado === 'confirmada' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#ECFDF5', borderRadius: 8, color: '#047857', fontSize: 12 }}>
                <Icons.WhatsApp size={16} />
                <span>Cita confirmada — paciente notificado por WhatsApp.</span>
              </div>
            )}
            {detailAppt.estado === 'cancelada' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FEF2F2', borderRadius: 8, color: '#B91C1C', fontSize: 12 }}>
                <Icons.X size={16} />
                <span>Esta cita fue cancelada.</span>
              </div>
            )}
            {detailAppt.notas && (
              <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', padding: '10px 14px', background: 'rgba(94,234,212,0.1)', borderRadius: 8 }}>
                <strong>Notas:</strong> {detailAppt.notas}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Agenda;
