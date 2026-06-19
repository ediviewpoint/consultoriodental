import { useState, useEffect } from 'react';
import { Icons } from './icons';
import { Button, Card, Avatar, Badge, Search, Modal, Field } from './ui';
import { getPacientes, createPaciente } from '../lib/db';

const Pacientes = ({ onOpenPatient, user, doctors }) => {
  const isDoctor = user?.role === 'doctor';

  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter, setFilter]     = useState('todos');
  const [query, setQuery]       = useState('');
  const [modal, setModal]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});

  const defDoctor = isDoctor ? (doctors.find(d => d.id === user.doctorId)?.name || '') : (doctors[0]?.name || '');
  const [form, setForm] = useState({ nombre: '', apellidos: '', ci: '', edad: '', tel: '', email: '', doctor: defDoctor, consultorio: 'A' });

  // Update doctor default when doctors load
  useEffect(() => {
    if (!form.doctor && doctors.length) {
      setForm(f => ({ ...f, doctor: defDoctor }));
    }
  }, [doctors]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getPacientes()
      .then(data => {
        const filtered = isDoctor && user.doctorId ? data.filter(p => p.doctor_id === user.doctorId) : data;
        setPatients(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = true;
    if (!form.apellidos.trim()) e.apellidos = true;
    if (!form.ci.trim()) e.ci = true;
    if (!form.edad || isNaN(Number(form.edad))) e.edad = true;
    if (!form.tel.trim()) e.tel = true;
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const newPat = await createPaciente(form, doctors);
      setPatients(prev => [...prev, newPat]);
      setModal(false);
      setForm({ nombre: '', apellidos: '', ci: '', edad: '', tel: '', email: '', doctor: defDoctor, consultorio: 'A' });
      setErrors({});
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setModal(false);
    setForm({ nombre: '', apellidos: '', ci: '', edad: '', tel: '', email: '', doctor: defDoctor, consultorio: 'A' });
    setErrors({});
  };

  const list = patients.filter((p) => {
    if (filter === 'activos' && p.estado !== 'activo') return false;
    if (filter === 'sin-retorno' && p.estado !== 'sin-retorno') return false;
    if (query) {
      const q = query.toLowerCase();
      return (`${p.nombre} ${p.apellidos}`.toLowerCase().includes(q)
        || (p.ci || '').includes(q) || (p.tel || '').includes(q));
    }
    return true;
  });

  const filters = [
    { id: 'todos',      label: 'Todos',       count: patients.length },
    { id: 'activos',    label: 'Activos',     count: patients.filter(p => p.estado === 'activo').length },
    { id: 'sin-retorno',label: 'Sin retorno', count: patients.filter(p => p.estado === 'sin-retorno').length },
  ];

  const doctorObj = isDoctor ? doctors.find(d => d.id === user.doctorId) : null;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">{isDoctor ? `Mis Pacientes · ${doctorObj?.name ?? ''}` : 'Pacientes'}</h2>
          <p className="page-sub">{patients.length} pacientes registrados · {patients.filter(p => p.estado === 'sin-retorno').length} sin retorno hace +3 meses</p>
        </div>
        {!isDoctor && <Button icon={Icons.Plus} onClick={() => setModal(true)}>Nuevo Paciente</Button>}
      </div>

      <Card flush>
        <div style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'center', borderBottom: '1px solid var(--dc-divider)' }}>
          <div style={{ flex: 1, maxWidth: 380 }}>
            <Search value={query} onChange={setQuery} placeholder="Buscar por nombre, CI o celular…" />
          </div>
          <div className="toggle-group">
            {filters.map(f => (
              <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>
                {f.label} <span style={{ opacity: 0.55, marginLeft: 4 }}>{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 56 }}></th>
              <th>Nombre</th>
              <th>CI</th>
              <th>Celular</th>
              <th>Última visita</th>
              <th>Doctor</th>
              <th>Estado</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="8" className="empty-state">Cargando pacientes…</td></tr>
            )}
            {!loading && list.map((p) => (
              <tr key={p.id} className="clickable" onClick={() => onOpenPatient(p.id)}>
                <td><Avatar initials={p.avatar} color={p.avatarColor} /></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.nombre} {p.apellidos}</div>
                  <div style={{ fontSize: 12, color: 'var(--dc-fg-3)' }}>{p.email}</div>
                </td>
                <td style={{ color: 'var(--dc-fg-2)', fontFamily: 'var(--dc-font-mono)', fontSize: 13 }}>{p.ci}</td>
                <td style={{ color: 'var(--dc-fg-2)', fontFamily: 'var(--dc-font-mono)', fontSize: 13 }}>{p.tel}</td>
                <td>{p.ultimaVisita}</td>
                <td><span className="tag">{p.doctor}</span></td>
                <td>
                  {p.estado === 'activo'
                    ? <span className="badge badge-confirmed"><span className="dot"/>ACTIVO</span>
                    : <span className="badge badge-pending"><span className="dot"/>SIN RETORNO</span>}
                </td>
                <td>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onOpenPatient(p.id); }}>
                    Ver Ficha →
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && list.length === 0 && (
              <tr><td colSpan="8" className="empty-state">No se encontraron pacientes con esos criterios.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        open={modal}
        onClose={handleClose}
        title="Nuevo Paciente"
        footer={
          <>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSave} icon={Icons.Check} disabled={saving}>{saving ? 'Guardando…' : 'Guardar paciente'}</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Nombre *">
              <input
                className={`input${errors.nombre ? ' input-error' : ''}`}
                value={form.nombre}
                onChange={e => { upd('nombre', e.target.value); setErrors(er => ({ ...er, nombre: false })); }}
                placeholder="Ej: María Elena"
              />
            </Field>
            <Field label="Apellidos *">
              <input
                className={`input${errors.apellidos ? ' input-error' : ''}`}
                value={form.apellidos}
                onChange={e => { upd('apellidos', e.target.value); setErrors(er => ({ ...er, apellidos: false })); }}
                placeholder="Ej: Mamani Quispe"
              />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Carnet de Identidad (CI) *">
              <input
                className={`input${errors.ci ? ' input-error' : ''}`}
                value={form.ci}
                onChange={e => { upd('ci', e.target.value); setErrors(er => ({ ...er, ci: false })); }}
                placeholder="Ej: 7823451"
              />
            </Field>
            <Field label="Edad *">
              <input
                className={`input${errors.edad ? ' input-error' : ''}`}
                type="number"
                value={form.edad}
                onChange={e => { upd('edad', e.target.value); setErrors(er => ({ ...er, edad: false })); }}
                placeholder="Ej: 34"
                min="1" max="120"
              />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Celular *">
              <input
                className={`input${errors.tel ? ' input-error' : ''}`}
                value={form.tel}
                onChange={e => { upd('tel', e.target.value); setErrors(er => ({ ...er, tel: false })); }}
                placeholder="Ej: 7823 4512"
              />
            </Field>
            <Field label="Correo electrónico">
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={e => upd('email', e.target.value)}
                placeholder="paciente@gmail.com"
              />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Doctor asignado">
              <select
                className="select"
                value={form.doctor}
                onChange={e => upd('doctor', e.target.value)}
                disabled={isDoctor}
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Consultorio">
              <select className="select" value={form.consultorio} onChange={e => upd('consultorio', e.target.value)}>
                <option value="A">Consultorio A</option>
                <option value="B">Consultorio B</option>
              </select>
            </Field>
          </div>
          {Object.values(errors).some(Boolean) && (
            <div style={{ fontSize: 12, color: 'var(--dc-alert)', padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 6 }}>
              Completa los campos obligatorios (marcados con *).
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Pacientes;
