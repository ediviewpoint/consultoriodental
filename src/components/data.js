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

const DOCTORS = [
  { id: 'r', name: 'Dra. Rosa Chávez',  short: 'RC', color: '#0D9488', consultorio: 'A', comision: 0.40 },
  { id: 'a', name: 'Dr. Andrés Flores', short: 'AF', color: '#3B82F6', consultorio: 'B', comision: 0.45 },
];

const PATIENTS = [
  { id: 1, nombre: 'María Elena', apellidos: 'Mamani Quispe',   ci: '7823451', edad: 34, tel: '7823 4512', email: 'maria.mamani@gmail.com',    doctor: 'Dra. Rosa Chávez',  consultorio: 'A', ultimaVisita: '12/05/2025', estado: 'activo',      avatar: 'ME', avatarColor: '#0D9488' },
  { id: 2, nombre: 'Jorge Luis',  apellidos: 'Quispe Torrez',   ci: '5634782', edad: 45, tel: '6712 3890', email: 'j.quispe@hotmail.com',        doctor: 'Dr. Andrés Flores', consultorio: 'B', ultimaVisita: '08/05/2025', estado: 'activo',      avatar: 'JQ', avatarColor: '#3B82F6' },
  { id: 3, nombre: 'Lucía',       apellidos: 'Fernández Marca', ci: '8912345', edad: 27, tel: '7234 5678', email: 'lucia.fernandez@gmail.com',   doctor: 'Dra. Rosa Chávez',  consultorio: 'A', ultimaVisita: '03/05/2025', estado: 'activo',      avatar: 'LF', avatarColor: '#F59E0B' },
  { id: 4, nombre: 'Carlos',      apellidos: 'Vargas Condori',  ci: '6234189', edad: 52, tel: '7891 2345', email: 'c.vargas@gmail.com',          doctor: 'Dr. Andrés Flores', consultorio: 'B', ultimaVisita: '21/04/2025', estado: 'sin-retorno', avatar: 'CV', avatarColor: '#FB923C' },
  { id: 5, nombre: 'Patricia',    apellidos: 'Rojas Huanca',    ci: '7345612', edad: 38, tel: '6823 4567', email: 'patricia.r@gmail.com',        doctor: 'Dra. Rosa Chávez',  consultorio: 'A', ultimaVisita: '10/05/2025', estado: 'activo',      avatar: 'PR', avatarColor: '#10B981' },
  { id: 6, nombre: 'Roberto',     apellidos: 'Chávez Lima',     ci: '8456723', edad: 61, tel: '7912 3456', email: 'r.chavez@yahoo.com',          doctor: 'Dr. Andrés Flores', consultorio: 'B', ultimaVisita: '15/03/2025', estado: 'sin-retorno', avatar: 'RC', avatarColor: '#8B5CF6' },
  { id: 7, nombre: 'Sofía',       apellidos: 'Mamani Cruz',     ci: '9123456', edad: 22, tel: '7234 5671', email: 'sofia.mamani@gmail.com',      doctor: 'Dra. Rosa Chávez',  consultorio: 'A', ultimaVisita: '19/05/2025', estado: 'activo',      avatar: 'SM', avatarColor: '#0D9488' },
  { id: 8, nombre: 'Diego',       apellidos: 'Torrez Quispe',   ci: '6789012', edad: 35, tel: '6891 2345', email: 'diego.torrez@gmail.com',      doctor: 'Dr. Andrés Flores', consultorio: 'B', ultimaVisita: '17/05/2025', estado: 'activo',      avatar: 'DT', avatarColor: '#3B82F6' },
];

