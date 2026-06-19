-- ================================================================
-- DentalCare Pro · Seed Data
-- Ejecutar DESPUÉS de schema.sql
-- ================================================================

-- Sucursales
insert into public.sucursales (id, nombre, dir, ciudad, tel) values
  ('A', 'Benjer',                           'Calle 8 N° 7, Villa 1° de Mayo', 'Santa Cruz, Bolivia', '736-90680'),
  ('B', 'BRISA · Servicio Dental Integral', 'Calle 8 #9, Villa 1° de Mayo',   'Santa Cruz, Bolivia', '73690680 / 63437327')
on conflict (id) do update set nombre = excluded.nombre, dir = excluded.dir;

-- Doctores
insert into public.doctores (id, nombre, iniciales, color, sucursal_id, comision) values
  ('r', 'Dra. Rosa Chávez',  'RC', '#0D9488', 'A', 0.400),
  ('a', 'Dr. Andrés Flores', 'AF', '#3B82F6', 'B', 0.450)
on conflict (id) do update set nombre = excluded.nombre, comision = excluded.comision;

-- Catálogo de tratamientos
insert into public.catalogo_tratamientos (id, tratamiento, categoria, precio, material) values
  ('c01', 'Consulta general',          'Consultas',  150,  0   ),
  ('c02', 'Consulta de emergencia',    'Consultas',  200,  0   ),
  ('p01', 'Limpieza dental',           'Prevención', 250,  30  ),
  ('p02', 'Fluorización',              'Prevención', 120,  15  ),
  ('r01', 'Radiografía periapical',    'Radiología', 80,   15  ),
  ('r02', 'Radiografía panorámica',    'Radiología', 250,  30  ),
  ('o01', 'Amalgama 1 superficie',     'Operatoria', 200,  40  ),
  ('o02', 'Resina 1 superficie',       'Operatoria', 280,  45  ),
  ('o03', 'Resina 2 superficies',      'Operatoria', 380,  60  ),
  ('e01', 'Endodoncia unirradicular',  'Endodoncia', 650,  120 ),
  ('e02', 'Endodoncia birradicular',   'Endodoncia', 850,  180 ),
  ('ci1', 'Extracción simple',         'Cirugía',    200,  20  ),
  ('ci2', 'Extracción quirúrgica',     'Cirugía',    450,  60  ),
  ('pr1', 'Corona PFM',                'Prótesis',   1200, 350 ),
  ('pr2', 'Corona zirconia',           'Prótesis',   1800, 600 ),
  ('pr3', 'Incrustación',              'Prótesis',   900,  200 ),
  ('es1', 'Blanqueamiento dental',     'Estética',   500,  80  ),
  ('es2', 'Carillas de porcelana',     'Estética',   1500, 350 ),
  ('or1', 'Ortodoncia mensualidad',    'Ortodoncia', 350,  0   ),
  ('or2', 'Brackets cerámicos setup',  'Ortodoncia', 3500, 800 )
on conflict (id) do update set precio = excluded.precio, material = excluded.material;

-- Pacientes
insert into public.pacientes (nombre, apellidos, ci, edad, tel, email, doctor_id, sucursal_id, ultima_visita, estado, avatar, avatar_color)
values
  ('María Elena', 'Mamani Quispe',   '7823451', 34, '7823 4512', 'maria.mamani@gmail.com',    'r', 'A', '2025-05-12', 'activo',      'ME', '#0D9488'),
  ('Jorge Luis',  'Quispe Torrez',   '5634782', 45, '6712 3890', 'j.quispe@hotmail.com',      'a', 'B', '2025-05-08', 'activo',      'JQ', '#3B82F6'),
  ('Lucía',       'Fernández Marca', '8912345', 27, '7234 5678', 'lucia.fernandez@gmail.com', 'r', 'A', '2025-05-03', 'activo',      'LF', '#F59E0B'),
  ('Carlos',      'Vargas Condori',  '6234189', 52, '7891 2345', 'c.vargas@gmail.com',        'a', 'B', '2025-04-21', 'sin-retorno', 'CV', '#FB923C'),
  ('Patricia',    'Rojas Huanca',    '7345612', 38, '6823 4567', 'patricia.r@gmail.com',      'r', 'A', '2025-05-10', 'activo',      'PR', '#10B981'),
  ('Roberto',     'Chávez Lima',     '8456723', 61, '7912 3456', 'r.chavez@yahoo.com',        'a', 'B', '2025-03-15', 'sin-retorno', 'RC', '#8B5CF6'),
  ('Sofía',       'Mamani Cruz',     '9123456', 22, '7234 5671', 'sofia.mamani@gmail.com',    'r', 'A', '2025-05-19', 'activo',      'SM', '#0D9488'),
  ('Diego',       'Torrez Quispe',   '6789012', 35, '6891 2345', 'diego.torrez@gmail.com',    'a', 'B', '2025-05-17', 'activo',      'DT', '#3B82F6');

