// ─── Datos de configuración (no modificar sin actualizar Supabase también) ────

const CLINIC = {
  sucursales: {
    A: {
      nombre: 'Benjer',
      dir: 'Calle 8 N° 7, Villa 1° de Mayo',
      ciudad: 'Santa Cruz, Bolivia',
      tel: '736-90680',
    },
    B: {
      nombre: 'BRISA · Servicio Dental Integral',
      dir: 'Calle 8 #9, Villa 1° de Mayo',
      ciudad: 'Santa Cruz, Bolivia',
      tel: '73690680 / 63437327',
    },
  },
};

// Vacío — los doctores vienen de Supabase (tabla: doctores)
const DOCTORS = [];

// Vacío — los pacientes vienen de Supabase (tabla: pacientes)
const PATIENTS = [];

// Vacío — las citas vienen de Supabase (tabla: citas)
const WEEK_APPOINTMENTS = [];

// Vacío — los datos clínicos vienen de Supabase
const PATIENT_DATA = {};

// Numeración FDI estándar — no es dato, es configuración del odontograma
const TEETH_FDI = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
                   48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// Estructura vacía — los reportes se generarán desde Supabase
const REPORT_PERIODS = {
  hoy:       { label: 'Hoy',            ingresos: 0, pacientes: 0, tratamientos: 0, canceladas: 0, deltaIngr: '—', deltaPac: '—', chart: [], chartLabel: 'Ingresos por hora',   chartSub: 'Hoy'            },
  semana:    { label: 'Esta semana',    ingresos: 0, pacientes: 0, tratamientos: 0, canceladas: 0, deltaIngr: '—', deltaPac: '—', chart: [], chartLabel: 'Ingresos por día',    chartSub: 'Esta semana'    },
  mayo:      { label: 'Este mes',       ingresos: 0, pacientes: 0, tratamientos: 0, canceladas: 0, deltaIngr: '—', deltaPac: '—', chart: [], chartLabel: 'Ingresos por semana', chartSub: 'Este mes'       },
  trimestre: { label: 'Este trimestre', ingresos: 0, pacientes: 0, tratamientos: 0, canceladas: 0, deltaIngr: '—', deltaPac: '—', chart: [], chartLabel: 'Ingresos por mes',    chartSub: 'Este trimestre' },
  '2025':    { label: 'Año 2025',       ingresos: 0, pacientes: 0, tratamientos: 0, canceladas: 0, deltaIngr: '—', deltaPac: '—', chart: [], chartLabel: 'Ingresos por mes',    chartSub: '2025'           },
};

// Vacío — las alertas se generarán dinámicamente desde Supabase
const ALERTS = [];

// Bancos bolivianos para pagos QR (datos reales, no demo)
const BANCOS = [
  { id: 'bnb',      name: 'BNB',          short: 'BNB',  color: '#1D4ED8', bg: '#EFF6FF' },
  { id: 'bisa',     name: 'BISA',         short: 'BISA', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'union',    name: 'Banco Unión',  short: 'UNI',  color: '#D97706', bg: '#FFFBEB' },
  { id: 'bcp',      name: 'BCP Bolivia',  short: 'BCP',  color: '#2563EB', bg: '#EFF6FF' },
  { id: 'ganadero', name: 'B. Ganadero',  short: 'GAN',  color: '#059669', bg: '#ECFDF5' },
  { id: 'fie',      name: 'Banco FIE',    short: 'FIE',  color: '#DC2626', bg: '#FEF2F2' },
  { id: 'sol',      name: 'BancoSol',     short: 'SOL',  color: '#0891B2', bg: '#ECFEFF' },
  { id: 'prodem',   name: 'PRODEM',       short: 'PRD',  color: '#65A30D', bg: '#F7FEE7' },
];

