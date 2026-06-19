import { useState, useEffect } from 'react';
import { Icons } from '../icons';
import { Button, Field } from '../ui';
import { getHistoriaClinica, saveHistoriaClinica } from '../../lib/db';

const CUESTIONARIO_HC = [
  { id: 'hipertension',   label: 'Hipertensión arterial'      },
  { id: 'diabetes',       label: 'Diabetes mellitus'          },
  { id: 'cardiopatia',    label: 'Cardiopatía'                },
  { id: 'epilepsia',      label: 'Epilepsia / convulsiones'   },
  { id: 'embarazo',       label: 'Embarazo o lactancia'       },
  { id: 'anticoagulante', label: 'Anticoagulantes / aspirina' },
  { id: 'hepatitis',      label: 'Hepatitis / VIH'            },
  { id: 'anemia',         label: 'Anemia'                     },
  { id: 'asma',           label: 'Asma / pulmonares'          },
  { id: 'alergia_meds',   label: 'Alergia a medicamentos'     },
  { id: 'cirugia_prev',   label: 'Cirugías previas'           },
  { id: 'hospitalizacion',label: 'Hospitalización reciente'   },
];

const HABITOS_HC = ['Fumador', 'Alcohol frecuente', 'Bruxismo', 'Apertura limitada', 'Dolor ATM'];

const EMPTY = {
  cuestionario: {}, alergias: '', medicacion: {}, habitos: {},
  motivo: '', examenExtraoral: '', examenIntraoral: '', diagnostico: '', derivaciones: [],
};

const HistoriaClinica = ({ patientId }) => {
  const [form, setForm]   = useState(EMPTY);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getHistoriaClinica(patientId).then(data => {
      if (!data) return;
      setForm({
        cuestionario:    data.cuestionario    || {},
        alergias:        data.alergias        || '',
        medicacion:      data.medicacion      || '',
        habitos:         data.habitos         || {},
        motivo:          data.motivo          || '',
        examenExtraoral: data.examen_extraoral || '',
        examenIntraoral: data.examen_intraoral || '',
        diagnostico:     data.diagnostico     || '',
        derivaciones:    data.derivaciones    || [],
      });
    }).catch(console.error);
  }, [patientId]);

  const toggleQ = (id) => setForm(f => ({ ...f, cuestionario: { ...f.cuestionario, [id]: !f.cuestionario[id] } }));
  const toggleH = (h)  => setForm(f => ({ ...f, habitos:      { ...f.habitos,      [h]:  !f.habitos[h]       } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveHistoriaClinica(patientId, {
        cuestionario:     form.cuestionario,
        alergias:         form.alergias || null,
        medicacion:       form.medicacion || null,
        habitos:          form.habitos,
        motivo:           form.motivo || null,
        examen_extraoral: form.examenExtraoral || null,
        examen_intraoral: form.examenIntraoral || null,
        diagnostico:      form.diagnostico || null,
        derivaciones:     form.derivaciones,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const activos = CUESTIONARIO_HC.filter(q => form.cuestionario[q.id]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Historia clínica</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dc-positive)' }}>✓ Guardado</span>}
          <Button size="sm" icon={Icons.Check} onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>

      {activos.length > 0 && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icons.AlertTriangle size={16} style={{ color: '#DC2626', flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>
            Antecedentes positivos: {activos.map(q => q.label).join(' · ')}
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 12 }}>Antecedentes médicos</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {CUESTIONARIO_HC.map(q => {
          const active = !!form.cuestionario[q.id];
          return (
            <button key={q.id} onClick={() => toggleQ(q.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
              border: `1.5px solid ${active ? '#DC2626' : 'var(--dc-border)'}`,
              background: active ? '#FEF2F2' : '#fff',
              color: active ? '#DC2626' : 'var(--dc-fg-2)',
              textAlign: 'left', cursor: 'pointer', fontSize: 12.5, fontWeight: active ? 600 : 400,
            }}>
              <span style={{ width: 17, height: 17, borderRadius: 4, border: `2px solid ${active ? '#DC2626' : 'var(--dc-border)'}`, background: active ? '#DC2626' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {active && <Icons.Check size={10} style={{ color: '#fff' }} />}
              </span>
              {q.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <Field label="Alergias conocidas">
          <input className="input" value={form.alergias} placeholder="Ej: penicilina, latex..." onChange={e => setForm(f => ({ ...f, alergias: e.target.value }))} />
        </Field>
        <Field label="Medicación actual">
          <input className="input" value={typeof form.medicacion === 'string' ? form.medicacion : ''} placeholder="Medicamentos que toma..." onChange={e => setForm(f => ({ ...f, medicacion: e.target.value }))} />
        </Field>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 10 }}>Hábitos</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {HABITOS_HC.map(h => {
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

      <Field label="Motivo de consulta">
        <textarea className="input" rows={2} value={form.motivo} placeholder="¿Por qué viene el paciente?" onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} style={{ resize: 'vertical', marginBottom: 12 }} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
        <Field label="Examen extraoral">
          <textarea className="input" rows={3} value={form.examenExtraoral} placeholder="Observaciones extraorales..." onChange={e => setForm(f => ({ ...f, examenExtraoral: e.target.value }))} style={{ resize: 'vertical' }} />
        </Field>
        <Field label="Examen intraoral">
          <textarea className="input" rows={3} value={form.examenIntraoral} placeholder="Tejidos blandos, oclusión..." onChange={e => setForm(f => ({ ...f, examenIntraoral: e.target.value }))} style={{ resize: 'vertical' }} />
        </Field>
      </div>

      <Field label="Diagnóstico y observaciones" style={{ marginTop: 14 }}>
        <textarea className="input" rows={3} value={form.diagnostico} placeholder="Diagnóstico general, notas del doctor..." onChange={e => setForm(f => ({ ...f, diagnostico: e.target.value }))} style={{ resize: 'vertical' }} />
      </Field>
    </div>
  );
};

export default HistoriaClinica;
