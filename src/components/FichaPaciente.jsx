import { useState, useEffect } from 'react';
import { Icons } from './icons';
import { Button, Card, Avatar, Tabs } from './ui';
import { getPaciente } from '../lib/db';

import Datos from './FichaPaciente/Datos';
import HistoriaClinica from './FichaPaciente/HistoriaClinica';
import Historial from './FichaPaciente/Historial';
import Odontograma from './FichaPaciente/Odontograma';
import Tratamientos from './FichaPaciente/Tratamientos';
import Evoluciones from './FichaPaciente/Evoluciones';
import Recetas from './FichaPaciente/Recetas';
import Pagos from './FichaPaciente/Pagos';
import Archivos from './FichaPaciente/Archivos';

const FichaPaciente = ({ patientId, onBack, onNavigate, user, doctors = [], sucursales }) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('datos');

  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    getPaciente(patientId)
      .then(setPatientData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId]);

  const handleSavePatient = (updates) => setPatientData(prev => prev ? ({ ...prev, ...updates }) : prev);

  const tabs = [
    { id: 'datos',           label: 'Datos'            },
    { id: 'historiaclinica', label: 'Historia clínica' },
    { id: 'historial',       label: 'Historial'        },
    { id: 'odontograma',     label: 'Odontograma'      },
    { id: 'tratamientos',    label: 'Tratamientos'     },
    { id: 'evoluciones',     label: 'Evoluciones'      },
    { id: 'recetas',         label: 'Recetas'          },
    { id: 'pagos',           label: 'Pagos / Caja'     },
    { id: 'archivos',        label: 'Archivos'         },
  ];

  if (loading) {
    return (
      <div className="page">
        <div style={{ marginBottom: 18 }}>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icons.ChevronL size={14} /> Pacientes
          </Button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: 'var(--dc-fg-3)', fontSize: 14 }}>
          Cargando ficha…
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="page">
        <div style={{ marginBottom: 18 }}>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icons.ChevronL size={14} /> Pacientes
          </Button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: 'var(--dc-fg-3)', fontSize: 14 }}>
          Paciente no encontrado.
        </div>
      </div>
    );
  }

  const p = patientData;

  return (
    <div className="page">
      <div style={{ marginBottom: 18 }}>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <Icons.ChevronL size={14} /> Pacientes
        </Button>
      </div>

      <Card pad="lg" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
          <Avatar initials={p.avatar} color={p.avatarColor} size="xl" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{p.nombre} {p.apellidos}</h2>
              <span className="tag tag-solid">Suc. {p.consultorio}</span>
              {p.estado === 'sin-retorno' && <span className="badge badge-pending"><span className="dot"/>SIN RETORNO</span>}
            </div>
            <div style={{ display: 'flex', gap: 22, marginTop: 12, color: 'var(--dc-fg-2)', fontSize: 13.5, flexWrap: 'wrap' }}>
              <span><strong style={{ color: 'var(--dc-fg-3)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 6 }}>CI</strong>{p.ci}</span>
              <span><strong style={{ color: 'var(--dc-fg-3)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 6 }}>Edad</strong>{p.edad} años</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icons.Phone size={13} />{p.tel}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icons.Mail size={13} />{p.email}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" icon={Icons.Plus}   onClick={() => onNavigate('agenda')}>Nueva cita</Button>
            {!isDoctor && (
              <Button variant="primary"   icon={Icons.Wallet} onClick={() => onNavigate('cobros', { patient: p })}>Registrar pago</Button>
            )}
          </div>
        </div>
      </Card>

      <Card flush>
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <div key={tab} className="tab-pane">
          {tab === 'datos'           && <Datos           p={p}            onSave={handleSavePatient} doctors={doctors} sucursales={sucursales} />}
          {tab === 'historiaclinica' && <HistoriaClinica patientId={p.id} />}
          {tab === 'historial'       && <Historial       patientId={p.id} />}
          {tab === 'odontograma'     && <Odontograma     patientId={p.id} />}
          {tab === 'tratamientos'    && <Tratamientos    patientId={p.id} user={user} />}
          {tab === 'evoluciones'     && <Evoluciones     patientId={p.id} user={user} />}
          {tab === 'recetas'         && <Recetas         patientId={p.id} patient={p} user={user} sucursales={sucursales} />}
          {tab === 'pagos'           && <Pagos           patientId={p.id} patient={p} onNavigate={onNavigate} />}
          {tab === 'archivos'        && <Archivos        patientId={p.id} />}
        </div>
      </Card>
    </div>
  );
};

export default FichaPaciente;
