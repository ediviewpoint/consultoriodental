import { useState, useEffect } from 'react';
import { BANCOS } from '../../lib/constants';
import { Icons } from '../icons';
import { Button, fmtBs } from '../ui';
import { getPagos } from '../../lib/db';

const Pagos = ({ patientId, patient, onNavigate }) => {
  const [pagos, setPagos]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPagos(patientId)
      .then(setPagos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId]);

  const total = pagos.reduce((s, p) => s + p.monto, 0);
  const BANCOS_MAP = Object.fromEntries(BANCOS.map(b => [b.id, b]));

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Historial de pagos</h3>
          <div style={{ fontSize: 13, color: 'var(--dc-fg-3)', marginTop: 3 }}>
            {pagos.length} pago{pagos.length !== 1 ? 's' : ''} · Total: <strong>{fmtBs(total)}</strong>
          </div>
        </div>
        <Button variant="primary" size="sm" icon={Icons.Plus} onClick={() => onNavigate('cobros', { patient })}>
          Registrar pago
        </Button>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 13 }}>Cargando pagos…</div>
      ) : pagos.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 13 }}>Sin pagos registrados.</div>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Fecha</th><th>Tratamiento</th><th style={{ textAlign: 'right' }}>Monto</th><th>Método / Banco</th><th>Comprobante</th><th style={{ width: 60 }}></th></tr>
          </thead>
          <tbody>
            {pagos.map((p, i) => {
              const bancoInfo = p.banco ? BANCOS_MAP[p.banco] : null;
              return (
                <tr key={p._id || i}>
                  <td style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 12, whiteSpace: 'nowrap' }}>{p.fecha}</td>
                  <td style={{ fontWeight: 500 }}>{p.tratamiento}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtBs(p.monto)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span className="tag">{p.metodo === 'qr' ? 'QR Simple' : p.metodo === 'efectivo' ? 'Efectivo' : p.metodo}</span>
                      {bancoInfo && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999, background: bancoInfo.bg, color: bancoInfo.color }}>{bancoInfo.name}</span>}
                    </div>
                  </td>
                  <td>
                    {p.ref
                      ? <span className="pago-comprobante" title={p.ref}>{p.ref.length > 14 ? p.ref.slice(0, 14) + '…' : p.ref}</span>
                      : p.metodo === 'qr'
                        ? <span className="pago-sin-comprobante"><Icons.AlertTriangle size={11} /> sin comprobante</span>
                        : <span style={{ color: 'var(--dc-fg-4)', fontSize: 12 }}>—</span>
                    }
                  </td>
                  <td>
                    <Button variant="ghost" size="sm" icon={Icons.FileText} onClick={() => window.print()}>PDF</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Pagos;
