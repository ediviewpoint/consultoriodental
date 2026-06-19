import { useState, useRef, useEffect } from 'react';
import DC_DATA from './data';
import { Icons } from './icons';
import { Button, IconButton } from './ui';

const NotifDropdown = ({ onClose, onNavigate }) => {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const ICONS_MAP = {
    tooth:    Icons.Tooth,
    calendar: Icons.Calendar,
    cash:     Icons.Wallet,
    patient:  Icons.Users,
    info:     Icons.AlertCircle,
  };

  return (
    <div ref={ref} className="notif-dropdown">
      <div className="notif-head">
        <h4>Avisos del sistema</h4>
        <span className="badge badge-pending" style={{ fontSize: 10 }}>
          {DC_DATA.ALERTS.length} avisos
        </span>
      </div>
      {DC_DATA.ALERTS.map((a, i) => {
        const IconComp = ICONS_MAP[a.icon] || Icons.AlertCircle;
        const colorMap = { info: 'var(--dc-primary)', warning: '#D97706', alert: 'var(--dc-alert)' };
        return (
          <div key={i} className="notif-item"
            onClick={() => {
              if (a.navOpts) onNavigate(a.nav, a.navOpts);
              else onNavigate(a.nav);
              onClose();
            }}>
            <div className="ni-dot" style={{ background: colorMap[a.tipo] || 'var(--dc-primary)' }} />
            <div style={{ flex: 1 }}>
              <div className="ni-msg">{a.mensaje}</div>
              <div className="ni-time">{a.accion} →</div>
            </div>
          </div>
        );
      })}
      <div style={{ padding: '10px 18px', borderTop: '1px solid var(--dc-divider)', textAlign: 'center', fontSize: 11, color: 'var(--dc-fg-4)' }}>
        DentalCare Pro · {new Date().toLocaleDateString('es-BO')}
      </div>
    </div>
  );
};

const Header = ({ consultorio, onConsultorio, user, onNavigate, onLogout, sucursales }) => {
  const [showNotif, setShowNotif] = useState(false);
  const initials  = user ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U';
  const clinicSuc = sucursales || DC_DATA.CLINIC.sucursales;
  const sucNombre = clinicSuc[consultorio]?.nombre || '';

  return (
    <header className="header">
      <div className="header-left">
        <div>
          <h1 className="header-title">DentalCare Pro</h1>
          <div className="header-sub">Suc. {consultorio} · {sucNombre} · Santa Cruz, Bolivia</div>
        </div>
      </div>

      <div className="header-right">
        <div className="consultorio-toggle">
          <button
            className={consultorio === 'A' ? 'active' : ''}
            onClick={() => onConsultorio('A')}
          >
            Cons. A
          </button>
          <button
            className={consultorio === 'B' ? 'active' : ''}
            onClick={() => onConsultorio('B')}
          >
            Cons. B
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <IconButton icon={Icons.Bell} badge onClick={() => setShowNotif(v => !v)} aria-label="Notificaciones" />
          {showNotif && (
            <NotifDropdown
              onClose={() => setShowNotif(false)}
              onNavigate={onNavigate}
            />
          )}
        </div>

        <div className="user-chip">
          <span className="avatar avatar-sm" style={{ background: 'var(--dc-primary)' }}>{initials}</span>
          <div>
            <div className="uname">{user?.name}</div>
            <div className="urole" style={{ textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" icon={Icons.X} onClick={onLogout} title="Cerrar sesión" />
      </div>
    </header>
  );
};

export default Header;