const WEEK_APPOINTMENTS = [
  { dia: 1, hora: 8,    dur: 1, paciente: 'María Elena Mamani', doctor: 'Dra. Rosa Chávez',  tratamiento: 'Endodoncia',            notas: 'Continuar raíz mesial',    estado: 'completada', _id: 1001 },
  { dia: 1, hora: 9,    dur: 1, paciente: 'Jorge Luis Quispe',  doctor: 'Dr. Andrés Flores', tratamiento: 'Limpieza dental',        notas: '',                         estado: 'completada', _id: 1002 },
  { dia: 1, hora: 10,   dur: 1, paciente: 'Lucía Fernández',    doctor: 'Dra. Rosa Chávez',  tratamiento: 'Consulta general',       notas: 'Primera visita',           estado: 'confirmada', _id: 1003 },
  { dia: 2, hora: 9,    dur: 1, paciente: 'Patricia Rojas',     doctor: 'Dra. Rosa Chávez',  tratamiento: 'Blanqueamiento dental',  notas: '',                         estado: 'confirmada', _id: 1004 },
  { dia: 2, hora: 10,   dur: 1, paciente: 'Roberto Chávez',     doctor: 'Dr. Andrés Flores', tratamiento: 'Extracción simple',      notas: 'Pieza #38',                estado: 'pendiente',  _id: 1005 },
  { dia: 2, hora: 11,   dur: 1, paciente: 'Sofía Mamani',       doctor: 'Dra. Rosa Chávez',  tratamiento: 'Corona PFM',             notas: 'Control post-instalación', estado: 'confirmada', _id: 1006 },
  { dia: 3, hora: 8.5,  dur: 1, paciente: 'Diego Torrez',       doctor: 'Dr. Andrés Flores', tratamiento: 'Endodoncia',             notas: 'Segunda sesión',           estado: 'en-curso',   _id: 1007 },
  { dia: 3, hora: 9.5,  dur: 1, paciente: 'Carlos Vargas',      doctor: 'Dr. Andrés Flores', tratamiento: 'Consulta general',       notas: '',                         estado: 'pendiente',  _id: 1008 },
  { dia: 3, hora: 11,   dur: 1, paciente: 'María Elena Mamani', doctor: 'Dra. Rosa Chávez',  tratamiento: 'Control corona',         notas: 'Revisión pieza #21',       estado: 'pendiente',  _id: 1009 },
  { dia: 4, hora: 9,    dur: 1, paciente: 'Lucía Fernández',    doctor: 'Dra. Rosa Chávez',  tratamiento: 'Ortodoncia',             notas: 'Ajuste arco superior',     estado: 'confirmada', _id: 1010 },
  { dia: 4, hora: 10,   dur: 1, paciente: 'Jorge Luis Quispe',  doctor: 'Dr. Andrés Flores', tratamiento: 'Resina 2 superficies',   notas: 'Pieza #16',                estado: 'confirmada', _id: 1011 },
  { dia: 5, hora: 8,    dur: 1, paciente: 'Patricia Rojas',     doctor: 'Dra. Rosa Chávez',  tratamiento: 'Radiografía panorámica', notas: '',                         estado: 'confirmada', _id: 1012 },
  { dia: 5, hora: 10,   dur: 1, paciente: 'Sofía Mamani',       doctor: 'Dra. Rosa Chávez',  tratamiento: 'Limpieza dental',        notas: 'Profilaxis semestral',     estado: 'pendiente',  _id: 1013 },
  { dia: 6, hora: 9,    dur: 1, paciente: 'Diego Torrez',       doctor: 'Dr. Andrés Flores', tratamiento: 'Control',                notas: 'Post-endodoncia',          estado: 'pendiente',  _id: 1014 },
];

