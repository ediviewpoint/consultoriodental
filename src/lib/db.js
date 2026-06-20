import { supabase } from './supabase';

const isoToLocale = (iso) =>
  iso ? new Date(iso + 'T00:00:00').toLocaleDateString('es-BO') : '—';

// ── Auth / Perfiles ───────────────────────────────────────────────
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('perfiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return { id: userId, name: data.nombre, role: data.rol, doctorId: data.doctor_id };
};

// ── Sucursales ────────────────────────────────────────────────────
export const getSucursales = async () => {
  const { data, error } = await supabase.from('sucursales').select('*');
  if (error) throw error;
  return Object.fromEntries(
    data.map(s => [s.id, { nombre: s.nombre, dir: s.dir, ciudad: s.ciudad, tel: s.tel }])
  );
};

export const saveSucursales = async (suc) => {
  const rows = Object.entries(suc).map(([id, s]) => ({
    id, nombre: s.nombre, dir: s.dir, ciudad: s.ciudad, tel: s.tel,
  }));
  const { error } = await supabase.from('sucursales').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
};

// ── Doctores ──────────────────────────────────────────────────────
export const getDoctores = async () => {
  const { data, error } = await supabase.from('doctores').select('*').order('id');
  if (error) throw error;
  return data.map(d => ({
    id: d.id, name: d.nombre, short: d.iniciales,
    color: d.color, consultorio: d.sucursal_id, comision: Number(d.comision),
  }));
};

export const saveDocorComision = async (id, comision) => {
  const { error } = await supabase.from('doctores').update({ comision }).eq('id', id);
  if (error) throw error;
};

export const createDoctor = async ({ nombre, iniciales, sucursal_id, comision, color }) => {
  const { data, error } = await supabase
    .from('doctores')
    .insert({ nombre, iniciales, sucursal_id, comision, color })
    .select().single();
  if (error) throw error;
  return data;
};

export const updateDoctor = async (id, { nombre, iniciales, sucursal_id, comision, color }) => {
  const { data, error } = await supabase
    .from('doctores')
    .update({ nombre, iniciales, sucursal_id, comision, color })
    .eq('id', id)
    .select().single();
  if (error) throw error;
  return data;
};

export const deleteDoctor = async (id) => {
  const { error } = await supabase.from('doctores').delete().eq('id', id);
  if (error) throw error;
};

// ── Catálogo ──────────────────────────────────────────────────────
export const getCatalogo = async () => {
  const { data, error } = await supabase
    .from('catalogo_tratamientos').select('*').order('id');
  if (error) throw error;
  return data.map(t => ({
    id: t.id, tratamiento: t.tratamiento, categoria: t.categoria,
    precio: Number(t.precio), material: Number(t.material),
  }));
};

export const saveCatalogo = async (items) => {
  const { error } = await supabase
    .from('catalogo_tratamientos')
    .upsert(items.map(t => ({ id: t.id, precio: t.precio, material: t.material })),
      { onConflict: 'id' });
  if (error) throw error;
};

// ── Pacientes ─────────────────────────────────────────────────────
export const getPacientes = async () => {
  const { data, error } = await supabase
    .from('pacientes').select('*, doctores(nombre)').order('apellidos');
  if (error) throw error;
  return data.map(p => ({
    id: p.id, nombre: p.nombre, apellidos: p.apellidos,
    ci: p.ci || '', edad: p.edad, tel: p.tel || '', email: p.email || '',
    doctor: p.doctores?.nombre || '', doctor_id: p.doctor_id,
    consultorio: p.sucursal_id,
    ultimaVisita: p.ultima_visita ? isoToLocale(p.ultima_visita) : '—',
    estado: p.estado,
    avatar: p.avatar || (p.nombre[0] + (p.apellidos?.[0] || '')).toUpperCase(),
    avatarColor: p.avatar_color || '#0D9488',
  }));
};

export const getPaciente = async (id) => {
  const { data, error } = await supabase
    .from('pacientes').select('*, doctores(nombre)').eq('id', id).single();
  if (error) throw error;
  return {
    id: data.id, nombre: data.nombre, apellidos: data.apellidos,
    ci: data.ci || '', edad: data.edad, tel: data.tel || '', email: data.email || '',
    doctor: data.doctores?.nombre || '', doctor_id: data.doctor_id,
    consultorio: data.sucursal_id,
    ultimaVisita: data.ultima_visita ? isoToLocale(data.ultima_visita) : '—',
    estado: data.estado,
    avatar: data.avatar || (data.nombre[0] + (data.apellidos?.[0] || '')).toUpperCase(),
    avatarColor: data.avatar_color || '#0D9488',
  };
};

const AVATAR_COLORS = ['#0D9488','#3B82F6','#F59E0B','#FB923C','#10B981','#8B5CF6'];

