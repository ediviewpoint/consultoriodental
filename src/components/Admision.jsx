import { useState, useEffect } from 'react';
import { Icons } from './icons';
import { Button, Card, Field, Avatar } from './ui';
import { admitirPaciente, buscarPorCI, buscarPacientes } from '../lib/db';

const CUESTIONARIO = [
  { id: 'hipertension',    label: 'Hipertensión arterial'      },
  { id: 'diabetes',        label: 'Diabetes mellitus'          },
  { id: 'cardiopatia',     label: 'Cardiopatía'                },
  { id: 'epilepsia',       label: 'Epilepsia / convulsiones'   },
  { id: 'embarazo',        label: 'Embarazo o lactancia'       },
  { id: 'anticoagulante',  label: 'Anticoagulantes / aspirina' },
  { id: 'hepatitis',       label: 'Hepatitis / VIH'            },
  { id: 'anemia',          label: 'Anemia'                     },
  { id: 'asma',            label: 'Asma / pulmonares'          },
  { id: 'alergia_meds',    label: 'Alergia a medicamentos'     },
  { id: 'cirugia_prev',    label: 'Cirugías previas'           },
  { id: 'hospitalizacion', label: 'Hospitalización reciente'   },
];

const HABITOS     = ['Fumador', 'Alcohol frecuente', 'Bruxismo', 'Apertura limitada', 'Dolor ATM'];
const DERIVACIONES = ['Ortodoncia', 'Cirugía maxilofacial', 'Endodoncia especializada', 'Periodoncia', 'Implantología', 'Radiología'];

// ── Pantalla 0: búsqueda previa ───────────────────────────────────
const BusquedaPrevia = ({ onNuevo, onVerFicha, onCancel }) => {
  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState([]);
  const [buscando,   setBuscando]   = useState(false);
  const [hasBuscado, setHasBuscado] = useState(false);

  useEffect(() => {
    setHasBuscado(false);
    setResults([]);
    if (query.trim().length < 2) return;
    const t = setTimeout(async () => {
      setBuscando(true);
      try {
        const found = await buscarPacientes(query);
        setResults(found);
        setHasBuscado(true);
      } catch { } finally {
        setBuscando(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">Admisión de paciente</h2>
          <p className="page-sub">Primero verifica si el paciente ya está registrado</p>
        </div>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>

      <Card pad="lg">
        <div style={{ marginBottom: 22 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>
            ¿Ya estuvo antes en la clínica?
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--dc-fg-3)' }}>
            Busca por nombre, apellido, teléfono o C.I. — si aparece, abre su ficha directamente.
          </p>
        </div>

        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Icons.Search size={16} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--dc-fg-3)', pointerEvents: 'none',
          }} />
          <input
            className="input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ej: Edgar, 765 3210, 7823451…"
            autoFocus
            style={{ paddingLeft: 38, fontSize: 15 }}
          />
          {buscando && (
            <span style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              fontSize: 12, color: 'var(--dc-fg-3)',
            }}>
              Buscando…
            </span>
          )}
        </div>

        {results.length > 0 && (
          <div>
            {results.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 0',
                borderBottom: i < results.length - 1 ? '1px solid var(--dc-divider)' : 'none',
              }}>
                <Avatar initials={p.avatar} color={p.avatarColor} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.nombre} {p.apellidos}</div>
                  <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginTop: 2 }}>
                    {p.tel && <span>Tel: {p.tel}</span>}
                    {p.ci && <span style={{ marginLeft: 10 }}>C.I.: {p.ci}</span>}
                    {p.sucursalId && <span style={{ marginLeft: 10 }}>Suc. {p.sucursalId}</span>}
                  </div>
                </div>
                <Button onClick={() => onVerFicha(p.id)}>Ver ficha →</Button>
              </div>
            ))}
          </div>
        )}

        {hasBuscado && results.length === 0 && (
          <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 13 }}>
            <Icons.Search size={28} style={{ opacity: 0.25, display: 'block', margin: '0 auto 10px' }} />
            No se encontró ningún paciente con "{query}"
          </div>
        )}

        {!hasBuscado && !buscando && query.trim().length < 2 && (
          <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 13, opacity: 0.6 }}>
            Escribe al menos 2 caracteres para buscar
          </div>
        )}
      </Card>

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <Button icon={Icons.Plus} onClick={onNuevo}>
          {hasBuscado && results.length === 0
            ? 'No está en el sistema — Registrar como nuevo →'
            : 'Registrar paciente nuevo →'}
        </Button>
      </div>
    </div>
  );
};

