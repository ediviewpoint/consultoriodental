import { useState, useEffect } from 'react';
import { Icons } from './icons';

// ── Video de fondo del Hero ───────────────────────────────────────────────────
// Pega aquí la URL de un video MP4 (ej: descárgalo gratis de pexels.com/es-es/search/videos/dentista)
// Si lo dejas null se usa el fondo animado con gradiente (también se ve muy bien)
const HERO_VIDEO = null;
// ─────────────────────────────────────────────────────────────────────────────

const SERVICES = [
  { icon: Icons.Tooth,       color: '#0D9488', bg: '#F0FDFA', title: 'Odontología General',  desc: 'Consulta, diagnóstico y tratamiento integral de tu salud bucal.' },
  { icon: Icons.Activity,    color: '#3B82F6', bg: '#EFF6FF', title: 'Ortodoncia',            desc: 'Brackets y alineadores para conseguir la sonrisa que siempre quisiste.' },
  { icon: Icons.Stethoscope, color: '#8B5CF6', bg: '#F5F3FF', title: 'Endodoncia',            desc: 'Tratamientos de conducto para salvar tus piezas dentales.' },
  { icon: Icons.Eye,         color: '#F59E0B', bg: '#FFFBEB', title: 'Blanqueamiento',        desc: 'Blanqueamiento profesional de alta eficacia con resultados inmediatos.' },
  { icon: Icons.FileText,    color: '#EF4444', bg: '#FEF2F2', title: 'Cirugía Oral',          desc: 'Extracciones y procedimientos quirúrgicos con la última tecnología.' },
  { icon: Icons.Image,       color: '#10B981', bg: '#ECFDF5', title: 'Radiografías Digitales',desc: 'Diagnóstico digital de alta precisión con mínima radiación.' },
];

const STATS = [
  { value: '10+',  label: 'Años de experiencia' },
  { value: '2',    label: 'Sucursales en Santa Cruz' },
  { value: '500+', label: 'Pacientes satisfechos' },
  { value: '98%',  label: 'Tasa de satisfacción' },
];

const WHY = [
  { icon: Icons.Clock,       title: 'Sin tiempo de espera',    desc: 'Reserva tu hora exacta online y llega directo a consulta.' },
  { icon: Icons.Activity,    title: 'Tecnología de punta',     desc: 'Equipos digitales modernos para un diagnóstico más preciso.' },
  { icon: Icons.CheckCircle, title: 'Especialistas certificados', desc: 'Doctores con formación y experiencia avalada.' },
  { icon: Icons.WhatsApp,    title: 'Confirmación por WhatsApp', desc: 'Te enviamos la confirmación de tu cita al instante.' },
];

const TESTIMONIALS = [
  {
    name: 'María Fernández',
    text: 'Excelente atención desde el primer momento. El equipo es muy profesional y la clínica está impecable. Reservé online y fue súper fácil.',
    stars: 5,
    suc: 'Sucursal Centro',
    avatar: 'MF',
    color: '#0D9488',
  },
  {
    name: 'Carlos Gutiérrez',
    text: 'Me realizaron ortodoncia y el resultado superó mis expectativas. La reserva en línea es muy cómoda y el seguimiento por WhatsApp es excelente.',
    stars: 5,
    suc: 'Sucursal Norte',
    avatar: 'CG',
    color: '#3B82F6',
  },
  {
    name: 'Ana Vargas',
    text: 'Atención puntual, trato amable y sin dolores. Por fin encontré un dentista de confianza en Santa Cruz. Lo recomiendo 100%.',
    stars: 5,
    suc: 'Sucursal Centro',
    avatar: 'AV',
    color: '#8B5CF6',
  },
];

