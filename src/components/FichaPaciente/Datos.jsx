import { useState } from 'react';
import { Icons } from '../icons';
import { Button, Field } from '../ui';
import { updatePaciente } from '../../lib/db';

const Datos = ({ p, onSave, doctors = [], sucursales }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: p.nombre, apellidos: p.apellidos, ci: p.ci, edad: p.edad,
    tel: p.tel, email: p.email, doctor: p.doctor,
    consultorio: p.consultorio, estado: p.estado,
  });
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const sucEntries = sucursales ? Object.entries(sucursales) : [['A', { nombre: 'Sucursal A' }], ['B', { nombre: 'Sucursal B' }]];

  const handleSave = async () => {
    setSaving(true);
    try {
      const docObj = doctors.find(d => d.name === form.doctor);
      await updatePaciente(p.id, {
        nombre: form.nombre.trim(), apellidos: form.apellidos.trim(),
        ci: form.ci.trim(), edad: Number(form.edad),
        tel: form.tel.trim(), email: form.email?.trim() || null,
        doctor_id: docObj?.id || null, sucursal_id: form.consultorio,
        estado: form.estado,
      });
      onSave({ ...form, doctor_id: docObj?.id || null });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const sucNombre = (k) => {
    if (sucursales?.[k]) return sucursales[k].nombre;
    return `Sucursal ${k}`;
  };

  const Row = ({ label, value, mono }) => (
    <div style={{ display: 'flex', alignItems: 'baseline', padding: '12px 0', borderBottom: '1px solid var(--dc-divider)' }}>
      <span style={{ width: 200, fontSize: 11.5, fontWeight: 600, color: 'var(--dc-fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, fontFamily: mono ? 'var(--dc-font-mono)' : 'inherit' }}>{value}</span>
    </div>
  );

  if (editing) return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Editar datos personales</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancelar</Button>
          <Button size="sm" icon={Icons.Check} onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Nombre"><input className="input" value={form.nombre} onChange={e => upd('nombre', e.target.value)} /></Field>
        <Field label="Apellidos"><input className="input" value={form.apellidos} onChange={e => upd('apellidos', e.target.value)} /></Field>
        <Field label="CI"><input className="input" value={form.ci} onChange={e => upd('ci', e.target.value)} /></Field>
        <Field label="Edad"><input className="input" type="number" value={form.edad} onChange={e => upd('edad', Number(e.target.value))} /></Field>
        <Field label="Celular"><input className="input" value={form.tel} onChange={e => upd('tel', e.target.value)} /></Field>
        <Field label="Correo electrónico"><input className="input" value={form.email} onChange={e => upd('email', e.target.value)} /></Field>
        <Field label="Doctor">
          <select className="select" value={form.doctor} onChange={e => upd('doctor', e.target.value)}>
            {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Consultorio">
          <select className="select" value={form.consultorio} onChange={e => upd('consultorio', e.target.value)}>
            {sucEntries.map(([k, s]) => (
              <option key={k} value={k}>Sucursal {k} — {s.nombre}</option>
            ))}
          </select>
        </Field>
        <Field label="Estado">
          <select className="select" value={form.estado} onChange={e => upd('estado', e.target.value)}>
            <option value="activo">Activo</option>
            <option value="sin-retorno">Sin retorno</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </Field>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Datos personales</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dc-positive)' }}>✓ Guardado</span>}
          <Button variant="secondary" size="sm" icon={Icons.Edit} onClick={() => setEditing(true)}>Editar datos</Button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <Row label="Nombre completo"     value={`${form.nombre} ${form.apellidos}`} />
          <Row label="Carnet de Identidad" value={form.ci}    mono />
          <Row label="Edad"                value={`${form.edad} años`} />
          <Row label="Celular"             value={form.tel}   mono />
          <Row label="Correo electrónico"  value={form.email} />
        </div>
        <div>
          <Row label="Doctor asignado" value={form.doctor} />
          <Row label="Sucursal"        value={`Suc. ${form.consultorio} — ${sucNombre(form.consultorio)}`} />
          <Row label="Última visita"   value={p.ultimaVisita} mono />
          <Row label="Estado"          value={form.estado === 'activo' ? 'Activo' : form.estado === 'sin-retorno' ? 'Sin retorno' : 'Inactivo'} />
        </div>
      </div>
    </div>
  );
};

export default Datos;