export const createPaciente = async (form, doctors) => {
  const doc = doctors.find(d => d.name === form.doctor);
  const initials = (form.nombre[0] + (form.apellidos[0] || '')).toUpperCase();
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const { data, error } = await supabase.from('pacientes').insert({
    nombre: form.nombre.trim(), apellidos: form.apellidos.trim(),
    ci: form.ci.trim(), edad: Number(form.edad),
    tel: form.tel.trim(), email: form.email?.trim() || null,
    doctor_id: doc?.id || null, sucursal_id: form.consultorio,
    estado: 'activo', avatar: initials, avatar_color: color,
  }).select('*, doctores(nombre)').single();
  if (error) throw error;
  return {
    id: data.id, nombre: data.nombre, apellidos: data.apellidos,
    ci: data.ci || '', edad: data.edad, tel: data.tel || '', email: data.email || '',
    doctor: data.doctores?.nombre || '', doctor_id: data.doctor_id,
    consultorio: data.sucursal_id, ultimaVisita: '—', estado: 'activo',
    avatar: data.avatar, avatarColor: data.avatar_color,
  };
};

export const admitirPaciente = async (form, doctors) => {
  const doc = doctors.find(d => d.name === form.doctor);
  const initials = (form.nombre[0] + (form.apellidos[0] || '')).toUpperCase();
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const { data: paciente, error: pErr } = await supabase.from('pacientes').insert({
    nombre: form.nombre.trim(), apellidos: form.apellidos.trim(),
    ci: form.ci.trim(), fecha_nac: form.fechaNac || null,
    tel: form.tel.trim(), email: form.email?.trim() || null,
    sexo: form.sexo || null, estado_civil: form.estadoCivil || null,
    direccion: form.direccion || null, referido: form.referido || null,
    ocupacion: form.ocupacion || null,
    doctor_id: doc?.id || null, sucursal_id: form.consultorio,
    estado: 'activo', avatar: initials, avatar_color: color,
  }).select().single();
  if (pErr) throw pErr;
  await supabase.from('historia_clinica').insert({
    paciente_id: paciente.id,
    cuestionario: form.cuestionario || {},
    alergias: form.alergias || null, medicacion: form.medicacion || null,
    habitos: form.habitos || {}, motivo: form.motivo || null,
    diagnostico: form.diagnostico || null, plan_texto: form.planTexto || null,
    observaciones: form.observaciones || null, derivaciones: form.derivaciones || [],
  });
  return paciente;
};

export const updatePaciente = async (id, updates) => {
  const { error } = await supabase.from('pacientes').update(updates).eq('id', id);
  if (error) throw error;
};

// ── Citas ─────────────────────────────────────────────────────────
export const getCitas = async (startDate, endDate) => {
  const { data, error } = await supabase
    .from('citas').select('*, doctores(nombre)')
    .gte('fecha', startDate).lte('fecha', endDate);
  if (error) throw error;
  return data;
};

export const createCita = async (cita) => {
  const { data, error } = await supabase
    .from('citas').insert(cita).select('*, doctores(nombre)').single();
  if (error) throw error;
  return data;
};

export const updateCitaEstado = async (id, estado) => {
  const { error } = await supabase.from('citas').update({ estado }).eq('id', id);
  if (error) throw error;
};

