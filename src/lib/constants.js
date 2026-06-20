export const BANCOS = [
  { id: 'bnb',      name: 'BNB',          short: 'BNB',  color: '#1D4ED8', bg: '#EFF6FF' },
  { id: 'bisa',     name: 'BISA',         short: 'BISA', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'union',    name: 'Banco Unión',  short: 'UNI',  color: '#D97706', bg: '#FFFBEB' },
  { id: 'bcp',      name: 'BCP Bolivia',  short: 'BCP',  color: '#2563EB', bg: '#EFF6FF' },
  { id: 'ganadero', name: 'B. Ganadero',  short: 'GAN',  color: '#059669', bg: '#ECFDF5' },
  { id: 'fie',      name: 'Banco FIE',    short: 'FIE',  color: '#DC2626', bg: '#FEF2F2' },
  { id: 'sol',      name: 'BancoSol',     short: 'SOL',  color: '#0891B2', bg: '#ECFEFF' },
  { id: 'prodem',   name: 'PRODEM',       short: 'PRD',  color: '#65A30D', bg: '#F7FEE7' },
];

export const TEETH_FDI = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
];

export const TREATMENT_TYPES = [
  { name: 'Operatoria', pct: 0, color: '#0D9488' },
  { name: 'Prevención', pct: 0, color: '#3B82F6' },
  { name: 'Endodoncia', pct: 0, color: '#F59E0B' },
  { name: 'Prótesis',   pct: 0, color: '#FB923C' },
  { name: 'Cirugía',    pct: 0, color: '#8B5CF6' },
  { name: 'Ortodoncia', pct: 0, color: '#F87171' },
];

export const REPORT_PERIODS = {
  hoy:       { label: 'Hoy',            ingresos: 0, pacientes: 0, tratamientos: 0, canceladas: 0, deltaIngr: '—', deltaPac: '—', chart: [], chartLabel: 'Ingresos por hora',   chartSub: 'Hoy'            },
  semana:    { label: 'Esta semana',    ingresos: 0, pacientes: 0, tratamientos: 0, canceladas: 0, deltaIngr: '—', deltaPac: '—', chart: [], chartLabel: 'Ingresos por día',    chartSub: 'Esta semana'    },
  mayo:      { label: 'Este mes',       ingresos: 0, pacientes: 0, tratamientos: 0, canceladas: 0, deltaIngr: '—', deltaPac: '—', chart: [], chartLabel: 'Ingresos por semana', chartSub: 'Este mes'       },
  trimestre: { label: 'Este trimestre', ingresos: 0, pacientes: 0, tratamientos: 0, canceladas: 0, deltaIngr: '—', deltaPac: '—', chart: [], chartLabel: 'Ingresos por mes',    chartSub: 'Este trimestre' },
  '2025':    { label: 'Año 2025',       ingresos: 0, pacientes: 0, tratamientos: 0, canceladas: 0, deltaIngr: '—', deltaPac: '—', chart: [], chartLabel: 'Ingresos por mes',    chartSub: '2025'           },
};
