import { useState, useEffect } from 'react';
import { Badge, fmtBs } from '../ui';
import { getHistorialClinico } from '../../lib/db';

const Historial = ({ patientId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistorialClinico(patientId)
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId]);

  return (
    <div style={{ padding: 24 }}>
      <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 600 }}>Historial clínico</h3>
      {loading ? (
        <p style={{ color: 'var(--dc-fg-3)', fontSize: 13 }}>Cargando historial…</p>
      ) : history.length === 0 ? (
        <p style={{ color: 'var(--dc-fg-3)', fontSize: 13 }}>Sin visitas registradas.</p>
      ) : (
        <div className="timeline">
          {history.map((h, i) => (
            <div key={i} className="tl-item">
              <div className="tl-date">{h.fecha}</div>
              <div className="tl-title">{h.tratamiento}</div>
              <div className="tl-meta">{h.doctor} · {fmtBs(h.monto)} {h.pagado && <Badge status="paid" />}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Historial;