const PATIENT_DATA = {
  1: {
    history: [
      { fecha: '12/05/2025', tratamiento: 'Control corona #21',           doctor: 'Dra. Rosa Chávez', monto: 150,  pagado: true  },
      { fecha: '28/04/2025', tratamiento: 'Instalación corona PFM #21',   doctor: 'Dra. Rosa Chávez', monto: 1200, pagado: true  },
      { fecha: '14/04/2025', tratamiento: 'Endodoncia unirradicular #21', doctor: 'Dra. Rosa Chávez', monto: 650,  pagado: true  },
      { fecha: '03/04/2025', tratamiento: 'Radiografía periapical',       doctor: 'Dra. Rosa Chávez', monto: 80,   pagado: true  },
      { fecha: '10/03/2025', tratamiento: 'Consulta general',             doctor: 'Dra. Rosa Chávez', monto: 150,  pagado: true  },
    ],
    toothStates: { 21: 'crown', 16: 'caries', 36: 'treatment', 47: 'extracted' },
    plan: {
      titulo: 'Plan de tratamiento integral',
      inicio: '10/03/2025',
      montoTotal: 2330,
      pasos: [
        { n: 1, descripcion: 'Endodoncia pieza #21', monto: 650,  estado: 'completado' },
        { n: 2, descripcion: 'Corona PFM pieza #21', monto: 1200, estado: 'completado' },
        { n: 3, descripcion: 'Resina pieza #16',     monto: 280,  estado: 'en-curso'   },
        { n: 4, descripcion: 'Extracción pieza #47', monto: 200,  estado: 'pendiente'  },
      ],
      abonos: [
        { fecha: '14/04/2025', monto: 650,  metodo: 'efectivo', recibo: 'EFV-KZX1',  doctor: 'Dra. Rosa Chávez' },
        { fecha: '28/04/2025', monto: 800,  metodo: 'qr',       recibo: 'QRS-MNOP2', doctor: 'Dra. Rosa Chávez' },
        { fecha: '12/05/2025', monto: 150,  metodo: 'efectivo', recibo: 'EFV-ABC3',  doctor: 'Dra. Rosa Chávez' },
      ],
    },
    payments: [
      { fecha: '14/04/2025', tratamiento: 'Endodoncia #21', monto: 650,  metodo: 'efectivo', ref: 'EFV-KZX1'  },
      { fecha: '28/04/2025', tratamiento: 'Corona PFM #21', monto: 1200, metodo: 'qr',       ref: 'QRS-MNOP2' },
      { fecha: '12/05/2025', tratamiento: 'Control',        monto: 150,  metodo: 'efectivo', ref: 'EFV-ABC3'  },
    ],
    images: [
      { fecha: '10/03/2025', descripcion: 'Radiografía inicial',      tipo: 'rx',      url: null },
      { fecha: '14/04/2025', descripcion: 'Pre-endodoncia pieza #21', tipo: 'clinica', url: null },
    ],
    consents: [
      { documento: 'Consentimiento endodoncia', fecha: '14/04/2025', firmado: true },
      { documento: 'Consentimiento corona PFM', fecha: '28/04/2025', firmado: true },
    ],
    historiaClinica: {
      cuestionario: { hipertension: false, diabetes: false },
      alergias: 'Penicilina',
      medicacion: '',
      habitos: {},
      motivo: 'Dolor en pieza #21, sensibilidad al frío',
      examenExtraoral: 'Sin hallazgos relevantes',
      examenIntraoral: 'Caries profunda pieza #21, compromiso pulpar',
      diagnostico: 'Necrosis pulpar pieza #21. Plan: endodoncia + corona PFM.',
      derivaciones: [],
    },
  },
  2: {
    history: [
      { fecha: '08/05/2025', tratamiento: 'Limpieza dental',  doctor: 'Dr. Andrés Flores', monto: 250, pagado: true },
      { fecha: '15/04/2025', tratamiento: 'Consulta general', doctor: 'Dr. Andrés Flores', monto: 150, pagado: true },
    ],
    toothStates: { 18: 'missing', 28: 'missing', 37: 'caries', 46: 'caries' },
    plan: {
      titulo: 'Plan de tratamiento',
      inicio: '15/04/2025',
      montoTotal: 810,
      pasos: [
        { n: 1, descripcion: 'Limpieza + profilaxis', monto: 250, estado: 'completado' },
        { n: 2, descripcion: 'Resina pieza #37',      monto: 280, estado: 'en-curso'   },
        { n: 3, descripcion: 'Resina pieza #46',      monto: 280, estado: 'pendiente'  },
      ],
      abonos: [
        { fecha: '08/05/2025', monto: 250, metodo: 'efectivo', recibo: 'EFV-JLQ1', doctor: 'Dr. Andrés Flores' },
      ],
    },
    payments: [
      { fecha: '08/05/2025', tratamiento: 'Limpieza dental', monto: 250, metodo: 'efectivo', ref: 'EFV-JLQ1' },
    ],
    images: [
      { fecha: '15/04/2025', descripcion: 'Foto clínica inicial', tipo: 'clinica', url: null },
    ],
    consents: [
      { documento: 'Ficha de historia clínica', fecha: '15/04/2025', firmado: true },
    ],
    historiaClinica: {
      cuestionario: { diabetes: true },
      alergias: '',
      medicacion: 'Metformina 500mg',
      habitos: { Fumador: true },
      motivo: 'Limpieza general, caries múltiples',
      examenExtraoral: 'Sin alteraciones',
      examenIntraoral: 'Cálculo generalizado, caries #37 y #46',
      diagnostico: 'Periodontitis leve, caries activas #37 y #46.',
      derivaciones: [],
    },
  },
};