// ── Paso 1: Datos personales ──────────────────────────────────────
const Step1 = ({ form, onChange, doctors, sucursales, isDoctor, duplicado, buscandoCI, ignorarDup, onIgnorar, onVerFicha }) => {
  const sucEntries  = sucursales ? Object.entries(sucursales) : [['A', { nombre: 'Sucursal A' }], ['B', { nombre: 'Sucursal B' }]];
  const docsFiltrados = doctors.filter(d => !form.consultorio || d.consultorio === form.consultorio);

  return (
    <div>
      <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Datos personales</h3>

      {/* Banner duplicado por CI */}
      {duplicado && !ignorarDup && (
        <div style={{
          background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 10,
          padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <Icons.AlertCircle size={18} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#92400E' }}>
              Ya existe un paciente con C.I. {form.ci}
            </div>
            <div style={{ fontSize: 12, color: '#78350F', marginTop: 3 }}>
              {duplicado.nombre} {duplicado.apellidos}
              {duplicado.tel ? ` · Tel: ${duplicado.tel}` : ''}
              {duplicado.sucursal_id ? ` · Suc. ${duplicado.sucursal_id}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Button onClick={onVerFicha} style={{ fontSize: 12 }}>Ver ficha →</Button>
            <Button variant="secondary" onClick={onIgnorar} style={{ fontSize: 12 }}>Continuar de todas formas</Button>
          </div>
        </div>
      )}

      {buscandoCI && (
        <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginBottom: 12 }}>
          Verificando C.I. en el sistema…
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Nombre(s) *">
          <input className="input" value={form.nombre} placeholder="Ej: María Elena" onChange={e => onChange('nombre', e.target.value)} />
        </Field>
        <Field label="Apellidos *">
          <input className="input" value={form.apellidos} placeholder="Ej: Mamani Quispe" onChange={e => onChange('apellidos', e.target.value)} />
        </Field>
        <Field label="C.I.">
          <input className="input" value={form.ci} placeholder="7823451 (opcional)" onChange={e => onChange('ci', e.target.value)} style={{ fontFamily: 'var(--dc-font-mono)' }} />
        </Field>
        <Field label="Fecha de nacimiento">
          <input className="input" type="date" value={form.fechaNac} onChange={e => onChange('fechaNac', e.target.value)} />
        </Field>
        <Field label="Teléfono / Celular *">
          <input className="input" value={form.tel} placeholder="7823 4512" onChange={e => onChange('tel', e.target.value)} style={{ fontFamily: 'var(--dc-font-mono)' }} />
        </Field>
        <Field label="Correo electrónico">
          <input className="input" type="email" value={form.email} placeholder="correo@gmail.com" onChange={e => onChange('email', e.target.value)} />
        </Field>
        <Field label="Sexo">
          <select className="select" value={form.sexo} onChange={e => onChange('sexo', e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
            <option value="O">Otro</option>
          </select>
        </Field>
        <Field label="Estado civil">
          <select className="select" value={form.estadoCivil} onChange={e => onChange('estadoCivil', e.target.value)}>
            <option value="">Seleccionar...</option>
            <option>Soltero/a</option><option>Casado/a</option>
            <option>Unión libre</option><option>Divorciado/a</option><option>Viudo/a</option>
          </select>
        </Field>
        <Field label="Sucursal *">
          <select
            className="select" value={form.consultorio} disabled={isDoctor}
            onChange={e => { onChange('consultorio', e.target.value); onChange('doctor', ''); }}
            style={isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            {sucEntries.map(([k, s]) => (
              <option key={k} value={k}>Sucursal {k} — {s.nombre}</option>
            ))}
          </select>
        </Field>
        <Field label="Doctor asignado *">
          <select
            className="select" value={form.doctor} disabled={isDoctor}
            onChange={e => onChange('doctor', e.target.value)}
            style={isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            <option value="">Seleccionar...</option>
            {docsFiltrados.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Dirección" style={{ gridColumn: '1 / -1' }}>
          <input className="input" value={form.direccion} placeholder="Calle, barrio, ciudad" onChange={e => onChange('direccion', e.target.value)} />
        </Field>
        <Field label="Referido por">
          <input className="input" value={form.referido} placeholder="Nombre del referente (opcional)" onChange={e => onChange('referido', e.target.value)} />
        </Field>
        <Field label="Ocupación">
          <input className="input" value={form.ocupacion} placeholder="Ej: docente, comerciante..." onChange={e => onChange('ocupacion', e.target.value)} />
        </Field>
      </div>
    </div>
  );
};

// ── Paso 2: Historia clínica ──────────────────────────────────────
const Step2 = ({ form, onChange }) => {
  const toggleQ = (id) => onChange('cuestionario', { ...form.cuestionario, [id]: !form.cuestionario[id] });
  const toggleH = (h)  => onChange('habitos',      { ...form.habitos,      [h]:  !form.habitos[h]       });

  return (
    <div>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>Historia clínica</h3>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--dc-fg-3)' }}>Marcar las condiciones que apliquen al paciente</p>

      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 12 }}>
        Antecedentes médicos
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {CUESTIONARIO.map(q => {
          const active = !!form.cuestionario[q.id];
          return (
            <button key={q.id} onClick={() => toggleQ(q.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8,
              border: `1.5px solid ${active ? '#DC2626' : 'var(--dc-border)'}`,
              background: active ? '#FEF2F2' : '#fff',
              color: active ? '#DC2626' : 'var(--dc-fg-2)',
              textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400,
            }}>
              <span style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${active ? '#DC2626' : 'var(--dc-border)'}`, background: active ? '#DC2626' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {active && <Icons.Check size={11} style={{ color: '#fff' }} />}
              </span>
              {q.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <Field label="Alergias conocidas">
          <input className="input" value={form.alergias} placeholder="Ej: penicilina, latex..." onChange={e => onChange('alergias', e.target.value)} />
        </Field>
        <Field label="Medicación actual">
          <input className="input" value={form.medicacion} placeholder="Medicamentos que toma..." onChange={e => onChange('medicacion', e.target.value)} />
        </Field>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 10 }}>Hábitos relevantes</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {HABITOS.map(h => {
          const active = !!form.habitos[h];
          return (
            <button key={h} onClick={() => toggleH(h)} style={{
              padding: '5px 13px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: active ? 700 : 400,
              border: `1.5px solid ${active ? '#B45309' : 'var(--dc-border)'}`,
              background: active ? '#FFFBEB' : '#fff',
              color: active ? '#B45309' : 'var(--dc-fg-2)',
            }}>{h}</button>
          );
        })}
      </div>

      <Field label="Motivo de consulta principal">
        <textarea className="input" rows={3} value={form.motivo} placeholder="¿Por qué viene hoy?" onChange={e => onChange('motivo', e.target.value)} style={{ resize: 'vertical' }} />
      </Field>
    </div>
  );
};

// ── Paso 3: Diagnóstico ───────────────────────────────────────────
const Step3 = ({ form, onChange }) => {
  const toggle = (d) => {
    const prev = form.derivaciones;
    onChange('derivaciones', prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  return (
    <div>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>Diagnóstico inicial y plan</h3>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--dc-fg-3)' }}>Resumen del doctor tras la primera consulta</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        <Field label="Diagnóstico inicial">
          <textarea className="input" rows={3} value={form.diagnostico} placeholder="Hallazgos clínicos, estado general bucal..." onChange={e => onChange('diagnostico', e.target.value)} style={{ resize: 'vertical' }} />
        </Field>
        <Field label="Plan de tratamiento sugerido">
          <textarea className="input" rows={3} value={form.planTexto} placeholder="Tratamientos a realizar, orden de atención..." onChange={e => onChange('planTexto', e.target.value)} style={{ resize: 'vertical' }} />
        </Field>
        <Field label="Observaciones adicionales">
          <textarea className="input" rows={2} value={form.observaciones} placeholder="Notas del doctor..." onChange={e => onChange('observaciones', e.target.value)} style={{ resize: 'vertical' }} />
        </Field>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 10 }}>Derivaciones sugeridas</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {DERIVACIONES.map(d => {
          const active = form.derivaciones.includes(d);
          return (
            <button key={d} onClick={() => toggle(d)} style={{
              padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: active ? 700 : 400,
              border: `1.5px solid ${active ? 'var(--dc-primary)' : 'var(--dc-border)'}`,
              background: active ? 'var(--dc-primary)' : '#fff',
              color: active ? '#fff' : 'var(--dc-fg-2)',
            }}>{d}</button>
          );
        })}
      </div>

      {form.derivaciones.length > 0 && (
        <div style={{ background: '#F0FDFA', border: '1px solid #A7F3D0', borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dc-primary)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Derivaciones seleccionadas</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {form.derivaciones.map(d => (
              <span key={d} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: 'var(--dc-primary)', color: '#fff' }}>{d}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const STEPS = [
  { id: 1, label: 'Datos personales'   },
  { id: 2, label: 'Historia clínica'   },
  { id: 3, label: 'Diagnóstico y plan' },
];

const INIT = {
  nombre: '', apellidos: '', ci: '', fechaNac: '', tel: '', email: '',
  sexo: '', estadoCivil: '', consultorio: 'A', doctor: '',
  direccion: '', referido: '', ocupacion: '',
  cuestionario: {}, habitos: {}, alergias: '', medicacion: '', motivo: '',
  diagnostico: '', planTexto: '', observaciones: '', derivaciones: [],
};

// ── Principal ─────────────────────────────────────────────────────
const Admision = ({ onComplete, onCancel, onOpenExisting, doctors = [], sucursales, user }) => {
  const isDoctor = user?.role === 'doctor';
  const myDoctor = isDoctor ? doctors.find(d => d.id === user.doctorId) : null;

  const [fase,       setFase]       = useState('buscar');
  const [step,       setStep]       = useState(1);
  const [form,       setForm]       = useState(() => ({
    ...INIT,
    doctor:      myDoctor?.name        || '',
    consultorio: myDoctor?.consultorio || 'A',
  }));
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [duplicado,  setDuplicado]  = useState(null);
  const [buscandoCI, setBuscandoCI] = useState(false);
  const [ignorarDup, setIgnorarDup] = useState(false);

  // Detección de CI duplicado dentro del formulario
  useEffect(() => {
    if (fase !== 'registrar') return;
    setIgnorarDup(false);
    setDuplicado(null);
    if (form.ci.trim().length < 5) return;
    const t = setTimeout(async () => {
      setBuscandoCI(true);
      try {
        const found = await buscarPorCI(form.ci.trim());
        setDuplicado(found);
      } catch { } finally {
        setBuscandoCI(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [form.ci, fase]);

  const onChange = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const canNext = step === 1
    ? form.nombre.trim() && form.apellidos.trim() && form.tel.trim() && form.doctor && (!duplicado || ignorarDup)
    : true;

  const handleFinish = async () => {
    setSaving(true);
    setError('');
    try {
      await admitirPaciente(form, doctors);
      onComplete();
    } catch (err) {
      console.error(err);
      setError('Error al guardar. Por favor intenta de nuevo.');
      setSaving(false);
    }
  };

  // Fase 0: búsqueda previa
  if (fase === 'buscar') {
    return (
      <BusquedaPrevia
        onNuevo={() => setFase('registrar')}
        onVerFicha={(id) => { onCancel(); onOpenExisting?.(id); }}
        onCancel={onCancel}
      />
    );
  }

  // Fases 1-3: formulario de registro
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">Admisión de paciente nuevo</h2>
          <p className="page-sub">Complete los 3 pasos para registrar al paciente</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={() => setFase('buscar')}>← Volver a búsqueda</Button>
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, flexShrink: 0,
                background: step > s.id ? 'var(--dc-positive)' : step === s.id ? 'var(--dc-primary)' : 'var(--dc-slate-100)',
                color: step >= s.id ? '#fff' : 'var(--dc-fg-3)',
              }}>
                {step > s.id ? <Icons.Check size={14} /> : s.id}
              </div>
              <span style={{
                fontSize: 13, whiteSpace: 'nowrap',
                fontWeight: step === s.id ? 700 : 500,
                color: step === s.id ? 'var(--dc-primary)' : step > s.id ? 'var(--dc-positive)' : 'var(--dc-fg-3)',
              }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step > s.id ? 'var(--dc-positive)' : 'var(--dc-border)', margin: '0 14px' }} />
            )}
          </div>
        ))}
      </div>

      <Card pad="lg" style={{ marginBottom: 20 }}>
        {step === 1 && (
          <Step1
            form={form} onChange={onChange} doctors={doctors} sucursales={sucursales}
            isDoctor={isDoctor} duplicado={duplicado} buscandoCI={buscandoCI}
            ignorarDup={ignorarDup} onIgnorar={() => setIgnorarDup(true)}
            onVerFicha={() => { onCancel(); onOpenExisting?.(duplicado.id); }}
          />
        )}
        {step === 2 && <Step2 form={form} onChange={onChange} />}
        {step === 3 && <Step3 form={form} onChange={onChange} />}
      </Card>

      {error && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: '#FEF2F2', color: '#DC2626', fontSize: 13, borderRadius: 8, border: '1px solid #FECACA' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="secondary" onClick={step === 1 ? () => setFase('buscar') : () => setStep(s => s - 1)}>
          {step === 1 ? '← Volver a búsqueda' : '← Anterior'}
        </Button>
        {step < 3
          ? <Button disabled={!canNext} onClick={() => setStep(s => s + 1)}>Siguiente →</Button>
          : <Button icon={Icons.Check} disabled={saving} onClick={handleFinish}>{saving ? 'Guardando...' : 'Registrar paciente'}</Button>
        }
      </div>
    </div>
  );
};

export default Admision;
