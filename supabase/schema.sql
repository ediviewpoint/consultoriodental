-- ================================================================
-- DentalCare Pro · Supabase Schema
-- 1. Ejecuta este archivo completo en el SQL Editor de Supabase
-- 2. Luego ejecuta seed.sql
-- 3. Crea los usuarios en Authentication > Users
-- ================================================================

-- ── Sucursales ────────────────────────────────────────────────────
create table if not exists public.sucursales (
  id      char(1)  primary key,
  nombre  text     not null,
  dir     text,
  ciudad  text     default 'Santa Cruz, Bolivia',
  tel     text
);
alter table public.sucursales enable row level security;
drop policy if exists "auth_all" on public.sucursales;
create policy "auth_all" on public.sucursales for all using (auth.role() = 'authenticated');

-- ── Doctores ──────────────────────────────────────────────────────
create table if not exists public.doctores (
  id          char(1)      primary key,
  nombre      text         not null,
  iniciales   char(2),
  color       char(7),
  sucursal_id char(1)      references public.sucursales(id),
  comision    numeric(5,3) default 0.400
);
alter table public.doctores enable row level security;
drop policy if exists "auth_all" on public.doctores;
create policy "auth_all" on public.doctores for all using (auth.role() = 'authenticated');

-- ── Perfiles de usuario (vinculado a auth.users) ──────────────────
create table if not exists public.perfiles (
  id         uuid    primary key references auth.users(id) on delete cascade,
  nombre     text    not null,
  rol        text    not null default 'recepcion',
  doctor_id  char(1) references public.doctores(id),
  created_at timestamptz default now(),
  constraint perfiles_rol_check check (rol in ('admin','recepcion','doctor'))
);
alter table public.perfiles enable row level security;
drop policy if exists "own_read" on public.perfiles;
create policy "own_read" on public.perfiles for select using (auth.uid() = id);
drop policy if exists "own_update" on public.perfiles;
create policy "own_update" on public.perfiles for update using (auth.uid() = id);

-- ── Pacientes ─────────────────────────────────────────────────────
create table if not exists public.pacientes (
  id            bigint      primary key generated always as identity,
  nombre        text        not null,
  apellidos     text        not null,
  ci            text,
  fecha_nac     date,
  edad          integer,
  sexo          char(1),
  estado_civil  text,
  tel           text,
  email         text,
  direccion     text,
  referido      text,
  ocupacion     text,
  doctor_id     char(1)     references public.doctores(id),
  sucursal_id   char(1)     references public.sucursales(id),
  ultima_visita date,
  estado        text        default 'activo',
  avatar        char(2),
  avatar_color  char(7)     default '#0D9488',
  created_at    timestamptz default now(),
  constraint pacientes_estado_check check (estado in ('activo','sin-retorno','inactivo'))
);
alter table public.pacientes enable row level security;
drop policy if exists "auth_all" on public.pacientes;
create policy "auth_all" on public.pacientes for all using (auth.role() = 'authenticated');

-- ── Catálogo de tratamientos ──────────────────────────────────────
create table if not exists public.catalogo_tratamientos (
  id           text          primary key,
  tratamiento  text          not null,
  categoria    text          not null,
  precio       numeric(10,2) default 0,
  material     numeric(10,2) default 0
);
alter table public.catalogo_tratamientos enable row level security;
drop policy if exists "auth_all" on public.catalogo_tratamientos;
create policy "auth_all" on public.catalogo_tratamientos for all using (auth.role() = 'authenticated');

-- ── Historia clínica (una por paciente) ──────────────────────────
create table if not exists public.historia_clinica (
  id               bigint       primary key generated always as identity,
  paciente_id      bigint       references public.pacientes(id) on delete cascade,
  cuestionario     jsonb        default '{}',
  alergias         text,
  medicacion       text,
  habitos          jsonb        default '{}',
  motivo           text,
  examen_extraoral text,
  examen_intraoral text,
  diagnostico      text,
  plan_texto       text,
  observaciones    text,
  derivaciones     text[]       default '{}',
  created_at       timestamptz  default now(),
  updated_at       timestamptz  default now(),
  unique (paciente_id)
);
alter table public.historia_clinica enable row level security;
drop policy if exists "auth_all" on public.historia_clinica;
create policy "auth_all" on public.historia_clinica for all using (auth.role() = 'authenticated');