const TEETH_FDI = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
                   48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const REPORT_PERIODS = {
  hoy: {
    label: 'Hoy · 21 mayo 2025',
    ingresos: 1280, pacientes: 4, tratamientos: 4, canceladas: 0,
    deltaIngr: '+8% vs ayer', deltaPac: '+1 vs ayer',
    chart: [
      { x: '08h', y: 0 }, { x: '09h', y: 250 }, { x: '10h', y: 650 },
      { x: '11h', y: 0 }, { x: '12h', y: 380 }, { x: '14h', y: 0  },
      { x: '15h', y: 0 }, { x: '16h', y: 0   }, { x: '17h', y: 0  },
    ],
    chartLabel: 'Ingresos por hora', chartSub: 'Hoy',
  },
  semana: {
    label: 'Semana 19–24 mayo 2025',
    ingresos: 8450, pacientes: 24, tratamientos: 22, canceladas: 2,
    deltaIngr: '+14% vs semana anterior', deltaPac: '+3 vs semana anterior',
    chart: [
      { x: 'Lun', y: 1800 }, { x: 'Mar', y: 2100 },
      { x: 'Mié', y: 1280 }, { x: 'Jue', y: 1650 },
      { x: 'Vie', y: 1620 }, { x: 'Sáb', y: 0    },
    ],
    chartLabel: 'Ingresos por día', chartSub: 'Esta semana',
  },
  mayo: {
    label: 'Mayo 2025',
    ingresos: 28600, pacientes: 82, tratamientos: 76, canceladas: 6,
    deltaIngr: '+18% vs abril', deltaPac: '+9 vs abril',
    chart: [
      { x: 'S1', y: 6200 }, { x: 'S2', y: 7400 },
      { x: 'S3', y: 8450 }, { x: 'S4', y: 6550 },
    ],
    chartLabel: 'Ingresos por semana', chartSub: 'Mayo 2025',
  },
  trimestre: {
    label: '2° trimestre 2025',
    ingresos: 72400, pacientes: 215, tratamientos: 198, canceladas: 17,
    deltaIngr: '+22% vs Q1', deltaPac: '+28 vs Q1',
    chart: [
      { x: 'Abr', y: 21800 }, { x: 'May', y: 28600 }, { x: 'Jun', y: 22000 },
    ],
    chartLabel: 'Ingresos por mes', chartSub: 'Q2 2025',
  },
  '2025': {
    label: 'Año 2025',
    ingresos: 145000, pacientes: 420, tratamientos: 395, canceladas: 25,
    deltaIngr: '+31% vs 2024', deltaPac: '+52 vs 2024',
    chart: [
      { x: 'Ene', y: 18200 }, { x: 'Feb', y: 20400 }, { x: 'Mar', y: 24600 },
      { x: 'Abr', y: 21800 }, { x: 'May', y: 28600 }, { x: 'Jun', y: 22000 },
      { x: 'Jul', y: 0 },     { x: 'Ago', y: 0 },     { x: 'Sep', y: 0 },
      { x: 'Oct', y: 0 },     { x: 'Nov', y: 0 },     { x: 'Dic', y: 0 },
    ],
    chartLabel: 'Ingresos por mes', chartSub: '2025',
  },
};

