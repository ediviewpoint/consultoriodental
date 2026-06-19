import { Button } from './ui';
import { Icons } from './icons';

const Landing = ({ onNavigate }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--dc-bg)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Navbar Minimalista */}
      <nav style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--dc-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: 20, color: 'var(--dc-fg)' }}>
          <div style={{
            background: 'var(--dc-primary)',
            color: 'white',
            width: 32, height: 32,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icons.Stethoscope size={20} />
          </div>
          DentalCare Pro
        </div>
        <button 
          onClick={() => onNavigate('login')}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--dc-fg-3)', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <Icons.User size={14} />
          Acceso Personal
        </button>
      </nav>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'radial-gradient(circle at center, var(--dc-bg-hover) 0%, var(--dc-bg) 100%)'
      }}>
        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 64px)',
          fontWeight: 800,
          color: 'var(--dc-fg)',
          lineHeight: 1.1,
          maxWidth: 800,
          marginBottom: 24,
          letterSpacing: '-0.02em'
        }}>
          Tu sonrisa en las <span style={{ color: 'var(--dc-primary)' }}>mejores manos.</span>
        </h1>
        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: 'var(--dc-fg-2)',
          maxWidth: 600,
          marginBottom: 48,
          lineHeight: 1.5
        }}>
          Reserva tu cita en línea en segundos. Especialistas en odontología general, ortodoncia y estética dental.
        </p>

        <Button 
          size="lg" 
          icon={Icons.Calendar} 
          onClick={() => onNavigate('booking')}
          style={{
            fontSize: 18,
            padding: '16px 32px',
            borderRadius: 100,
            boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.4)'
          }}
        >
          Agendar Cita Ahora
        </Button>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 24,
          width: '100%',
          maxWidth: 1000,
          marginTop: 80
        }}>
          {[
            { icon: Icons.Clock, title: 'Atención rápida', desc: 'Sin filas ni demoras. Tu tiempo es valioso.' },
            { icon: Icons.Activity, title: 'Tecnología moderna', desc: 'Equipos de última generación para tu comodidad.' },
            { icon: Icons.Users, title: 'Especialistas', desc: 'Doctores altamente capacitados a tu servicio.' }
          ].map((feat, i) => (
            <div key={i} style={{
              background: 'var(--dc-surface)',
              border: '1px solid var(--dc-border)',
              borderRadius: 16,
              padding: 24,
              textAlign: 'left'
            }}>
              <div style={{
                background: 'var(--dc-bg-hover)',
                width: 48, height: 48,
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--dc-primary)',
                marginBottom: 16
              }}>
                <feat.icon size={24} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--dc-fg)' }}>{feat.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--dc-fg-3)', margin: 0 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid var(--dc-border)',
        color: 'var(--dc-fg-3)',
        fontSize: 13
      }}>
        © {new Date().getFullYear()} DentalCare Pro. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Landing;
