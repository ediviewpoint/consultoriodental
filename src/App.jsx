import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { getProfile, getSucursales, getDoctores, saveSucursales, getBadgesData } from './lib/db';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Pacientes from './components/Pacientes';
import FichaPaciente from './components/FichaPaciente';
import Agenda from './components/Agenda';
import Cobro from './components/Cobro';
import Reportes from './components/Reportes';
import Configuracion from './components/Configuracion';
import Presupuestos from './components/Presupuestos';
import Liquidacion from './components/Liquidacion';
import Admision from './components/Admision';
import Login from './components/Login';
import SetPassword from './components/SetPassword';
import BookingPage from './components/BookingPage';
import Landing from './components/Landing';

const VALID_SCREENS = ['dashboard','pacientes','ficha','agenda','cobros','reportes','configuracion','presupuestos','liquidacion','admision'];

const ROLE_SCREENS = {
  admin:     new Set(['dashboard','pacientes','ficha','agenda','cobros','reportes','configuracion','presupuestos','liquidacion','admision']),
  recepcion: new Set(['dashboard','pacientes','ficha','agenda','cobros','presupuestos','liquidacion','admision']),
  doctor:    new Set(['dashboard','pacientes','ficha','agenda','liquidacion']),
};

const canAccess = (role, screen) => (ROLE_SCREENS[role] ?? ROLE_SCREENS.admin).has(screen);

