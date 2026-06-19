import { useState, useEffect, useRef } from 'react';
import { Icons } from './icons';

export const Button = ({ variant = 'primary', size, icon: Icon, children, block, type = 'button', ...rest }) => {
  const cls = ['btn', `btn-${variant}`];
  if (size) cls.push(`btn-${size}`);
  if (block) cls.push('btn-block');
  if (rest.disabled) cls.push('btn-disabled');
  return (
    <button type={type} className={cls.join(' ')} {...rest}>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
};

export const IconButton = ({ icon: Icon, iconSize = 18, badge, type = 'button', 'aria-label': ariaLabel, title, ...rest }) => (
  <button type={type} className="icon-btn" aria-label={ariaLabel || title} title={title || ariaLabel} {...rest}>
    <Icon size={iconSize} />
    {badge && <span className="dot" />}
  </button>
);

export const Card = ({ children, className = '', flush, pad, ...rest }) => {
  const cls = ['card'];
  if (flush) cls.push('card-flush');
  if (pad === 'lg') cls.push('card-pad-lg');
  if (className) cls.push(className);
  return <div className={cls.join(' ')} {...rest}>{children}</div>;
};

export const CardHead = ({ title, action }) => (
  <div className="card-head">
    <h3 className="card-title">{title}</h3>
    {action}
  </div>
);

export const Badge = ({ status, children }) => {
  const map = {
    confirmada: 'badge-confirmed',
    'en-curso': 'badge-progress',
    pendiente: 'badge-pending',
    completada: 'badge-complete',
    cancelada: 'badge-cancel',
    pagado: 'badge-paid',
    paid: 'badge-paid',
    due: 'badge-due',
  };
  const labels = {
    confirmada: 'CONFIRMADA',
    'en-curso': 'EN CURSO',
    pendiente: 'PENDIENTE',
    completada: 'COMPLETADA',
    cancelada: 'CANCELADA',
    pagado: 'PAGADO',
    paid: '✓ PAGADO',
    due: 'PENDIENTE',
  };
  const showDot = ['confirmada','en-curso','pendiente','completada','cancelada'].includes(status);
  return (
    <span className={`badge ${map[status] || 'badge-complete'}`}>
      {showDot && <span className="dot" />}
      {children || labels[status] || status}
    </span>
  );
};

export const Avatar = ({ initials, color, size }) => {
  const cls = ['avatar'];
  if (size) cls.push(`avatar-${size}`);
  return (
    <span className={cls.join(' ')} style={{ background: color || '#0D9488' }}>
      {initials}
    </span>
  );
};

export const Modal = ({ open, onClose, title, children, footer, maxWidth }) => {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" style={maxWidth ? { maxWidth } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <Icons.X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

export const Tabs = ({ tabs, active, onChange }) => (
  <div className="tabs">
    {tabs.map((t) => (
      <button
        key={t.id}
        className={`tab ${active === t.id ? 'active' : ''}`}
        onClick={() => onChange(t.id)}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export const Progress = ({ value }) => (
  <div className="progress"><div style={{ width: `${value}%` }} /></div>
);

export const Field = ({ label, children }) => (
  <div className="field">
    {label && <label>{label}</label>}
    {children}
  </div>
);

export const Search = ({ value, onChange, placeholder }) => (
  <div className="input-search">
    <Icons.Search size={16} />
    <input
      className="input"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export const fmtBs = (n) => `Bs. ${n.toLocaleString('es-BO', { minimumFractionDigits: 0 })}`;
export const fmtBs2 = (n) => `Bs. ${n.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;