-- ── Estado dental (odontograma) ───────────────────────────────────
create table if not exists public.estado_dental (
  id          bigint      primary key generated always as identity,
  paciente_id bigint      references public.pacientes(id) on delete cascade,
  pieza       integer     not null,
  estado      text        not null,
  updated_at  timestamptz default now(),
  unique (paciente_id, pieza)
);
alter table public.estado_dental enable row level security;
drop policy if exists "auth_all" on public.estado_dental;
create policy "auth_all" on public.estado_dental for all using (auth.role() = 'authenticated');

-- ── Historial clínico (visitas) ───────────────────────────────────
create table if not exists public.historial_clinico (
  id          bigint        primary key generated always as identity,
  paciente_id bigint        references public.pacientes(id) on delete cascade,
  fecha       date          not null,
  tratamiento text          not null,
  doctor_id   char(1)       references public.doctores(id),
  monto       numeric(10,2),
  pagado      boolean       default false,
  notas       text,
  created_at  timestamptz   default now()
);
alter table public.historial_clinico enable row level security;
drop policy if exists "auth_all" on public.historial_clinico;
create policy "auth_all" on public.historial_clinico for all using (auth.role() = 'authenticated');

-- ── Planes de tratamiento ─────────────────────────────────────────
create table if not exists public.planes_tratamiento (
  id           bigint        primary key generated always as identity,
  paciente_id  bigint        references public.pacientes(id) on delete cascade,
  titulo       text,
  fecha_inicio date,
  monto_total  numeric(10,2) default 0,
  created_at   timestamptz   default now()
);
alter table public.planes_tratamiento enable row level security;
drop policy if exists "auth_all" on public.planes_tratamiento;
create policy "auth_all" on public.planes_tratamiento for all using (auth.role() = 'authenticated');

-- ── Pasos del plan ────────────────────────────────────────────────
create table if not exists public.pasos_plan (
  id          bigint        primary key generated always as identity,
  plan_id     bigint        references public.planes_tratamiento(id) on delete cascade,
  numero      integer       not null,
  descripcion text          not null,
  monto       numeric(10,2) default 0,
  estado      text          default 'pendiente',
  constraint pasos_plan_estado_check check (estado in ('pendiente','en-curso','completado'))
);
alter table public.pasos_plan enable row level security;
drop policy if exists "auth_all" on public.pasos_plan;
create policy "auth_all" on public.pasos_plan for all using (auth.role() = 'authenticated');

-- ── Abonos ────────────────────────────────────────────────────────
create table if not exists public.abonos (
  id         bigint        primary key generated always as identity,
  plan_id    bigint        references public.planes_tratamiento(id) on delete cascade,
  fecha      date          not null,
  monto      numeric(10,2) not null,
  metodo     text          not null,
  recibo     text,
  doctor_id  char(1)       references public.doctores(id),
  created_at timestamptz   default now()
);
alter table public.abonos enable row level security;
drop policy if exists "auth_all" on public.abonos;
create policy "auth_all" on public.abonos for all using (auth.role() = 'authenticated');

-- ── Citas ─────────────────────────────────────────────────────────
-- hora se guarda como texto 'HH:MM' (ej: '08:00', '09:30')
create table if not exists public.citas (
  id              bigint       primary key generated always as identity,
  paciente_id     bigint       references public.pacientes(id),
  paciente_nombre text         not null,
  doctor_id       char(1)      references public.doctores(id),
  sucursal_id     char(1)      references public.sucursales(id) default 'A',
  fecha           date         not null,
  hora            text         not null,
  duracion        numeric(3,1) default 1.0,
  tratamiento     text,
  notas           text,
  estado          text         default 'pendiente',
  created_at      timestamptz  default now(),
  constraint citas_estado_check check (estado in ('pendiente','confirmada','en-curso','completada','cancelada'))
);
alter table public.citas enable row level security;
drop policy if exists "auth_all" on public.citas;
create policy "auth_all" on public.citas for all using (auth.role() = 'authenticated');