-- Citas semana actual
-- date_trunc('week', CURRENT_DATE)::date = Lunes de la semana ISO actual
do $$
declare
  w  date := date_trunc('week', current_date)::date;
  p1 bigint; p2 bigint; p3 bigint; p4 bigint;
  p5 bigint; p6 bigint; p7 bigint; p8 bigint;
begin
  select id into p1 from public.pacientes where nombre='María Elena' and apellidos='Mamani Quispe';
  select id into p2 from public.pacientes where nombre='Jorge Luis'  and apellidos='Quispe Torrez';
  select id into p3 from public.pacientes where nombre='Lucía'       and apellidos='Fernández Marca';
  select id into p4 from public.pacientes where nombre='Carlos'      and apellidos='Vargas Condori';
  select id into p5 from public.pacientes where nombre='Patricia'    and apellidos='Rojas Huanca';
  select id into p6 from public.pacientes where nombre='Roberto'     and apellidos='Chávez Lima';
  select id into p7 from public.pacientes where nombre='Sofía'       and apellidos='Mamani Cruz';
  select id into p8 from public.pacientes where nombre='Diego'       and apellidos='Torrez Quispe';

  insert into public.citas (paciente_id, paciente_nombre, doctor_id, sucursal_id, fecha, hora, duracion, tratamiento, notas, estado) values
    (p1,'María Elena Mamani', 'r','A', w+0, '08:00', 1, 'Endodoncia',            'Continuar raíz mesial',    'completada'),
    (p2,'Jorge Luis Quispe',  'a','B', w+0, '09:00', 1, 'Limpieza dental',        '',                         'completada'),
    (p3,'Lucía Fernández',    'r','A', w+0, '10:00', 1, 'Consulta general',       'Primera visita',           'confirmada'),
    (p5,'Patricia Rojas',     'r','A', w+1, '09:00', 1, 'Blanqueamiento dental',  '',                         'confirmada'),
    (p6,'Roberto Chávez',     'a','B', w+1, '10:00', 1, 'Extracción simple',      'Pieza #38',                'pendiente' ),
    (p7,'Sofía Mamani',       'r','A', w+1, '11:00', 1, 'Corona PFM',             'Control post-instalación', 'confirmada'),
    (p8,'Diego Torrez',       'a','B', w+2, '08:30', 1, 'Endodoncia',             'Segunda sesión',           'en-curso'  ),
    (p4,'Carlos Vargas',      'a','B', w+2, '09:30', 1, 'Consulta general',       '',                         'pendiente' ),
    (p1,'María Elena Mamani', 'r','A', w+2, '11:00', 1, 'Control corona',         'Revisión pieza #21',       'pendiente' ),
    (p3,'Lucía Fernández',    'r','A', w+3, '09:00', 1, 'Ortodoncia',             'Ajuste arco superior',     'confirmada'),
    (p2,'Jorge Luis Quispe',  'a','B', w+3, '10:00', 1, 'Resina 2 superficies',   'Pieza #16',                'confirmada'),
    (p5,'Patricia Rojas',     'r','A', w+4, '08:00', 1, 'Radiografía panorámica', '',                         'confirmada'),
    (p7,'Sofía Mamani',       'r','A', w+4, '10:00', 1, 'Limpieza dental',        'Profilaxis semestral',     'pendiente' ),
    (p8,'Diego Torrez',       'a','B', w+5, '09:00', 1, 'Control',                'Post-endodoncia',          'pendiente' );
