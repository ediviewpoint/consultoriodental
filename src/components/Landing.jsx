import { useState, useEffect, useRef, useCallback } from 'react';
import DC_DATA from './data';
import { Icons } from './icons';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURA TU CONTENIDO AQUÍ
// ─────────────────────────────────────────────────────────────────────────────

// Video de fondo del hero (MP4). Descarga uno gratis en pexels.com/search/videos/dental
// Si lo dejas null se usa el gradiente animado (también se ve excelente)
const HERO_VIDEO = null;

// Foto de fondo del hero (JPG/WebP). Se usa si no hay video.
// Ejemplo: 'https://images.pexels.com/photos/3881449/...'
const HERO_IMAGE = null;

// Foto para la sección "Por qué elegirnos" (lado izquierdo)
// Ejemplo: 'https://images.pexels.com/photos/3881449/...'
const WHY_IMAGE = null;

// ─────────────────────────────────────────────────────────────────────────────

const SERVICES = [
  { icon: Icons.Tooth,       color: '#0D9488', bg: 'linear-gradient(135deg,#F0FDFA,#CCFBF1)', title: 'Odontología General',    desc: 'Consulta, diagnóstico y tratamiento integral de tu salud bucal desde la primera visita.' },
  { icon: Icons.Activity,    color: '#3B82F6', bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', title: 'Ortodoncia',              desc: 'Brackets y alineadores estéticos para conseguir la sonrisa que siempre quisiste.' },
  { icon: Icons.Stethoscope, color: '#8B5CF6', bg: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', title: 'Endodoncia',              desc: 'Tratamientos de conducto con tecnología rotatoria para salvar tus piezas dentales.' },
  { icon: Icons.Eye,         color: '#F59E0B', bg: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', title: 'Blanqueamiento Dental',   desc: 'Blanqueamiento profesional de alta eficacia con resultados visibles desde la primera sesión.' },
  { icon: Icons.FileText,    color: '#EF4444', bg: 'linear-gradient(135deg,#FEF2F2,#FECACA)', title: 'Cirugía Oral',            desc: 'Extracciones y procedimientos quirúrgicos con anestesia local y recuperación rápida.' },
  { icon: Icons.Image,       color: '#10B981', bg: 'linear-gradient(135deg,#ECFDF5,#A7F3D0)', title: 'Radiografías Digitales',  desc: 'Diagnóstico digital de alta precisión con mínima radiación para toda la familia.' },
];

const STATS = [
  { value: 10,  suffix: '+',  label: 'Años de experiencia' },
  { value: 2,   suffix: '',   label: 'Sucursales en Santa Cruz' },
  { value: 500, suffix: '+',  label: 'Pacientes satisfechos' },
  { value: 98,  suffix: '%',  label: 'Tasa de satisfacción' },
];

const STEPS = [
  { n: '01', icon: Icons.Calendar,    title: 'Elige fecha y hora',      desc: 'Selecciona el día, horario y doctor que prefieras desde tu celular o computadora.' },
  { n: '02', icon: Icons.FileText,    title: 'Ingresa tus datos',        desc: 'Solo nombre, celular y motivo de consulta. Sin formularios largos ni registro previo.' },
  { n: '03', icon: Icons.WhatsApp,    title: 'Confirma por WhatsApp',    desc: 'Recibirás un mensaje de confirmación al instante con todos los detalles de tu cita.' },
];

const WHY = [
  { icon: Icons.Clock,        color: '#0D9488', title: 'Sin tiempo de espera',       desc: 'Reserva tu hora exacta y llega directo a consulta. Respetamos tu tiempo.' },
  { icon: Icons.Activity,     color: '#3B82F6', title: 'Tecnología de punta',        desc: 'Equipos digitales modernos para un diagnóstico más preciso y tratamientos menos invasivos.' },
  { icon: Icons.CheckCircle,  color: '#8B5CF6', title: 'Especialistas certificados', desc: 'Doctores con formación continua y amplia experiencia en cada especialidad.' },
  { icon: Icons.WhatsApp,     color: '#10B981', title: 'Confirmación instantánea',   desc: 'Te enviamos la confirmación de tu cita por WhatsApp al instante, sin esperas.' },
];

const TESTIMONIALS = [
  { name: 'María Fernández',  text: 'Excelente atención desde el primer momento. El equipo es muy profesional y la clínica está impecable. Reservé en línea y fue súper fácil, en minutos quedó confirmada mi cita por WhatsApp.', stars: 5, suc: 'Suc. Benjer',  avatar: 'MF', color: '#0D9488' },
  { name: 'Carlos Gutiérrez', text: 'Me realizaron ortodoncia y el resultado superó mis expectativas. La atención es puntual y el seguimiento es constante. Jamás imaginé que agendar al dentista podía ser tan sencillo.', stars: 5, suc: 'Suc. BRISA', avatar: 'CG', color: '#3B82F6' },
  { name: 'Ana Vargas',       text: 'Atención puntual, trato amable y sin dolores. Por fin encontré un dentista de confianza en Santa Cruz. El blanqueamiento quedó perfecto. Lo recomiendo al 100%.', stars: 5, suc: 'Suc. Benjer',  avatar: 'AV', color: '#8B5CF6' },
];

// ── Hooks utilitarios ─────────────────────────────────────────────────────────

const useScrollReveal = (threshold = 0.12) => {
  const ref   = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
};

const useCounter = (target, active, duration = 1400) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setN(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return n;
};

// ── Componentes pequeños ──────────────────────────────────────────────────────

const Stars = ({ n = 5 }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {Array.from({ length: n }).map((_, i) => (
      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const RevealDiv = ({ children, delay = 0, style = {}, className = '' }) => {
  const [ref, vis] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    vis ? 1 : 0,
        transform:  vis ? 'none' : 'translateY(32px)',
        transition: `opacity 0.65s ${delay}s ease, transform 0.65s ${delay}s ease`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const StatCounter = ({ value, suffix, label, active }) => {
  const n = useCounter(value, active);
  return (
    <div style={{ textAlign: 'center', padding: '12px 16px' }}>
      <div style={{ fontSize: 'clamp(34px,4.5vw,52px)', fontWeight: 800, color: '#5EEAD4', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {n}{suffix}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 7, fontWeight: 500 }}>{label}</div>
    </div>
  );
};

// ── Landing principal ─────────────────────────────────────────────────────────

const Landing = ({ onNavigate }) => {
  const suc      = DC_DATA.CLINIC.sucursales;
  const sucKeys  = Object.keys(suc);
  const [scrolled, setScrolled]       = useState(false);
  const [hService, setHService]       = useState(null);
  const [statsRef, statsVis]          = useScrollReveal(0.3);
  const [menuOpen, setMenuOpen]       = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }, []);

  const navBtn = (label, action, primary = false) => (
    <button onClick={action} style={{
      background: primary ? (scrolled ? 'var(--dc-primary)' : 'rgba(255,255,255,0.15)') : 'none',
      backdropFilter: primary ? 'blur(8px)' : 'none',
      border: primary ? (scrolled ? 'none' : '1.5px solid rgba(255,255,255,0.35)') : 'none',
      borderRadius: primary ? 999 : 8,
      cursor: 'pointer', padding: primary ? '9px 22px' : '8px 14px',
      color: scrolled ? (primary ? '#fff' : '#475569') : 'rgba(255,255,255,0.88)',
      fontSize: 13, fontWeight: primary ? 700 : 600,
      transition: 'all 0.25s',
    }}>{label}</button>
  );

  return (
    <div style={{ fontFamily: 'var(--dc-font-sans)', color: '#1E293B', overflowX: 'hidden' }}>

      {/* ── Estilos globales y animaciones ── */}
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-22px) rotate(7deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(-5deg)} }
        @keyframes floatC { 0%,100%{transform:translateY(0) scale(1)}      50%{transform:translateY(-18px) scale(1.05)} }
        @keyframes pulseCta { 0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.3)} 50%{box-shadow:0 0 0 14px rgba(255,255,255,0)} }
        @keyframes heroIn { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .float-a { animation: floatA 6s ease-in-out infinite; }
        .float-b { animation: floatB 8s ease-in-out infinite; }
        .float-c { animation: floatC 7s ease-in-out infinite; }
        .cta-pulse { animation: pulseCta 2.5s ease-in-out infinite; }
        .hero-1 { animation: heroIn 0.7s 0.05s both; }
        .hero-2 { animation: heroIn 0.7s 0.15s both; }
        .hero-3 { animation: heroIn 0.7s 0.25s both; }
        .hero-4 { animation: heroIn 0.7s 0.38s both; }
        .hero-5 { animation: heroIn 0.7s 0.52s both; }
        .svc-card { transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; }
        .svc-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.1); }
        .step-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .step-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(13,148,136,0.14); }
        .why-item { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .why-item:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        .test-card { transition: transform 0.2s ease; }
        .test-card:hover { transform: translateY(-4px); }
        @media (max-width: 768px) {
          .hero-grid      { grid-template-columns: 1fr !important; }
          .stats-grid     { grid-template-columns: 1fr 1fr !important; }
          .svc-grid       { grid-template-columns: 1fr !important; }
          .steps-grid     { grid-template-columns: 1fr !important; }
          .why-side       { grid-template-columns: 1fr !important; gap: 40px !important; }
          .why-grid       { grid-template-columns: 1fr 1fr !important; }
          .test-grid      { grid-template-columns: 1fr !important; }
          .footer-grid    { grid-template-columns: 1fr !important; }
          .nav-links      { display: none !important; }
          .nav-menu-btn   { display: flex !important; }
        }
      `}</style>

      {/* ════════════════════════════ NAVBAR ════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(226,232,240,0.8)' : 'none',
        boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.35s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: scrolled ? 'var(--dc-primary)' : 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', flexShrink: 0 }}>
            <Icons.Tooth size={21} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: scrolled ? '#1E293B' : '#fff', lineHeight: 1.1, transition: 'color 0.3s' }}>DentalCare Pro</div>
            <div style={{ fontSize: 10, color: scrolled ? '#94A3B8' : 'rgba(255,255,255,0.5)', fontWeight: 500, letterSpacing: '0.04em' }}>Santa Cruz · Bolivia</div>
          </div>
        </div>

        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navBtn('Servicios',      () => scrollTo('servicios'))}
          {navBtn('Cómo funciona', () => scrollTo('proceso'))}
          {navBtn('Contacto',      () => scrollTo('footer'))}
          {navBtn('Acceso personal', () => onNavigate('login'))}
          {navBtn('Reservar cita', () => onNavigate('booking'), true)}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: scrolled ? '#1E293B' : '#fff', padding: 6 }} className="nav-menu-btn">
          <Icons.Menu size={22} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 199, background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          {[['Servicios','servicios'],['Cómo funciona','proceso'],['Contacto','footer']].map(([l, id]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#334155', padding: '10px 0', textAlign: 'left' }}>{l}</button>
          ))}
          <button onClick={() => { onNavigate('booking'); setMenuOpen(false); }} style={{ marginTop: 8, padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--dc-primary)', color: '#fff', fontSize: 15, fontWeight: 700 }}>Reservar cita</button>
        </div>
      )}

      {/* ════════════════════════════ HERO ════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

        {/* Fondo */}
        {HERO_VIDEO ? (
          <video autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} src={HERO_VIDEO} />
        ) : HERO_IMAGE ? (
          <img src={HERO_IMAGE} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(-45deg,#042F2E,#0F766E,#134E4A,#0D9488,#0A7C70,#115E59)', backgroundSize: '400% 400%', animation: 'gradientShift 14s ease infinite' }} />
        )}
        {(HERO_VIDEO || HERO_IMAGE) && <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,47,46,0.68)' }} />}

        {/* Decoraciones flotantes */}
        <div className="float-a" style={{ position: 'absolute', top: '10%', right: '6%',  width: 130, height: 130, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div className="float-b" style={{ position: 'absolute', top: '28%', right: '12%', width: 70,  height: 70,  borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div className="float-c" style={{ position: 'absolute', bottom:'20%',left: '5%',  width: 100, height: 100, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div className="float-a" style={{ position: 'absolute', top: '55%', left: '8%',   width: 44,  height: 44,  borderRadius: '50%', background: 'rgba(94,234,212,0.08)', pointerEvents: 'none' }} />
        <div className="float-c" style={{ position: 'absolute', right: '4%', bottom: '8%', opacity: 0.04, pointerEvents: 'none' }}>
          <Icons.Tooth size={300} style={{ color: '#fff' }} />
        </div>

        {/* Contenido hero */}
        <div className="hero-grid" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1200, margin: '0 auto', padding: '130px 32px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Columna izquierda — texto */}
          <div>
            <div className="hero-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, padding: '6px 18px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.88)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 28 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', flexShrink: 0 }} />
              Santa Cruz · Lun–Sáb · 2 sucursales
            </div>

            <h1 className="hero-2" style={{ fontSize: 'clamp(38px, 5.5vw, 66px)', fontWeight: 800, color: '#fff', lineHeight: 1.06, letterSpacing: '-0.03em', margin: '0 0 22px' }}>
              Tu sonrisa en las{' '}
              <span style={{ background: 'linear-gradient(135deg,#5EEAD4,#A7F3D0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                mejores manos.
              </span>
            </h1>

            <p className="hero-3" style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'rgba(255,255,255,0.72)', maxWidth: 500, margin: '0 0 40px', lineHeight: 1.65 }}>
              Reserva tu cita dental en línea en menos de 60 segundos. Especialistas en ortodoncia, endodoncia y estética dental en Santa Cruz, Bolivia.
            </p>

            <div className="hero-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <button className="cta-pulse" onClick={() => onNavigate('booking')} style={{ padding: '15px 34px', borderRadius: 999, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#0D9488,#0F766E)', color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 9, letterSpacing: '-0.01em' }}>
                <Icons.Calendar size={18} /> Agendar cita ahora
              </button>
              <button onClick={() => scrollTo('servicios')} style={{ padding: '15px 28px', borderRadius: 999, cursor: 'pointer', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.28)', color: '#fff', fontSize: 15, fontWeight: 600 }}>
                Ver servicios ↓
              </button>
            </div>

            <div className="hero-5" style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
              {[
                { icon: Icons.CheckCircle, text: 'Sin filas de espera' },
                { icon: Icons.WhatsApp,    text: 'Confirmación WhatsApp' },
                { icon: Icons.Clock,       text: 'Horario extendido' },
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
                  <b.icon size={14} style={{ color: '#5EEAD4' }} /> {b.text}
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha — tarjeta flotante simulando el sistema */}
          <div className="hero-5" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="float-b" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 24, padding: 28, width: '100%', maxWidth: 340 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Reserva disponible hoy
              </div>
              {[
                { time: '09:00', label: 'Consulta general', avail: true  },
                { time: '10:30', label: 'Ortodoncia',        avail: false },
                { time: '11:00', label: 'Limpieza dental',   avail: true  },
                { time: '14:00', label: 'Blanqueamiento',    avail: true  },
                { time: '15:30', label: 'Radiografía',       avail: false },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, marginBottom: 6, background: s.avail ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', opacity: s.avail ? 1 : 0.45, cursor: s.avail ? 'pointer' : 'default', transition: 'all 0.15s' }}>
                  <div style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 13, fontWeight: 700, color: '#5EEAD4', minWidth: 38 }}>{s.time}</div>
                  <div style={{ flex: 1, fontSize: 13, color: '#fff', fontWeight: 500 }}>{s.label}</div>
                  {s.avail
                    ? <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(74,222,128,0.2)', color: '#4ADE80', padding: '3px 9px', borderRadius: 99 }}>Libre</span>
                    : <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.3)', padding: '3px 9px', borderRadius: 99 }}>Ocupado</span>
                  }
                </div>
              ))}
              <button onClick={() => onNavigate('booking')} style={{ width: '100%', marginTop: 10, padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#0D9488,#0F766E)', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icons.Calendar size={16} /> Reservar mi turno →
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div onClick={() => scrollTo('stats')} style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', animation: 'floatB 2.2s ease-in-out infinite', zIndex: 2 }}>
          <Icons.Chevron size={30} />
        </div>
      </section>

      {/* ════════════════════════════ STATS ════════════════════════════ */}
      <section id="stats" ref={statsRef} style={{ background: '#134E4A', padding: '52px 24px' }}>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, maxWidth: 960, margin: '0 auto' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <StatCounter value={s.value} suffix={s.suffix} label={s.label} active={statsVis} />
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════ SERVICIOS ════════════════════════════ */}
      <section id="servicios" style={{ background: '#fff', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <RevealDiv style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dc-primary)', marginBottom: 12, background: '#F0FDFA', padding: '4px 14px', borderRadius: 99 }}>
              Nuestros servicios
            </div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em', margin: '0 0 14px' }}>
              Todo lo que necesitas para tu salud bucal
            </h2>
            <p style={{ fontSize: 16, color: '#64748B', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
              Contamos con especialistas y equipos de última generación para cada tipo de tratamiento dental.
            </p>
          </RevealDiv>

          <div className="svc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {SERVICES.map((s, i) => (
              <RevealDiv key={i} delay={i * 0.07}>
                <div
                  className="svc-card"
                  onMouseEnter={() => setHService(i)}
                  onMouseLeave={() => setHService(null)}
                  style={{ borderRadius: 20, padding: 30, border: `1.5px solid ${hService === i ? s.color + '40' : '#E2E8F0'}`, background: hService === i ? s.bg : '#fff', cursor: 'default', height: '100%', boxSizing: 'border-box' }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <s.icon size={28} style={{ color: s.color }} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: '0 0 10px', letterSpacing: '-0.01em' }}>{s.title}</h3>
                  <p style={{ fontSize: 13.5, color: '#64748B', margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════ PROCESO ════════════════════════════ */}
      <section id="proceso" style={{ background: 'linear-gradient(180deg,#F0FDFA 0%,#fff 100%)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <RevealDiv style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dc-primary)', marginBottom: 12, background: '#F0FDFA', padding: '4px 14px', borderRadius: 99 }}>
              ¿Cómo funciona?
            </div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em', margin: '0 0 14px' }}>
              Reserva tu cita en 3 pasos simples
            </h2>
            <p style={{ fontSize: 16, color: '#64748B', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
              Sin llamadas, sin filas, sin esperas. Elige tu horario y listo.
            </p>
          </RevealDiv>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28, position: 'relative' }}>
            {/* Línea conectora */}
            <div style={{ position: 'absolute', top: 44, left: '17%', right: '17%', height: 2, background: 'linear-gradient(90deg,#0D9488,#5EEAD4)', borderRadius: 99, zIndex: 0, opacity: 0.3 }} className="steps-line" />
            {STEPS.map((s, i) => (
              <RevealDiv key={i} delay={i * 0.12}>
                <div className="step-card" style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 20, padding: '32px 28px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#F0FDFA,#CCFBF1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #5EEAD4' }}>
                      <s.icon size={30} style={{ color: 'var(--dc-primary)' }} />
                    </div>
                    <div style={{ position: 'absolute', top: -6, right: 'calc(50% - 52px)', width: 26, height: 26, borderRadius: '50%', background: 'var(--dc-primary)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--dc-font-mono)' }}>{i + 1}</div>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: '0 0 10px' }}>{s.title}</h3>
                  <p style={{ fontSize: 13.5, color: '#64748B', margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </RevealDiv>
            ))}
          </div>

          <RevealDiv delay={0.3} style={{ textAlign: 'center', marginTop: 48 }}>
            <button onClick={() => onNavigate('booking')} style={{ padding: '15px 38px', borderRadius: 999, border: 'none', cursor: 'pointer', background: 'var(--dc-primary)', color: '#fff', fontSize: 15, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 9, letterSpacing: '-0.01em' }}>
              <Icons.Calendar size={17} /> Reservar mi cita ahora
            </button>
          </RevealDiv>
        </div>
      </section>

      {/* ════════════════════════════ POR QUÉ ELEGIRNOS ════════════════════════════ */}
      <section style={{ background: '#fff', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div className="why-side" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>

            {/* Visual izquierda */}
            <RevealDiv>
              {WHY_IMAGE ? (
                <img src={WHY_IMAGE} alt="Clínica dental" style={{ width: '100%', borderRadius: 24, objectFit: 'cover', aspectRatio: '4/3' }} />
              ) : (
                <div style={{ borderRadius: 24, overflow: 'hidden', aspectRatio: '4/3', background: 'linear-gradient(135deg,#0F766E,#134E4A)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {/* Decoración visual cuando no hay foto */}
                  <div className="float-a" style={{ position: 'absolute', top: '15%', right: '10%', width: 100, height: 100, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                  <div className="float-b" style={{ position: 'absolute', bottom: '20%', left: '8%',  width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                  <div style={{ textAlign: 'center', zIndex: 1, padding: 32 }}>
                    <div style={{ opacity: 0.15, marginBottom: 24 }}>
                      <Icons.Tooth size={120} style={{ color: '#fff' }} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 12 }}>
                      Tecnología moderna,<br />trato humano
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                      Equipos de última generación<br />con especialistas certificados
                    </div>
                    <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {['★ 5.0 Google', '500+ pacientes', '10+ años'].map((b, i) => (
                        <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.12)', color: '#5EEAD4', border: '1px solid rgba(94,234,212,0.2)' }}>{b}</span>
                      ))}
                    </div>
                  </div>
                  {/* Nota en código: reemplaza este div por <img src="URL_DE_TU_FOTO" ... /> */}
                </div>
              )}
            </RevealDiv>

            {/* Texto + features derecha */}
            <div>
              <RevealDiv>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dc-primary)', marginBottom: 12, background: '#F0FDFA', display: 'inline-block', padding: '4px 14px', borderRadius: 99 }}>
                  ¿Por qué elegirnos?
                </div>
                <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em', margin: '0 0 14px', lineHeight: 1.15 }}>
                  La experiencia dental que mereces
                </h2>
                <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, margin: '0 0 36px' }}>
                  Combinamos tecnología moderna con un trato humano y cercano. Tu comodidad y salud son nuestra prioridad desde el primer día.
                </p>
              </RevealDiv>

              <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 36 }}>
                {WHY.map((w, i) => (
                  <RevealDiv key={i} delay={i * 0.08}>
                    <div className="why-item" style={{ background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: w.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                        <w.icon size={22} style={{ color: w.color }} />
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>{w.title}</div>
                      <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.55 }}>{w.desc}</div>
                    </div>
                  </RevealDiv>
                ))}
              </div>

              <RevealDiv delay={0.2}>
                <button onClick={() => onNavigate('booking')} style={{ padding: '13px 28px', borderRadius: 999, border: 'none', cursor: 'pointer', background: 'var(--dc-primary)', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.Calendar size={16} /> Reservar mi cita
                </button>
              </RevealDiv>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════ TESTIMONIOS ════════════════════════════ */}
      <section style={{ background: '#F8FAFC', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <RevealDiv style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dc-primary)', marginBottom: 12, background: '#F0FDFA', padding: '4px 14px', borderRadius: 99 }}>
              Testimonios
            </div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
              Lo que dicen nuestros pacientes
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', maxWidth: 440, margin: '0 auto' }}>
              Más de 500 pacientes nos han confiado su salud bucal y siguen eligiéndonos.
            </p>
          </RevealDiv>

          <div className="test-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {TESTIMONIALS.map((t, i) => (
              <RevealDiv key={i} delay={i * 0.1}>
                <div className="test-card" style={{ background: '#fff', borderRadius: 20, border: '1px solid #E2E8F0', padding: 30, display: 'flex', flexDirection: 'column', gap: 20, height: '100%', boxSizing: 'border-box' }}>
                  <Stars n={t.stars} />
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.75, margin: 0, flex: 1 }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                      {t.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{t.suc}</div>
                    </div>
                  </div>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════ CTA FINAL ════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg,#0F766E 0%,#134E4A 100%)', padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="float-a" style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <div className="float-b" style={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <div className="float-c" style={{ position: 'absolute', top: '30%', left: '5%', opacity: 0.03, pointerEvents: 'none' }}>
          <Icons.Tooth size={200} style={{ color: '#fff' }} />
        </div>

        <RevealDiv style={{ position: 'relative', zIndex: 1, maxWidth: 620, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(94,234,212,0.85)', marginBottom: 18 }}>
            Reserva en 60 segundos
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4.5vw,48px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 18px', lineHeight: 1.08 }}>
            ¿Listo para tu próxima cita?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', margin: '0 auto 44px', lineHeight: 1.65, maxWidth: 460 }}>
            Elige el día y horario que mejor te convenga. Te confirmamos por WhatsApp al instante, sin llamadas ni filas.
          </p>
          <button className="cta-pulse" onClick={() => onNavigate('booking')} style={{ padding: '18px 48px', borderRadius: 999, border: 'none', cursor: 'pointer', background: '#fff', color: '#0F766E', fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Icons.Calendar size={19} /> Reservar mi cita gratis
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 18 }}>
            Sin costo · Sin registro previo · Solo elige tu horario
          </p>
        </RevealDiv>
      </section>

      {/* ════════════════════════════ FOOTER ════════════════════════════ */}
      <footer id="footer" style={{ background: '#0F172A', padding: '60px 24px 32px', color: '#94A3B8' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: `2fr ${sucKeys.map(() => '1fr').join(' ')}`, gap: 48, marginBottom: 52 }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--dc-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Tooth size={21} style={{ color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.02em' }}>DentalCare Pro</div>
                  <div style={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>Santa Cruz, Bolivia</div>
                </div>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.75, maxWidth: 300, margin: '0 0 22px' }}>
                Tu salud bucal en manos de especialistas. Tecnología moderna y trato humano en Santa Cruz, Bolivia.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[{ label: '★ 5.0 Google', color: '#F59E0B' }, { label: '500+ pacientes', color: '#0D9488' }, { label: 'Lun–Sáb', color: '#3B82F6' }].map((b, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: b.color + '20', color: b.color, border: `1px solid ${b.color}30` }}>{b.label}</span>
                ))}
              </div>
            </div>

            {/* Sucursales dinámicas desde CLINIC data */}
            {sucKeys.map(k => {
              const s = suc[k];
              return (
                <div key={k}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5EEAD4', marginBottom: 18 }}>
                    Suc. {k} — {s.nombre}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, lineHeight: 1.7 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ flexShrink: 0 }}>📍</span>
                      <span>{s.dir}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ flexShrink: 0 }}>📞</span>
                      <span style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 12 }}>{s.tel}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ flexShrink: 0 }}>⏰</span>
                      <span>Lun–Vie 8:00–18:00<br />Sáb 8:00–13:00</span>
                    </div>
                    <button onClick={() => onNavigate('booking')} style={{ marginTop: 6, padding: '9px 14px', borderRadius: 8, border: '1px solid #1E293B', background: 'none', color: '#94A3B8', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                      Reservar en Suc. {k} →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid #1E293B', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <span style={{ fontSize: 12 }}>© {new Date().getFullYear()} DentalCare Pro · {suc[sucKeys[0]]?.ciudad || 'Santa Cruz, Bolivia'}</span>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <button onClick={() => onNavigate('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#475569', fontWeight: 500 }}>
                Acceso personal
              </button>
              <button onClick={() => onNavigate('booking')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#5EEAD4', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icons.Calendar size={13} /> Reservar cita →
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