-- ── Solicitudes de cita (booking web público) ─────────────────────
create table if not exists public.solicitudes (
  id          bigint      primary key generated always as identity,
  fecha       date        not null,
  hora        text        not null,
  sucursal_id char(1)     references public.sucursales(id),
  nombre      text        not null,
  telefono    text        not null,
  motivo      text,
  estado      text        default 'pendiente',
  created_at  timestamptz default now(),
  constraint solicitudes_estado_check check (estado in ('pendiente','aceptada','rechazada'))
);
alter table public.solicitudes enable row level security;
-- Pacientes anónimos pueden enviar solicitudes
drop policy if exists "anon_insert" on public.solicitudes;
create policy "anon_insert" on public.solicitudes for insert with check (true);
-- Solo staff autenticado puede gestionar
drop policy if exists "auth_all" on public.solicitudes;
create policy "auth_all" on public.solicitudes for all  using (auth.role() = 'authenticated');

-- ── Presupuestos ─────────────────────────────────────────────────
create table if not exists public.presupuestos (
  id               text          primary key,
  paciente_id      bigint        references public.pacientes(id),
  paciente_nombre  text,
  paciente_tel     text,
  doctor_id        char(1)       references public.doctores(id),
  sucursal_id      char(1)       references public.sucursales(id),
  fecha            date,
  vencimiento      date,
  estado           text          default 'borrador',
  descuento_global numeric(5,2)  default 0,
  plan_pago        text,
  notas            text,
  created_at       timestamptz   default now(),
  constraint presupuestos_estado_check check (estado in ('borrador','enviado','aceptado','rechazado','vencido'))
);
alter table public.presupuestos enable row level security;
drop policy if exists "auth_all" on public.presupuestos;
create policy "auth_all" on public.presupuestos for all using (auth.role() = 'authenticated');

-- ── Items de presupuesto ──────────────────────────────────────────
create table if not exists public.items_presupuesto (
  id             bigint        primary key generated always as identity,
  presupuesto_id text          references public.presupuestos(id) on delete cascade,
  tratamiento    text          not null,
  cantidad       integer       default 1,
  precio         numeric(10,2) not null,
  descuento      numeric(5,2)  default 0
);
alter table public.items_presupuesto enable row level security;
drop policy if exists "auth_all" on public.items_presupuesto;
create policy "auth_all" on public.items_presupuesto for all using (auth.role() = 'authenticated');

-- ── Pagos / Cobros ────────────────────────────────────────────────
create table if not exists public.pagos (
  id            bigint        primary key generated always as identity,
  paciente_id   bigint        references public.pacientes(id),
  doctor_id     char(1)       references public.doctores(id),
  sucursal_id   char(1)       references public.sucursales(id),
  fecha         date          not null,
  tratamiento   text          not null,
  monto         numeric(10,2) not null,
  metodo        text          not null,
  banco_id      text,
  numero_recibo text,
  notas         text,
  created_at    timestamptz   default now()
);
alter table public.pagos enable row level security;
drop policy if exists "auth_all" on public.pagos;
create policy "auth_all" on public.pagos for all using (auth.role() = 'authenticated');

-- ── Imágenes clínicas ─────────────────────────────────────────────
create table if not exists public.imagenes_clinicas (
  id           bigint      primary key generated always as identity,
  paciente_id  bigint      references public.pacientes(id) on delete cascade,
  fecha        date,
  descripcion  text,
  tipo         text,
  url          text,
  storage_path text,
  created_at   timestamptz default now()
);
alter table public.imagenes_clinicas enable row level security;
drop policy if exists "auth_all" on public.imagenes_clinicas;
create policy "auth_all" on public.imagenes_clinicas for all using (auth.role() = 'authenticated');

-- ── Consentimientos ───────────────────────────────────────────────
create table if not exists public.consentimientos (
  id          bigint      primary key generated always as identity,
  paciente_id bigint      references public.pacientes(id) on delete cascade,
  documento   text        not null,
  fecha       date,
  firmado     boolean     default false,
  created_at  timestamptz default now()
);
alter table public.consentimientos enable row level security;
drop policy if exists "auth_all" on public.consentimientos;
create policy "auth_all" on public.consentimientos for all using (auth.role() = 'authenticated');

-- ── Trigger: crear perfil al registrar usuario ────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, nombre, rol, doctor_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'rol', 'recepcion'),
    (new.raw_user_meta_data->>'doctor_id')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
