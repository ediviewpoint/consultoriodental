import { Icons } from './icons';

const getSectionsForRole = (role) => {
  const allSections = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
      ],
    },
    {
      label: 'CLÍNICA',
      items: [
        { id: 'admision',  label: 'Admisión',  icon: Icons.Plus                   },
        { id: 'pacientes', label: 'Pacientes', icon: Icons.Users                  },
        { id: 'agenda',    label: 'Agenda',    icon: Icons.Calendar },
        { id: 'cobros',    label: 'Cobros',    icon: Icons.Wallet   },
      ],
    },
    {
      label: 'GESTIÓN',
      items: [
        { id: 'presupuestos',  label: 'Presupuestos',  icon: Icons.Receipt   },
        { id: 'liquidacion',   label: 'Liquidación',   icon: Icons.TrendUp   },
        { id: 'reportes',      label: 'Reportes',      icon: Icons.Chart     },
        { id: 'configuracion', label: 'Configuración', icon: Icons.Settings  },
      ],
    },
  ];

  if (role === 'doctor') {
    return allSections.map(sec => ({
      ...sec,
      items: sec.items
        .filter(it => !['cobros', 'reportes', 'configuracion', 'presupuestos'].includes(it.id))
        .map(it => it.id === 'liquidacion'
          ? { ...it, label: 'Mis Citas', icon: Icons.CheckCircle }
          : it),
    })).filter(sec => sec.items.length > 0);
  }

  if (role === 'recepcion') {
    // Recepcion doesn't see reportes or configuracion
    return allSections.map(sec => ({
      ...sec,
      items: sec.items.filter(it => !['reportes', 'configuracion'].includes(it.id))
    })).filter(sec => sec.items.length > 0);
  }

  return allSections;
};

const Sidebar = ({ active, onNavigate, user, badges = {} }) => {
  const sections = getSectionsForRole(user?.role);
  const initials = user ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U';

  return (
    <nav className="sidebar">
      <div className="sb-brand">
        <div className="sb-logo">
          <Icons.Tooth size={20} />
        </div>
        <div>
          <div className="sb-brand-name">DentalCare Pro</div>
          <div className="sb-brand-sub">Santa Cruz · Bolivia</div>
        </div>
      </div>

      {sections.map((sec, si) => (
        <div key={si}>
          {sec.label && <div className="sb-section-label">{sec.label}</div>}
          {sec.items.map((it) => (
            <button
              key={it.id}
              className={`sb-item ${active === it.id ? 'active' : ''}`}
              onClick={() => onNavigate(it.id)}
            >
              <it.icon size={17} />
              <span style={{ flex: 1, textAlign: 'left' }}>{it.label}</span>
              {(() => { const v = it.badge ?? (it.id === 'agenda' && badges.citasHoy > 0 ? String(badges.citasHoy) : it.id === 'admision' && badges.solicitudes > 0 ? String(badges.solicitudes) : null); return v ? <span className="sb-badge">{v}</span> : null; })()}
            </button>
          ))}
        </div>
      ))}

      <div className="sb-footer">
        <div className="sb-section-label" style={{ padding: '0 12px 8px' }}>SESIÓN</div>
        <div className="sb-user">
          <span className="avatar avatar-sm" style={{ background: 'rgba(255,255,255,0.25)' }}>{initials}</span>
          <div>
            <div className="sb-user-name">{user?.name}</div>
            <div className="sb-user-role" style={{ textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