// Catálogo de tratamientos con precios base (editable en Configuración)
const TREATMENT_CATALOG = [
  { id: 'c01', tratamiento: 'Consulta general',          categoria: 'Consultas',  precio: 150,  material: 0   },
  { id: 'c02', tratamiento: 'Consulta de emergencia',    categoria: 'Consultas',  precio: 200,  material: 0   },
  { id: 'p01', tratamiento: 'Limpieza dental',           categoria: 'Prevención', precio: 250,  material: 30  },
  { id: 'p02', tratamiento: 'Fluorización',              categoria: 'Prevención', precio: 120,  material: 15  },
  { id: 'r01', tratamiento: 'Radiografía periapical',    categoria: 'Radiología', precio: 80,   material: 15  },
  { id: 'r02', tratamiento: 'Radiografía panorámica',    categoria: 'Radiología', precio: 250,  material: 30  },
  { id: 'o01', tratamiento: 'Amalgama 1 superficie',     categoria: 'Operatoria', precio: 200,  material: 40  },
  { id: 'o02', tratamiento: 'Resina 1 superficie',       categoria: 'Operatoria', precio: 280,  material: 45  },
  { id: 'o03', tratamiento: 'Resina 2 superficies',      categoria: 'Operatoria', precio: 380,  material: 60  },
  { id: 'e01', tratamiento: 'Endodoncia unirradicular',  categoria: 'Endodoncia', precio: 650,  material: 120 },
  { id: 'e02', tratamiento: 'Endodoncia birradicular',   categoria: 'Endodoncia', precio: 850,  material: 180 },
  { id: 'ci1', tratamiento: 'Extracción simple',         categoria: 'Cirugía',    precio: 200,  material: 20  },
  { id: 'ci2', tratamiento: 'Extracción quirúrgica',     categoria: 'Cirugía',    precio: 450,  material: 60  },
  { id: 'pr1', tratamiento: 'Corona PFM',                categoria: 'Prótesis',   precio: 1200, material: 350 },
  { id: 'pr2', tratamiento: 'Corona zirconia',           categoria: 'Prótesis',   precio: 1800, material: 600 },
  { id: 'pr3', tratamiento: 'Incrustación',              categoria: 'Prótesis',   precio: 900,  material: 200 },
  { id: 'es1', tratamiento: 'Blanqueamiento dental',     categoria: 'Estética',   precio: 500,  material: 80  },
  { id: 'es2', tratamiento: 'Carillas de porcelana',     categoria: 'Estética',   precio: 1500, material: 350 },
  { id: 'or1', tratamiento: 'Ortodoncia mensualidad',    categoria: 'Ortodoncia', precio: 350,  material: 0   },
  { id: 'or2', tratamiento: 'Brackets cerámicos setup',  categoria: 'Ortodoncia', precio: 3500, material: 800 },
];

// Vacío — los presupuestos vienen de Supabase
const PRESUPUESTOS = [];

// Categorías para gráfico de reportes (sin datos reales aún)
const TREATMENT_TYPES = [
  { name: 'Operatoria', pct: 0, color: '#0D9488' },
  { name: 'Prevención', pct: 0, color: '#3B82F6' },
  { name: 'Endodoncia', pct: 0, color: '#F59E0B' },
  { name: 'Prótesis',   pct: 0, color: '#FB923C' },
  { name: 'Cirugía',    pct: 0, color: '#8B5CF6' },
  { name: 'Ortodoncia', pct: 0, color: '#F87171' },
];

// Vacío — la liquidación se generará desde Supabase
const LIQUIDACION_SAMPLE = {
  periodo: '—',
  rows: [],
};

const DC_DATA = {
  CLINIC,
  DOCTORS,
  PATIENTS,
  WEEK_APPOINTMENTS,
  PATIENT_DATA,
  TEETH_FDI,
  REPORT_PERIODS,
  ALERTS,
  BANCOS,
  TREATMENT_CATALOG,
  PRESUPUESTOS,
  TREATMENT_TYPES,
  LIQUIDACION_SAMPLE,
};

export default DC_DATA;
