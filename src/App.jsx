import { useState, useEffect } from 'react';
import DC_DATA from './components/data';
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
  const [doctors, setDoctors] = useState([]);
  const [badges, setBadges] = useState({ citasHoy: 0, solicitudes: 0 });

  const [screen, setScreen]             = useState(initial);
  const [patientId, setPatientId]       = useState(initial === 'ficha' ? 1 : null);
  const [cobroPatient, setCobroPatient] = useState(null);
  const [consultorio, setConsultorio]   = useState('A');

  const [sucursales, setSucursales] = useState(() => {
    try {
      const s = localStorage.getItem('dc_sucursales');
      return s ? JSON.parse(s) : DC_DATA.CLINIC.sucursales;
    } catch { return DC_DATA.CLINIC.sucursales; }
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
      if (event === 'SIGNED_IN' && session) {
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
    await supabase.auth.signOut();
    window.location.hash = '';
  };

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
    window.location.hash = target;
  };

  const openPatient = (id) => { setPatientId(id); setScreen('ficha'); window.location.hash = 'ficha'; };
  const activeNav   = screen === 'ficha' ? 'pacientes' : screen;

  if (screen === 'landing') {
    return <Landing onNavigate={navigate} />;
  }

  if (screen === 'booking') {
    return (
      <BookingPage
        sucursales={sucursales}
        doctors={doctors}
        onBack={() => navigate('landing')}
      />
    );
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
        {screen === 'dashboard'     && <Dashboard onOpenPatient={openPatient} onNavigate={navigate} user={currentUser} />}
        {screen === 'pacientes'     && <Pacientes onOpenPatient={openPatient} onNavigate={navigate} user={currentUser} doctors={doctors} />}
        {screen === 'ficha'         && <FichaPaciente patientId={patientId} onBack={() => navigate('pacientes')} onNavigate={navigate} user={currentUser} doctors={doctors} sucursales={sucursales} />}
        {screen === 'agenda'        && <Agenda consultorio={consultorio} user={currentUser} sucursales={sucursales} doctors={doctors} />}
        {screen === 'cobros'        && <Cobro patient={cobroPatient} onNavigate={navigate} consultorio={consultorio} sucursales={sucursales} />}
        {screen === 'reportes'      && <Reportes consultorio={consultorio} />}
        {screen === 'configuracion' && <Configuracion sucursales={sucursales} onSaveSucursales={handleSaveSucursales} doctors={doctors} user={currentUser} />}
        {screen === 'presupuestos'  && <Presupuestos />}
        {screen === 'liquidacion'   && <Liquidacion consultorio={consultorio} user={currentUser} doctors={doctors} />}
        {screen === 'admision'      && <Admision onComplete={() => navigate('pacientes')} onCancel={() => navigate('pacientes')} onOpenExisting={openPatient} doctors={doctors} sucursales={sucursales} user={currentUser} />}
      </div>
    </div>
  );
};

export default App;