const initial = (() => {
  const h = (window.location.hash || '').replace('#', '');
  if (h === 'booking') return 'booking';
  if (h === 'login') return 'login';
  if (VALID_SCREENS.includes(h)) return h;
  return 'landing';
})();

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [recovery,    setRecovery]    = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [badges, setBadges] = useState({ citasHoy: 0, solicitudes: 0 });

  const [screen, setScreen]             = useState(initial);
  const [patientId, setPatientId]       = useState(initial === 'ficha' ? 1 : null);
  const [cobroPatient, setCobroPatient] = useState(null);
  const [consultorio, setConsultorio]   = useState('A');
  const [visited, setVisited]           = useState(() => new Set([initial]));
  const currentUserRef                  = useRef(null);
  const navCountRef                     = useRef(0);

  const [sucursales, setSucursales] = useState(() => {
    try {
      const s = localStorage.getItem('dc_sucursales');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });

  const loadAppData = async () => {
    try {
      const [docs, sucs] = await Promise.all([getDoctores(), getSucursales()]);
      setDoctors(docs);
      setSucursales(sucs);
      localStorage.setItem('dc_sucursales', JSON.stringify(sucs));
      getBadgesData().then(setBadges).catch(() => {});
    } catch (err) {
      console.error('Error loading app data:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // Link de recovery/invitación: el hash contiene type=recovery
      if (window.location.hash.includes('type=recovery')) {
        setRecovery(true);
        setAuthLoading(false);
        return;
      }
      if (session) {
        try {
          const profile = await getProfile(session.user.id);
          setCurrentUser(profile);
          await loadAppData();
        } catch (err) {
          console.error('Profile load error:', err);
        }
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecovery(true);
        setAuthLoading(false);
        return;
      }
      if (event === 'SIGNED_IN' && session) {
        setRecovery(false);
        try {
          const profile = await getProfile(session.user.id);
          setCurrentUser(profile);
          await loadAppData();
        } catch (err) {
          console.error('Auth change error:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setDoctors([]);
        setVisited(new Set(['dashboard']));
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveSucursales = async (newSuc) => {
    setSucursales(newSuc);
    localStorage.setItem('dc_sucursales', JSON.stringify(newSuc));
    try { await saveSucursales(newSuc); } catch (err) { console.error(err); }
  };

  const handleLogout = async () => {
    navCountRef.current = 0;
    await supabase.auth.signOut();
    window.location.hash = '';
  };

  useEffect(() => {
    setVisited(prev => {
      if (prev.has(screen)) return prev;
      const next = new Set(prev);
      next.add(screen);
      return next;
    });
  }, [screen]);

  // Mantiene la ref actualizada para usarla dentro del listener sin closures viejos
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  // Sincroniza el estado con la flecha atrás/adelante del navegador.
  // Escucha AMBOS eventos: hashchange (cambios directos de hash) y popstate
  // (navegación del historial). Algunos navegadores solo disparan uno de los dos.
  useEffect(() => {
    const syncFromUrl = () => {
      const h = (window.location.hash || '').replace('#', '');
      const user = currentUserRef.current;
      if (VALID_SCREENS.includes(h)) {
        setScreen(canAccess(user?.role, h) ? h : 'dashboard');
      } else if (!h || h === 'landing') {
        setScreen(user ? 'dashboard' : 'landing');
      }
    };
    window.addEventListener('hashchange', syncFromUrl);
    window.addEventListener('popstate',   syncFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncFromUrl);
      window.removeEventListener('popstate',   syncFromUrl);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to dashboard if restored session lands on a forbidden screen or public screen
  useEffect(() => {
    if (currentUser) {
      if (screen === 'landing' || screen === 'login') {
        navigate('dashboard');
      } else if (!canAccess(currentUser.role, screen)) {
        navigate('dashboard');
      }
    }
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = (s, opts = {}) => {
    const target = (currentUser && !canAccess(currentUser.role, s)) ? 'dashboard' : s;
    setScreen(target);
    setPatientId(target === 'ficha' ? (opts.patientId || patientId || 1) : null);
    if (target === 'cobros') setCobroPatient(opts.patient || null);
    if (opts.replace) {
      window.history.replaceState(null, '', '#' + target);
    } else {
      navCountRef.current += 1;
      window.location.hash = target;
    }
  };

  // Retrocede en el historial del navegador si hay entradas propias, o navega con replace como fallback
  const goBack = (fallback = 'dashboard') => {
    if (navCountRef.current > 0) {
      navCountRef.current -= 1;
      window.history.back();
    } else {
      navigate(fallback, { replace: true });
    }
  };

  const openPatient = (id) => navigate('ficha', { patientId: id });
  const activeNav   = screen === 'ficha' ? 'pacientes' : screen;

  if (screen === 'landing') {
    return <Landing onNavigate={navigate} sucursales={sucursales} />;
  }

  if (screen === 'booking') {
    return (
      <BookingPage
        sucursales={sucursales}
        doctors={doctors}
        onBack={() => goBack('landing')}
      />
    );
  }

  if (recovery) {
    return <SetPassword onDone={() => { setRecovery(false); window.history.replaceState(null, '', window.location.pathname); }} />;
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 12, color: 'var(--dc-primary)' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(13,148,136,0.2)', borderTopColor: 'var(--dc-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dc-fg-3)' }}>Cargando…</span>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="app">
      <Sidebar active={activeNav} onNavigate={navigate} user={currentUser} badges={badges} />
      <div className="main">
        <Header
          consultorio={consultorio}
          onConsultorio={setConsultorio}
          user={currentUser}
          onNavigate={navigate}
          onLogout={handleLogout}
          sucursales={sucursales}
        />
        {/* Pantallas estables: se montan la primera vez y se ocultan/muestran con CSS */}
        {visited.has('dashboard')     && <div style={screen !== 'dashboard'     ? { display: 'none' } : undefined}><Dashboard onOpenPatient={openPatient} onNavigate={navigate} user={currentUser} /></div>}
        {visited.has('pacientes')     && <div style={screen !== 'pacientes'     ? { display: 'none' } : undefined}><Pacientes onOpenPatient={openPatient} onNavigate={navigate} user={currentUser} doctors={doctors} /></div>}
        {visited.has('agenda')        && <div style={screen !== 'agenda'        ? { display: 'none' } : undefined}><Agenda consultorio={consultorio} user={currentUser} sucursales={sucursales} doctors={doctors} /></div>}
        {visited.has('reportes')      && <div style={screen !== 'reportes'      ? { display: 'none' } : undefined}><Reportes consultorio={consultorio} doctors={doctors} /></div>}
        {visited.has('configuracion') && <div style={screen !== 'configuracion' ? { display: 'none' } : undefined}><Configuracion sucursales={sucursales} onSaveSucursales={handleSaveSucursales} doctors={doctors} user={currentUser} /></div>}
        {visited.has('presupuestos')  && <div style={screen !== 'presupuestos'  ? { display: 'none' } : undefined}><Presupuestos /></div>}
        {visited.has('liquidacion')   && <div style={screen !== 'liquidacion'   ? { display: 'none' } : undefined}><Liquidacion consultorio={consultorio} user={currentUser} doctors={doctors} /></div>}
        {visited.has('admision')      && <div style={screen !== 'admision'      ? { display: 'none' } : undefined}><Admision onComplete={() => navigate('pacientes', { replace: true })} onCancel={() => navigate('pacientes', { replace: true })} onOpenExisting={openPatient} doctors={doctors} sucursales={sucursales} user={currentUser} /></div>}
        {/* Pantallas dinámicas: siempre remontan porque dependen de datos por paciente */}
        {screen === 'ficha'  && <FichaPaciente key={patientId}        patientId={patientId} onBack={() => goBack('pacientes')} onNavigate={navigate} user={currentUser} doctors={doctors} sucursales={sucursales} />}
        {screen === 'cobros' && <Cobro         key={cobroPatient?.id} patient={cobroPatient} onNavigate={navigate} consultorio={consultorio} sucursales={sucursales} />}
      </div>
    </div>
  );
};

export default App;