const ALERTS = [
  { tipo: 'alert',   mensaje: 'Caja — 2 tratamientos sin recibo · Dra. Rosa Chávez (1–15 jun)',         accion: 'Ver liquidación',  nav: 'liquidacion', navOpts: null             },
  { tipo: 'warning', mensaje: 'Lucía F. — Limpieza cobrada Bs. 200 (catálogo Bs. 250)',                  accion: 'Ver',              nav: 'liquidacion', navOpts: null             },
  { tipo: 'warning', mensaje: '2 citas sin confirmar para mañana (jueves)',                              accion: 'Ver agenda',       nav: 'agenda',      navOpts: null             },
  { tipo: 'info',    mensaje: 'María Elena M. — Control corona #21 vence en 7 días',                     accion: 'Ver paciente',     nav: 'ficha',       navOpts: { patientId: 1 } },
  { tipo: 'warning', mensaje: 'Roberto Chávez — Sin retorno hace más de 3 meses',                        accion: 'Ver historial',    nav: 'pacientes',   navOpts: null             },
];

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

const PRESUPUESTOS = [
  {
    id: 'PRES-2025-001',
    pacienteId: 1, paciente: 'María Elena Mamani Quispe', tel: '7823 4512',
    doctor: 'Dra. Rosa Chávez', consultorio: 'A',
    fecha: '15/05/2025', vencimiento: '14/06/2025', estado: 'aceptado',
    items: [
      { id: 1, tratamiento: 'Endodoncia unirradicular', cantidad: 1, precio: 650,  descuento: 0 },
      { id: 2, tratamiento: 'Corona PFM',               cantidad: 1, precio: 1200, descuento: 5 },
    ],
    descuentoGlobal: 0, planPago: 'cuotas-3',
    notas: 'Pieza #21. Plan de tratamiento acordado con la paciente.',
  },
  {
    id: 'PRES-2025-002',
    pacienteId: 2, paciente: 'Jorge Luis Quispe Torrez', tel: '6712 3890',
    doctor: 'Dr. Andrés Flores', consultorio: 'B',
    fecha: '20/05/2025', vencimiento: '19/06/2025', estado: 'enviado',
    items: [
      { id: 1, tratamiento: 'Blanqueamiento dental', cantidad: 1, precio: 500, descuento: 10 },
      { id: 2, tratamiento: 'Limpieza dental',       cantidad: 1, precio: 250, descuento: 0  },
    ],
    descuentoGlobal: 0, planPago: 'contado', notas: '',
  },
  {
    id: 'PRES-2025-003',
    pacienteId: 3, paciente: 'Lucía Fernández Marca', tel: '7234 5678',
    doctor: 'Dra. Rosa Chávez', consultorio: 'A',
    fecha: '22/05/2025', vencimiento: '21/06/2025', estado: 'borrador',
    items: [
      { id: 1, tratamiento: 'Brackets cerámicos setup', cantidad: 1, precio: 3500, descuento: 0 },
      { id: 2, tratamiento: 'Ortodoncia mensualidad',   cantidad: 6, precio: 350,  descuento: 0 },
    ],
    descuentoGlobal: 5, planPago: 'cuotas-6',
    notas: 'Primera consulta de ortodoncia incluida en el setup.',
  },
];