end $$;

-- Historia clínica paciente 1
insert into public.historia_clinica (paciente_id, cuestionario, alergias, medicacion, habitos, motivo, examen_extraoral, examen_intraoral, diagnostico)
select p.id,
  '{"hipertension": false, "diabetes": false}'::jsonb,
  'Penicilina', '', '{}'::jsonb,
  'Dolor en pieza #21, sensibilidad al frío',
  'Sin hallazgos relevantes',
  'Caries profunda pieza #21, compromiso pulpar',
  'Necrosis pulpar pieza #21. Plan: endodoncia + corona PFM.'
from public.pacientes p where p.nombre='María Elena' and p.apellidos='Mamani Quispe'
on conflict (paciente_id) do nothing;

-- Historia clínica paciente 2
insert into public.historia_clinica (paciente_id, cuestionario, alergias, medicacion, habitos, motivo, examen_extraoral, examen_intraoral, diagnostico)
select p.id,
  '{"diabetes": true}'::jsonb,
  '', 'Metformina 500mg', '{"Fumador": true}'::jsonb,
  'Limpieza general, caries múltiples',
  'Sin alteraciones',
  'Cálculo generalizado, caries #37 y #46',
  'Periodontitis leve, caries activas #37 y #46.'
from public.pacientes p where p.nombre='Jorge Luis' and p.apellidos='Quispe Torrez'
on conflict (paciente_id) do nothing;

-- Historial clínico pacientes 1 y 2
insert into public.historial_clinico (paciente_id, fecha, tratamiento, doctor_id, monto, pagado)
select p.id, v.fecha::date, v.trat, v.doc, v.monto, true
from public.pacientes p
join (values
  ('María Elena','Mamani Quispe', '2025-03-10','Consulta general',              'r',150 ),
  ('María Elena','Mamani Quispe', '2025-04-03','Radiografía periapical',        'r',80  ),
  ('María Elena','Mamani Quispe', '2025-04-14','Endodoncia unirradicular #21',  'r',650 ),
  ('María Elena','Mamani Quispe', '2025-04-28','Instalación corona PFM #21',    'r',1200),
  ('María Elena','Mamani Quispe', '2025-05-12','Control corona #21',            'r',150 ),
  ('Jorge Luis', 'Quispe Torrez', '2025-04-15','Consulta general',              'a',150 ),
  ('Jorge Luis', 'Quispe Torrez', '2025-05-08','Limpieza dental',               'a',250 )
) as v(nombre, apellidos, fecha, trat, doc, monto) on p.nombre=v.nombre and p.apellidos=v.apellidos;

-- Plan de tratamiento paciente 1
do $$
declare pid bigint; planid bigint;
begin
  select id into pid from public.pacientes where nombre='María Elena' and apellidos='Mamani Quispe';
  insert into public.planes_tratamiento (paciente_id, titulo, fecha_inicio, monto_total)
  values (pid, 'Plan de tratamiento integral', '2025-03-10', 2330)
  returning id into planid;
  insert into public.pasos_plan (plan_id, numero, descripcion, monto, estado) values
    (planid, 1, 'Endodoncia pieza #21', 650,  'completado'),
    (planid, 2, 'Corona PFM pieza #21', 1200, 'completado'),
    (planid, 3, 'Resina pieza #16',     280,  'en-curso'  ),
    (planid, 4, 'Extracción pieza #47', 200,  'pendiente' );
  insert into public.abonos (plan_id, fecha, monto, metodo, recibo, doctor_id) values
    (planid, '2025-04-14', 650,  'efectivo', 'EFV-KZX1',  'r'),
    (planid, '2025-04-28', 800,  'qr',       'QRS-MNOP2', 'r'),
    (planid, '2025-05-12', 150,  'efectivo', 'EFV-ABC3',  'r');
end $$;