const Stars = ({ n = 5 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {Array.from({ length: n }).map((_, i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const Landing = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredService, setHoveredService] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ fontFamily: 'var(--dc-font-sans)', color: '#1E293B', overflowX: 'hidden' }}>

      {/* ── Animaciones globales ── */}
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-24px) rotate(8deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-16px) rotate(-6deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-20px) scale(1.06); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroText {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseCta {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.35); }
          50%       { box-shadow: 0 0 0 12px rgba(255,255,255,0); }
        }
        .hero-badge { animation: fadeUp 0.6s ease both; }
        .hero-h1    { animation: heroText 0.7s 0.1s ease both; }
        .hero-sub   { animation: heroText 0.7s 0.2s ease both; }
        .hero-ctas  { animation: heroText 0.7s 0.3s ease both; }
        .hero-trust { animation: heroText 0.7s 0.45s ease both; }
        .float-a    { animation: floatA 6s ease-in-out infinite; }
        .float-b    { animation: floatB 8s ease-in-out infinite; }
        .float-c    { animation: floatC 7s ease-in-out infinite; }
        .cta-pulse  { animation: pulseCta 2.5s ease-in-out infinite; }
        .service-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .service-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.10); }
        .why-item { transition: transform 0.18s ease; }
        .why-item:hover { transform: translateY(-3px); }
        .scroll-reveal { animation: fadeUp 0.55s ease both; }
        @media (max-width: 640px) {
          .hero-h1 { font-size: 36px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .why-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(226,232,240,0.8)' : '1px solid rgba(255,255,255,0.12)',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: scrolled ? 'var(--dc-primary)' : 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s',
          }}>
            <Icons.Tooth size={20} style={{ color: '#fff' }} />
          </div>
          <span style={{
            fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em',
            color: scrolled ? '#1E293B' : '#fff',
            transition: 'color 0.3s',
          }}>
            DentalCare Pro
          </span>
        </div>

        {/* Nav links + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 8,
              color: scrolled ? '#475569' : 'rgba(255,255,255,0.85)',
              transition: 'all 0.2s',
            }}
          >
            Servicios
          </button>
          <button
            onClick={() => onNavigate('login')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 8,
              color: scrolled ? '#475569' : 'rgba(255,255,255,0.85)',
              transition: 'all 0.2s',
            }}
          >
            Acceso personal
          </button>
          <button
            onClick={() => onNavigate('booking')}
            style={{
              padding: '9px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: scrolled ? 'var(--dc-primary)' : 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              border: scrolled ? 'none' : '1.5px solid rgba(255,255,255,0.4)',
              transition: 'all 0.3s',
            }}
          >
            Reservar cita
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

        {/* Fondo: video o gradiente animado */}
        {HERO_VIDEO ? (
          <video
            autoPlay muted loop playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            src={HERO_VIDEO}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(-45deg, #042F2E, #0F766E, #134E4A, #115E59, #0D9488, #0A7C70)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 12s ease infinite',
          }} />
        )}

        {/* Overlay oscuro (solo si hay video) */}
        {HERO_VIDEO && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,47,46,0.72)' }} />
        )}

        {/* Decoraciones flotantes */}
        <div className="float-a" style={{ position: 'absolute', top: '12%', right: '8%', width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div className="float-b" style={{ position: 'absolute', top: '30%', right: '14%', width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div className="float-c" style={{ position: 'absolute', bottom: '18%', left: '6%', width: 90, height: 90, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div className="float-a" style={{ position: 'absolute', top: '60%', left: '10%', width: 40, height: 40, borderRadius: '50%', background: 'rgba(94,234,212,0.10)', pointerEvents: 'none' }} />
        <div className="float-b" style={{ position: 'absolute', top: '20%', left: '20%', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        {/* Diente decorativo grande */}
        <div className="float-c" style={{ position: 'absolute', right: '5%', bottom: '10%', opacity: 0.05, pointerEvents: 'none' }}>
          <Icons.Tooth size={280} style={{ color: '#fff' }} />
        </div>

        {/* Contenido hero */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '120px 20px 80px', maxWidth: 760, margin: '0 auto' }}>

          {/* Badge */}
          <div className="hero-badge" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999, padding: '6px 18px',
            fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', flexShrink: 0 }} />
            Santa Cruz, Bolivia · Atención Lun–Sáb
          </div>

          {/* Título */}
          <h1 className="hero-h1" style={{
            fontSize: 'clamp(40px, 6vw, 68px)',
            fontWeight: 800, color: '#fff', lineHeight: 1.05,
            letterSpacing: '-0.03em', margin: '0 0 22px',
          }}>
            Tu sonrisa en las{' '}
            <span style={{
              background: 'linear-gradient(135deg, #5EEAD4, #A7F3D0)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              mejores manos.
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="hero-sub" style={{
            fontSize: 'clamp(16px, 2.2vw, 20px)', color: 'rgba(255,255,255,0.75)',
            maxWidth: 560, margin: '0 auto 44px', lineHeight: 1.6,
          }}>
            Reserva tu cita dental en línea en segundos. Especialistas en odontología general, ortodoncia y estética dental.
          </p>

          {/* CTAs */}
          <div className="hero-ctas" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="cta-pulse"
              onClick={() => onNavigate('booking')}
              style={{
                padding: '16px 36px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #0D9488, #0F766E)',
                color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <Icons.Calendar size={18} />
              Agendar cita ahora
            </button>
            <button
              onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '16px 36px', borderRadius: 999, cursor: 'pointer',
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                color: '#fff', fontSize: 16, fontWeight: 600,
              }}
            >
              Ver servicios
            </button>
          </div>

          {/* Trust badges */}
          <div className="hero-trust" style={{
            display: 'flex', gap: 24, justifyContent: 'center', marginTop: 48,
            flexWrap: 'wrap',
          }}>
            {[
              { icon: Icons.CheckCircle, text: 'Atención sin filas' },
              { icon: Icons.WhatsApp,    text: 'Confirmación por WhatsApp' },
              { icon: Icons.Clock,       text: 'Horario extendido' },
            ].map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500,
              }}>
                <b.icon size={15} style={{ color: '#5EEAD4' }} />
                {b.text}
              </div>
            ))}
          </div>
        </div>

        {/* Flecha scroll hacia abajo */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
          animation: 'floatB 2s ease-in-out infinite',
        }}
          onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Icons.Chevron size={28} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════════════ */}
      <section id="stats" style={{ background: '#134E4A', padding: '48px 24px' }}>
        <div className="stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0, maxWidth: 900, margin: '0 auto',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '12px 16px',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <div style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 800, color: '#5EEAD4', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6, fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SERVICIOS
      ══════════════════════════════════════════════════════════════ */}
      <section id="servicios" style={{ background: '#fff', padding: '88px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header sección */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dc-primary)', marginBottom: 12 }}>
              Nuestros servicios
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em', margin: '0 0 14px' }}>
              Todo lo que necesitas para tu salud bucal
            </h2>
            <p style={{ fontSize: 16, color: '#64748B', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
              Contamos con especialistas y equipos de última generación para cada tipo de tratamiento.
            </p>
          </div>

          {/* Grid */}
          <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {SERVICES.map((s, i) => (
              <div
                key={i}
                className="service-card"
                onMouseEnter={() => setHoveredService(i)}
                onMouseLeave={() => setHoveredService(null)}
                style={{
                  background: hoveredService === i ? s.bg : '#fff',
                  border: `1.5px solid ${hoveredService === i ? s.color + '30' : '#E2E8F0'}`,
                  borderRadius: 16, padding: 28, cursor: 'default',
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18,
                }}>
                  <s.icon size={26} style={{ color: s.color }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 13.5, color: '#64748B', margin: 0, lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          POR QUÉ ELEGIRNOS
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#F0FDFA', padding: '88px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

            {/* Texto izquierda */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dc-primary)', marginBottom: 12 }}>
                ¿Por qué elegirnos?
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: 1.15 }}>
                La experiencia dental que mereces
              </h2>
              <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, margin: '0 0 32px' }}>
                En DentalCare Pro combinamos tecnología moderna con un trato humano y cercano. Tu comodidad y salud son nuestra prioridad.
              </p>
              <button
                onClick={() => onNavigate('booking')}
                style={{
                  padding: '14px 28px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: 'var(--dc-primary)', color: '#fff',
                  fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <Icons.Calendar size={16} />
                Reservar mi cita
              </button>
            </div>

            {/* Features derecha */}
            <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {WHY.map((w, i) => (
                <div key={i} className="why-item" style={{
                  background: '#fff', borderRadius: 14,
                  border: '1px solid #E2E8F0', padding: 22,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                  }}>
                    <w.icon size={22} style={{ color: 'var(--dc-primary)' }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>{w.title}</div>
                  <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.55 }}>{w.desc}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TESTIMONIOS
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '88px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dc-primary)', marginBottom: 12 }}>
              Opiniones de pacientes
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
              Lo que dicen nuestros pacientes
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', maxWidth: 440, margin: '0 auto' }}>
              Más de 500 pacientes confían en nosotros para cuidar su salud bucal.
            </p>
          </div>

          <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: '#F8FAFC', borderRadius: 16,
                border: '1px solid #E2E8F0', padding: 28,
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                {/* Comillas */}
                <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                  <path d="M0 22V13.2C0 9.6 0.933333 6.6 2.8 4.2C4.66667 1.8 7.33333 0.266667 10.8 0L12 2.8C9.86667 3.46667 8.26667 4.6 7.2 6.2C6.13333 7.8 5.66667 9.33333 5.8 10.8H11.6V22H0ZM16.4 22V13.2C16.4 9.6 17.3333 6.6 19.2 4.2C21.0667 1.8 23.7333 0.266667 27.2 0L28 2.8C25.8667 3.46667 24.2667 4.6 23.2 6.2C22.1333 7.8 21.6667 9.33333 21.8 10.8H27.6V22H16.4Z" fill="#E2E8F0"/>
                </svg>

                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0, flex: 1 }}>
                  {t.text}
                </p>

                <Stars n={t.stars} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4, borderTop: '1px solid #E2E8F0' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: t.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, flexShrink: 0,
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{t.suc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0F766E 0%, #134E4A 100%)',
        padding: '88px 24px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decoración */}
        <div className="float-a" style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <div className="float-b" style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(94,234,212,0.8)', marginBottom: 16 }}>
            Reserva en 60 segundos
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: 1.1 }}>
            ¿Listo para tu próxima cita?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', margin: '0 auto 40px', lineHeight: 1.6, maxWidth: 440 }}>
            Elige el día y horario que mejor te convenga. Te confirmaremos por WhatsApp al instante.
          </p>
          <button
            className="cta-pulse"
            onClick={() => onNavigate('booking')}
            style={{
              padding: '18px 44px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: '#fff', color: '#0F766E',
              fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em',
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}
          >
            <Icons.Calendar size={18} />
            Reservar mi cita gratis
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
            Sin costo · Sin registro · Solo elige tu horario
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#0F172A', padding: '56px 24px 32px', color: '#94A3B8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--dc-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Tooth size={20} style={{ color: '#fff' }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: '-0.02em' }}>DentalCare Pro</span>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.7, maxWidth: 300, margin: '0 0 20px' }}>
                Tu salud bucal en manos de especialistas. Tecnología moderna, trato humano.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { label: '★ 5.0', bg: '#F59E0B' },
                  { label: '500+ pacientes', bg: '#0D9488' },
                ].map((b, i) => (
                  <span key={i} style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999,
                    background: b.bg + '22', color: b.bg, border: `1px solid ${b.bg}33`,
                  }}>{b.label}</span>
                ))}
              </div>
            </div>

            {/* Sucursal A */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5EEAD4', marginBottom: 16 }}>
                Sucursal Centro
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span>📍 Santa Cruz, Bolivia</span>
                <span>⏰ Lun–Vie 8:00–18:00</span>
                <span>⏰ Sáb 8:00–13:00</span>
                <button
                  onClick={() => onNavigate('booking')}
                  style={{
                    marginTop: 4, padding: '8px 0', borderRadius: 8, border: '1px solid #334155',
                    background: 'none', color: '#94A3B8', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', textAlign: 'left', paddingLeft: 12,
                  }}
                >
                  Reservar en esta sucursal →
                </button>
              </div>
            </div>

            {/* Sucursal B */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5EEAD4', marginBottom: 16 }}>
                Sucursal Norte
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span>📍 Santa Cruz, Bolivia</span>
                <span>⏰ Lun–Vie 8:00–18:00</span>
                <span>⏰ Sáb 8:00–13:00</span>
                <button
                  onClick={() => onNavigate('booking')}
                  style={{
                    marginTop: 4, padding: '8px 0', borderRadius: 8, border: '1px solid #334155',
                    background: 'none', color: '#94A3B8', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', textAlign: 'left', paddingLeft: 12,
                  }}
                >
                  Reservar en esta sucursal →
                </button>
              </div>
            </div>
          </div>

          {/* Divider + copyright */}
          <div style={{ borderTop: '1px solid #1E293B', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12 }}>© {new Date().getFullYear()} DentalCare Pro · Santa Cruz, Bolivia</span>
            <button
              onClick={() => onNavigate('booking')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: '#5EEAD4', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Icons.Calendar size={13} />
              Reservar cita ahora
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