const TREATMENT_TYPES = [
  { name: 'Operatoria', pct: 28, color: '#0D9488' },
  { name: 'Prevención', pct: 22, color: '#3B82F6' },
  { name: 'Endodoncia', pct: 18, color: '#F59E0B' },
  { name: 'Prótesis',   pct: 15, color: '#FB923C' },
  { name: 'Cirugía',    pct: 10, color: '#8B5CF6' },
  { name: 'Ortodoncia', pct:  7, color: '#F87171' },
];

const LIQUIDACION_SAMPLE = {
  periodo: '01/06/2025 – 15/06/2025',
  rows: [
    { id: 1,  doctorId: 'r', fecha: '02/06/2025', paciente: 'María Elena Mamani', tratamiento: 'Control corona #21',        precioBase: 150,  material: 0,   comisionable: 150,  comision: 60,  recibo: 'REC-060201', alerta: null              },
    { id: 2,  doctorId: 'r', fecha: '03/06/2025', paciente: 'Lucía Fernández',    tratamiento: 'Resina 2 superficies',      precioBase: 380,  material: 60,  comisionable: 320,  comision: 128, recibo: null,          alerta: 'sin-recibo'      },
    { id: 3,  doctorId: 'r', fecha: '04/06/2025', paciente: 'Sofía Mamani',       tratamiento: 'Limpieza dental',           precioBase: 200,  material: 30,  comisionable: 170,  comision: 68,  recibo: 'REC-060203', alerta: 'precio-bajo'     },
    { id: 4,  doctorId: 'r', fecha: '05/06/2025', paciente: 'Patricia Rojas',     tratamiento: 'Radiografía panorámica',    precioBase: 250,  material: 30,  comisionable: 220,  comision: 88,  recibo: 'REC-060204', alerta: null              },
    { id: 5,  doctorId: 'r', fecha: '07/06/2025', paciente: 'Carlos Vargas',      tratamiento: 'Consulta general',          precioBase: 150,  material: 0,   comisionable: 150,  comision: 60,  recibo: 'REC-060206', alerta: 'salto-numeracion'},
    { id: 6,  doctorId: 'r', fecha: '08/06/2025', paciente: 'María Elena Mamani', tratamiento: 'Endodoncia unirradicular',  precioBase: 650,  material: 120, comisionable: 530,  comision: 212, recibo: null,          alerta: 'sin-recibo'      },
    { id: 7,  doctorId: 'r', fecha: '10/06/2025', paciente: 'Lucía Fernández',    tratamiento: 'Corona PFM',                precioBase: 1200, material: 350, comisionable: 850,  comision: 340, recibo: 'REC-060207', alerta: null              },
    { id: 8,  doctorId: 'a', fecha: '02/06/2025', paciente: 'Jorge Luis Quispe',  tratamiento: 'Limpieza dental',           precioBase: 250,  material: 30,  comisionable: 220,  comision: 99,  recibo: 'REC-060302', alerta: null              },
    { id: 9,  doctorId: 'a', fecha: '04/06/2025', paciente: 'Diego Torrez',       tratamiento: 'Endodoncia birradicular',   precioBase: 850,  material: 180, comisionable: 670,  comision: 302, recibo: null,          alerta: 'sin-recibo'      },
    { id: 10, doctorId: 'a', fecha: '05/06/2025', paciente: 'Roberto Chávez',     tratamiento: 'Consulta general',          precioBase: 150,  material: 0,   comisionable: 150,  comision: 68,  recibo: 'REC-060305', alerta: null              },
    { id: 11, doctorId: 'a', fecha: '07/06/2025', paciente: 'Jorge Luis Quispe',  tratamiento: 'Resina 2 superficies',      precioBase: 380,  material: 60,  comisionable: 320,  comision: 144, recibo: 'REC-060306', alerta: null              },
    { id: 12, doctorId: 'a', fecha: '09/06/2025', paciente: 'Carlos Vargas',      tratamiento: 'Extracción simple',         precioBase: 200,  material: 20,  comisionable: 180,  comision: 81,  recibo: 'REC-060307', alerta: 'precio-bajo'     },
  ],
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
