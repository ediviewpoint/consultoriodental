const Ic = ({ d, size = 18, sw = 2, children, fill }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill={fill || 'none'} stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
  >
    {d ? <path d={d} /> : children}
  </svg>
);

export const Icons = {
  Dashboard:   (p) => <Ic {...p}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></Ic>,
  Users:       (p) => <Ic {...p}><circle cx="9" cy="8" r="4"/><path d="M3 21v-1a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v1M17 11a4 4 0 0 0 0-8M21 21v-1a6 6 0 0 0-3-5.2"/></Ic>,
  Calendar:    (p) => <Ic {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></Ic>,
  Card:        (p) => <Ic {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></Ic>,
  Chart:       (p) => <Ic {...p}><path d="M3 3v18h18M7 14l4-4 4 4 5-5"/></Ic>,
  Settings:    (p) => <Ic {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Ic>,
  Search:      (p) => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></Ic>,
  Plus:        (p) => <Ic {...p}><path d="M12 5v14M5 12h14"/></Ic>,
  Check:       (p) => <Ic {...p}><path d="M20 6 9 17l-5-5"/></Ic>,
  CheckCircle: (p) => <Ic {...p}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></Ic>,
  X:           (p) => <Ic {...p}><path d="M18 6 6 18M6 6l12 12"/></Ic>,
  AlertCircle: (p) => <Ic {...p}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></Ic>,
  AlertTriangle:(p)=> <Ic {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Ic>,
  Clock:       (p) => <Ic {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></Ic>,
  Phone:       (p) => <Ic {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></Ic>,
  Mail:        (p) => <Ic {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Ic>,
  FileText:    (p) => <Ic {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Ic>,
  Download:    (p) => <Ic {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></Ic>,
  QrCode:      (p) => <Ic {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/><rect x="14" y="14" width="3" height="3" fill="currentColor" stroke="none"/><rect x="18" y="18" width="3" height="3" fill="currentColor" stroke="none"/><rect x="14" y="18" width="3" height="1" fill="currentColor" stroke="none"/><rect x="18" y="14" width="1" height="3" fill="currentColor" stroke="none"/></Ic>,
  Cash:        (p) => <Ic {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></Ic>,
  WhatsApp:    (p) => <Ic {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></Ic>,
  Image:       (p) => <Ic {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></Ic>,
  Edit:        (p) => <Ic {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4z"/></Ic>,
  Chevron:     (p) => <Ic {...p}><path d="m6 9 6 6 6-6"/></Ic>,
  ChevronR:    (p) => <Ic {...p}><path d="m9 18 6-6-6-6"/></Ic>,
  ChevronL:    (p) => <Ic {...p}><path d="m15 18-6-6 6-6"/></Ic>,
  Bell:        (p) => <Ic {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/></Ic>,
  ArrowUp:     (p) => <Ic {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Ic>,
  ArrowDown:   (p) => <Ic {...p}><path d="M12 5v14M19 12l-7 7-7-7"/></Ic>,
  Tooth:       (p) => <Ic {...p}><path d="M12 2c-2.5 0-5 1.5-5 4.5 0 1.5.5 2.5.5 4C7.5 14 7 17 8 19c.5 1.5 1.5 2.5 2 2.5.5 0 1-1 1-2.5 0-.5.5-1 1-1s1 .5 1 1c0 1.5.5 2.5 1 2.5.5 0 1.5-1 2-2.5 1-2 .5-5 .5-8.5 0-1.5.5-2.5.5-4C17 3.5 14.5 2 12 2z"/></Ic>,
  Pkg:         (p) => <Ic {...p}><path d="M16.5 9.4 7.5 4.21M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/></Ic>,
  Wallet:      (p) => <Ic {...p}><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/><circle cx="17" cy="13" r="1" fill="currentColor" stroke="none"/></Ic>,
  TrendUp:     (p) => <Ic {...p}><path d="M22 7 13.5 15.5 8.5 10.5 2 17M16 7h6v6"/></Ic>,
  Receipt:     (p) => <Ic {...p}><path d="M4 2h16a1 1 0 0 1 1 1v17l-3-2-2 2-2-2-2 2-2-2-3 2V3a1 1 0 0 1 1-1z"/><path d="M8 8h8M8 12h5"/></Ic>,
  Send:        (p) => <Ic {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Ic>,
  Copy:        (p) => <Ic {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Ic>,
  Ban:         (p) => <Ic {...p}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></Ic>,
  Eye:         (p) => <Ic {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Ic>,
  EyeOff:      (p) => <Ic {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></Ic>,
  Lock:        (p) => <Ic {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Ic>,
  UserCircle:  (p) => <Ic {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><circle cx="12" cy="12" r="10"/></Ic>,
};