-- Plan de tratamiento paciente 2
do $$
declare pid bigint; planid bigint;
begin
  select id into pid from public.pacientes where nombre='Jorge Luis' and apellidos='Quispe Torrez';
  insert into public.planes_tratamiento (paciente_id, titulo, fecha_inicio, monto_total)
  values (pid, 'Plan de tratamiento', '2025-04-15', 810)
  returning id into planid;
  insert into public.pasos_plan (plan_id, numero, descripcion, monto, estado) values
    (planid, 1, 'Limpieza + profilaxis', 250, 'completado'),
    (planid, 2, 'Resina pieza #37',      280, 'en-curso'  ),
    (planid, 3, 'Resina pieza #46',      280, 'pendiente' );
  insert into public.abonos (plan_id, fecha, monto, metodo, recibo, doctor_id) values
    (planid, '2025-05-08', 250, 'efectivo', 'EFV-JLQ1', 'a');
end $$;

-- Estado dental paciente 1
insert into public.estado_dental (paciente_id, pieza, estado)
select p.id, v.pieza, v.est from public.pacientes p,
  (values (21,'crown'::text),(16,'caries'),(36,'treatment'),(47,'extracted')) as v(pieza,est)
where p.nombre='María Elena' and p.apellidos='Mamani Quispe'
on conflict (paciente_id, pieza) do update set estado = excluded.estado;

-- Estado dental paciente 2
insert into public.estado_dental (paciente_id, pieza, estado)
select p.id, v.pieza, v.est from public.pacientes p,
  (values (18,'missing'::text),(28,'missing'),(37,'caries'),(46,'caries')) as v(pieza,est)
where p.nombre='Jorge Luis' and p.apellidos='Quispe Torrez'
on conflict (paciente_id, pieza) do update set estado = excluded.estado;

-- Pagos paciente 1
insert into public.pagos (paciente_id, doctor_id, sucursal_id, fecha, tratamiento, monto, metodo, numero_recibo)
select p.id, 'r', 'A', v.fecha::date, v.trat, v.monto, v.met, v.rec
from public.pacientes p,
  (values
    ('2025-04-14','Endodoncia #21',  650,  'efectivo','EFV-KZX1'),
    ('2025-04-28','Corona PFM #21',  1200, 'qr',      'QRS-MNOP2'),
    ('2025-05-12','Control',         150,  'efectivo','EFV-ABC3')
  ) as v(fecha, trat, monto, met, rec)
where p.nombre='María Elena' and p.apellidos='Mamani Quispe';

-- Pagos paciente 2
insert into public.pagos (paciente_id, doctor_id, sucursal_id, fecha, tratamiento, monto, metodo, numero_recibo)
select p.id, 'a', 'B', '2025-05-08', 'Limpieza dental', 250, 'efectivo', 'EFV-JLQ1'
from public.pacientes p where p.nombre='Jorge Luis' and p.apellidos='Quispe Torrez';

-- Consentimientos paciente 1
insert into public.consentimientos (paciente_id, documento, fecha, firmado)
select p.id, v.doc, v.fecha::date, true from public.pacientes p,
  (values ('Consentimiento endodoncia','2025-04-14'),('Consentimiento corona PFM','2025-04-28')) as v(doc,fecha)
where p.nombre='María Elena' and p.apellidos='Mamani Quispe';

-- Consentimientos paciente 2
insert into public.consentimientos (paciente_id, documento, fecha, firmado)
select p.id, 'Ficha de historia clínica', '2025-04-15', true
from public.pacientes p where p.nombre='Jorge Luis' and p.apellidos='Quispe Torrez';

-- ================================================================
-- PASO FINAL: Crear usuarios en Authentication > Users y luego
-- ejecutar el siguiente bloque actualizando los nombres y roles
-- según los usuarios que creaste.
--
-- Emails de ejemplo:
--   admin@dentalcare.bo         → rol: admin
--   recepcion@dentalcare.bo     → rol: recepcion
--   rosa@dentalcare.bo          → rol: doctor, doctor_id: r
--   andres@dentalcare.bo        → rol: doctor, doctor_id: a
-- ================================================================