export const getCitasHistorial = async (startDate, endDate, doctorId) => {
  const { data, error } = await supabase
    .from('citas')
    .select('*, doctores(nombre)')
    .eq('doctor_id', doctorId)
    .gte('fecha', startDate)
    .lte('fecha', endDate)
    .neq('estado', 'cancelada')
    .order('fecha', { ascending: false })
    .order('hora', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const getCitasCompletadas = async (startDate, endDate, doctorId = null) => {
  let q = supabase
    .from('citas')
    .select('*, doctores(nombre, comision, iniciales, color)')
    .eq('estado', 'completada')
    .gte('fecha', startDate)
    .lte('fecha', endDate)
    .order('fecha', { ascending: true });
  if (doctorId) q = q.eq('doctor_id', doctorId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
};

// ── Solicitudes ───────────────────────────────────────────────────
export const getSolicitudesPendientes = async (doctorId = null) => {
  let q = supabase
    .from('solicitudes')
    .select('*, doctores(nombre)')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false });
  if (doctorId) q = q.eq('doctor_id', doctorId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
};

export const createSolicitud = async (sol) => {
  const { data, error } = await supabase.from('solicitudes').insert(sol).select().single();
  if (error) throw error;
  return data;
};

export const updateSolicitudEstado = async (id, estado, nota = null) => {
  const updates = { estado };
  if (nota) updates.nota_rechazo = nota;
  const { error } = await supabase.from('solicitudes').update(updates).eq('id', id);
  if (error) throw error;
};

export const getOcupadosDia = async (fecha, doctorId = null) => {
  let q1 = supabase.from('solicitudes').select('hora').eq('fecha', fecha).eq('estado', 'aceptada');
  let q2 = supabase.from('citas').select('hora').eq('fecha', fecha).neq('estado', 'cancelada');
  if (doctorId) {
    q1 = q1.eq('doctor_id', doctorId);
    q2 = q2.eq('doctor_id', doctorId);
  }
  const [{ data: s }, { data: c }] = await Promise.all([q1, q2]);
  return new Set([...((s || []).map(x => x.hora)), ...((c || []).map(x => x.hora))]);
};

// ── Historia clínica ──────────────────────────────────────────────
export const getHistoriaClinica = async (pacienteId) => {
  const { data } = await supabase
    .from('historia_clinica').select('*').eq('paciente_id', pacienteId).maybeSingle();
  return data || null;
};

export const saveHistoriaClinica = async (pacienteId, hc) => {
  const { error } = await supabase.from('historia_clinica').upsert(
    { paciente_id: pacienteId, ...hc, updated_at: new Date().toISOString() },
    { onConflict: 'paciente_id' }
  );
  if (error) throw error;
};

// ── Historial clínico ─────────────────────────────────────────────
export const getHistorialClinico = async (pacienteId) => {
  const { data, error } = await supabase
    .from('historial_clinico').select('*, doctores(nombre)')
    .eq('paciente_id', pacienteId).order('fecha', { ascending: false });
  if (error) throw error;
  return (data || []).map(h => ({
    fecha: isoToLocale(h.fecha), tratamiento: h.tratamiento,
    doctor: h.doctores?.nombre || '', monto: Number(h.monto || 0), pagado: h.pagado,
  }));
};

// ── Plan de tratamiento ───────────────────────────────────────────
export const getPlanTratamiento = async (pacienteId) => {
  const { data: planes } = await supabase
    .from('planes_tratamiento').select('*').eq('paciente_id', pacienteId)
    .order('created_at', { ascending: false }).limit(1);
  if (!planes?.length) return null;
  const plan = planes[0];
  const { data: pasos } = await supabase
    .from('pasos_plan').select('*').eq('plan_id', plan.id).order('numero');
  const { data: abonos } = await supabase
    .from('abonos').select('*, doctores(nombre)').eq('plan_id', plan.id).order('created_at');
  return {
    id: plan.id, titulo: plan.titulo,
    inicio: plan.fecha_inicio ? isoToLocale(plan.fecha_inicio) : '',
    montoTotal: Number(plan.monto_total),
    pasos: (pasos || []).map(p => ({
      n: p.numero, descripcion: p.descripcion,
      monto: Number(p.monto), estado: p.estado, _id: p.id,
    })),
    abonos: (abonos || []).map(a => ({
      fecha: isoToLocale(a.fecha), monto: Number(a.monto),
      metodo: a.metodo, recibo: a.recibo,
      doctor: a.doctores?.nombre || '', _id: a.id,
    })),
  };
};

export const updatePasoEstado = async (pasoId, estado) => {
  const { error } = await supabase.from('pasos_plan').update({ estado }).eq('id', pasoId);
  if (error) throw error;
};

export const createAbono = async (planId, abono, doctorId) => {
  const today = new Date().toISOString().split('T')[0];
  const { error } = await supabase.from('abonos').insert({
    plan_id: planId, fecha: today, monto: abono.monto,
    metodo: abono.metodo, recibo: abono.recibo || null, doctor_id: doctorId,
  });
  if (error) throw error;
};

// ── Estado dental ─────────────────────────────────────────────────
export const getEstadoDental = async (pacienteId) => {
  const { data } = await supabase
    .from('estado_dental').select('*').eq('paciente_id', pacienteId);
  return Object.fromEntries((data || []).map(d => [d.pieza, d.estado]));
};

export const upsertEstadoDental = async (pacienteId, pieza, estado) => {
  if (estado === undefined) {
    await supabase.from('estado_dental')
      .delete().eq('paciente_id', pacienteId).eq('pieza', pieza);
  } else {
    await supabase.from('estado_dental').upsert(
      { paciente_id: pacienteId, pieza, estado, updated_at: new Date().toISOString() },
      { onConflict: 'paciente_id,pieza' }
    );
  }
};

// ── Pagos ─────────────────────────────────────────────────────────
export const getPagos = async (pacienteId) => {
  const { data, error } = await supabase
    .from('pagos').select('*').eq('paciente_id', pacienteId)
    .order('fecha', { ascending: false });
  if (error) throw error;
  return (data || []).map(p => ({
    fecha: isoToLocale(p.fecha), tratamiento: p.tratamiento,
    monto: Number(p.monto), metodo: p.metodo,
    banco: p.banco_id, ref: p.numero_recibo || '', _id: p.id,
  }));
};

// ── Imágenes clínicas ─────────────────────────────────────────────
export const getImagenes = async (pacienteId) => {
  const { data } = await supabase
    .from('imagenes_clinicas').select('*').eq('paciente_id', pacienteId)
    .order('created_at', { ascending: false });
  return (data || []).map(i => ({
    fecha: i.fecha ? isoToLocale(i.fecha) : '',
    descripcion: i.descripcion, tipo: i.tipo, url: i.url, _id: i.id,
  }));
};

export const createImagen = async (pacienteId, img) => {
  const today = new Date().toISOString().split('T')[0];
  await supabase.from('imagenes_clinicas').insert({
    paciente_id: pacienteId, fecha: today,
    descripcion: img.descripcion, tipo: img.tipo, url: img.url || null,
  });
};

// ── Consentimientos ───────────────────────────────────────────────
export const getConsentimientos = async (pacienteId) => {
  const { data } = await supabase
    .from('consentimientos').select('*').eq('paciente_id', pacienteId)
    .order('created_at', { ascending: false });
  return (data || []).map(c => ({
    documento: c.documento,
    fecha: c.fecha ? isoToLocale(c.fecha) : '',
    firmado: c.firmado, _id: c.id,
  }));
};

export const updateConsentimientoFirmado = async (id, firmado) => {
  await supabase.from('consentimientos').update({ firmado }).eq('id', id);
};

export const createConsentimiento = async (pacienteId, doc) => {
  const today = new Date().toISOString().split('T')[0];
  await supabase.from('consentimientos').insert({
    paciente_id: pacienteId, documento: doc.documento, fecha: today, firmado: false,
  });
};

// ── Deuda viva ────────────────────────────────────────────────────
export const getDeudaViva = async () => {
  const { data: planes, error } = await supabase
    .from('planes_tratamiento')
    .select('id, titulo, monto_total, paciente_id, pacientes(nombre, apellidos, tel, avatar, avatar_color)')
    .gt('monto_total', 0);
  if (error) throw error;

  const withSaldo = await Promise.all((planes || []).map(async (plan) => {
    const { data: abonos } = await supabase
      .from('abonos').select('monto').eq('plan_id', plan.id);
    const pagado = (abonos || []).reduce((s, a) => s + Number(a.monto), 0);
    const saldo  = Number(plan.monto_total) - pagado;
    if (saldo <= 0) return null;
    return {
      planId:     plan.id,
      pacienteId: plan.paciente_id,
      paciente:   `${plan.pacientes?.nombre || ''} ${plan.pacientes?.apellidos || ''}`.trim(),
      tel:        plan.pacientes?.tel || '',
      avatar:     plan.pacientes?.avatar || '?',
      avatarColor: plan.pacientes?.avatar_color || '#0D9488',
      titulo:     plan.titulo,
      montoTotal: Number(plan.monto_total),
      pagado,
      saldo,
    };
  }));

  return withSaldo.filter(Boolean).sort((a, b) => b.saldo - a.saldo);
};

// ── Perfiles / Usuarios ───────────────────────────────────────────
export const getPerfiles = async () => {
  const { data, error } = await supabase
    .from('perfiles').select('*').order('nombre');
  if (error) throw error;
  return data;
};

export const updatePerfil = async (id, updates) => {
  const { error } = await supabase.from('perfiles').update(updates).eq('id', id);
  if (error) throw error;
};

export const sendPasswordReset = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

export const buscarPorCI = async (ci) => {
  const { data } = await supabase
    .from('pacientes')
    .select('id, nombre, apellidos, tel, sucursal_id')
    .eq('ci', ci.trim())
    .maybeSingle();
  return data || null;
};

export const buscarPacientes = async (q) => {
  const term = q.trim();
  if (term.length < 2) return [];
  const { data } = await supabase
    .from('pacientes')
    .select('id, nombre, apellidos, tel, ci, sucursal_id, avatar, avatar_color')
    .or(`nombre.ilike.%${term}%,apellidos.ilike.%${term}%,tel.ilike.%${term}%,ci.ilike.%${term}%`)
    .limit(8);
  return (data || []).map(p => ({
    id: p.id,
    nombre: p.nombre,
    apellidos: p.apellidos,
    tel: p.tel || '',
    ci: p.ci || '',
    sucursalId: p.sucursal_id,
    avatar: p.avatar || (p.nombre[0] + (p.apellidos?.[0] || '')).toUpperCase(),
    avatarColor: p.avatar_color || '#0D9488',
  }));
};
