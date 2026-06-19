# DentalCare Pro — Documentación del sistema

Sistema de gestión clínica para consultorios dentales. Desarrollado con React + Vite y base de datos Supabase.

---

## Tecnología

- **Frontend:** React 18 + Vite 6 (SPA, una sola página)
- **Base de datos:** Supabase (PostgreSQL en la nube)
- **Autenticación:** Supabase Auth (correo + contraseña)
- **Estilos:** CSS puro con variables personalizadas
- **Gráficos:** Recharts

---

## Usuarios y roles

El sistema tiene **3 roles** con permisos distintos:

### 👑 Admin
- Acceso completo a todos los módulos
- Puede ver y editar configuración (precios, comisiones, sucursales)
- Ve reportes y liquidaciones de todos los doctores
- Gestiona solicitudes de cita web

### 🗂️ Recepción
- Puede registrar pacientes nuevos y admisiones
- Gestiona la agenda (crear/confirmar/cancelar citas)
- Acepta o rechaza solicitudes de reserva web
- Registra cobros y genera presupuestos
- **NO puede** ver configuración ni reportes globales

### 🩺 Doctor
- Solo ve **sus propios pacientes** y **su propia agenda**
- Puede editar la ficha clínica de sus pacientes
- Ve su liquidación de comisiones
- **NO puede** ver pagos, configuración ni pacientes de otros doctores

---

## Módulos del sistema

### 1. 🏠 Dashboard
Pantalla de inicio con resumen general:
- Próximas citas del día
- Pacientes recientes
- Alertas y recordatorios
- Estadísticas rápidas

---

### 2. 👥 Pacientes
Lista completa de pacientes registrados.

**Qué puedes hacer:**
- Buscar por nombre, CI o celular
- Filtrar por estado: Todos / Activos / Sin retorno
- Crear un paciente nuevo con el botón **"Nuevo Paciente"**
- Hacer clic en cualquier fila para abrir la **Ficha del paciente**

**Campos al crear paciente:**
- Nombre y apellidos
- Carnet de identidad (CI)
- Edad, celular, correo
- Doctor asignado y sucursal

> **Doctor:** Solo ve sus propios pacientes, no los de los demás.

---

### 3. 📋 Ficha del paciente
Al hacer clic en un paciente se abre su ficha completa con 7 pestañas:

#### Pestaña: Datos
Información personal del paciente. Se puede editar con el botón **"Editar datos"**.
- Nombre, CI, edad, celular, correo
- Doctor asignado, sucursal, estado (Activo / Sin retorno)

#### Pestaña: Historia clínica
Formulario médico completo:
- **Antecedentes médicos** (hipertensión, diabetes, embarazo, etc.) — se marcan los que apliquen
- **Alergias** y medicación actual
- **Hábitos** relevantes (bruxismo, fumador, etc.)
- Motivo de consulta, examen extraoral e intraoral
- Diagnóstico general
- Se guarda con el botón **"Guardar"**

#### Pestaña: Historial
Registro cronológico de todas las visitas del paciente:
- Fecha, tratamiento realizado, doctor y monto
- Indica si fue pagado o no
- Es solo lectura (se genera automáticamente con cada atención)

#### Pestaña: Odontograma
Mapa visual de los 32 dientes del paciente (nomenclatura FDI):
- **Modo vista:** clic en un diente para ver su estado
- **Modo edición:** activar con "Editar odontograma" → clic en dientes para ciclar entre estados:
  - ✅ Sana → 🔴 Caries → 🔵 Corona → 🟡 En tratamiento → ❌ Extracción → ⬜ Ausente
- Al guardar se actualiza en la base de datos

#### Pestaña: Tratamientos
Plan de tratamiento activo del paciente:
- Lista de pasos con descripción, monto y estado (Pendiente / En curso / Completado)
- Barra de progreso del tratamiento
- Resumen financiero: Total acordado / Pagado / Saldo pendiente
- Registro de **abonos**: fecha, monto, método de pago y recibo
- Con **"Editar plan"** se puede cambiar el estado de cada paso

#### Pestaña: Pagos / Caja
Historial de todos los pagos registrados para este paciente:
- Fecha, tratamiento, monto, método y comprobante
- Botón **"Registrar pago"** que lleva al módulo de Cobros

#### Pestaña: Archivos
Documentos e imágenes clínicas del paciente:
- **Imágenes clínicas:** radiografías, fotos — se suben con "Subir imagen"
- **Consentimientos:** documentos firmados — se pueden marcar como firmados

---

### 4. 📅 Agenda
Calendario semanal de citas por consultorio.

**Vista:**
- Grilla de lunes a sábado, de 8:00 a 18:00
- Cada cita aparece como un bloque de color según su estado
- Navegar entre semanas con las flechas ← →

**Colores de estado:**
| Color | Estado |
|-------|--------|
| 🟡 Amarillo | Pendiente |
| 🟢 Verde | Confirmada |
| 🔵 Azul | En curso |
| ⬜ Gris | Completada |
| 🔴 Rojo | Cancelada |

**Crear cita** (botón "Nueva cita"):
- Seleccionar paciente existente o escribir nombre nuevo
- Doctor, sucursal, fecha, hora y duración
- Tipo de tratamiento y notas

**Gestionar cita** (clic sobre una cita):
- Ver detalle completo
- Avanzar estado: Pendiente → Confirmar (envía WhatsApp) → En curso → Completada
- Cancelar la cita

**Panel lateral — Solicitudes web:**
Cuando un paciente reserva desde la página pública de booking, aparece aquí:
- Ver nombre, fecha, hora y motivo
- **Aceptar:** crea la cita automáticamente + abre WhatsApp para notificar al paciente
- **Rechazar:** abre WhatsApp con mensaje de rechazo

**Panel lateral — Lista de espera:**
Pacientes que necesitan cita urgente. Se pueden agendar directamente desde aquí.

> **Doctor:** Solo ve su propia agenda, no puede ver la de otros doctores.

---

### 5. 💳 Cobros
Registro de pagos de tratamientos.

**Campos:**
- Paciente, doctor, sucursal
- Fecha, tratamiento realizado
- Monto en bolivianos (Bs.)
- Método de pago: Efectivo / QR Simple / Transferencia bancaria
- Banco y número de comprobante (si aplica)
- Notas adicionales

Los cobros registrados aquí aparecen en la pestaña **Pagos** de la ficha del paciente.

---

### 6. 📊 Reportes *(solo Admin)*
Estadísticas y resúmenes del consultorio:
- Ingresos por período
- Tratamientos más realizados
- Rendimiento por doctor y sucursal
- Exportación de datos

---

### 7. 💼 Presupuestos
Creación de presupuestos formales para pacientes:
- Seleccionar paciente y tratamientos del catálogo
- Aplicar descuentos por ítem o global
- Estados: Borrador / Enviado / Aceptado / Rechazado / Vencido
- Definir plan de pago

---

### 8. 💰 Liquidación
Cálculo de comisiones para doctores:
- Muestra los tratamientos realizados en el período
- Calcula la comisión según el porcentaje configurado
- Fórmula: `(Precio - Material) × % comisión`
- Filtros por doctor, sucursal y rango de fechas

> **Doctor:** Solo ve su propia liquidación.

---

### 9. 🏥 Admisión
Formulario completo de registro para paciente nuevo (3 pasos):

**Paso 1 — Datos personales:**
- Nombre, CI, fecha de nacimiento, celular, correo
- Sexo, estado civil, dirección, referido, ocupación
- Sucursal y doctor asignado

**Paso 2 — Historia clínica:**
- Antecedentes médicos (12 condiciones)
- Alergias y medicación
- Hábitos relevantes
- Motivo de consulta

**Paso 3 — Diagnóstico inicial:**
- Diagnóstico del doctor
- Plan de tratamiento sugerido
- Observaciones y derivaciones

Al finalizar, se crea el paciente **y** su historia clínica simultáneamente en la base de datos.

---

### 10. ⚙️ Configuración *(solo Admin)*
Tres secciones:

**Catálogo de precios:**
- Lista de todos los tratamientos con precio y costo de material
- La "Base comisionable" se calcula automáticamente: `Precio - Material`
- Se puede editar directamente en la tabla

**Doctores y comisiones:**
- Muestra cada doctor con su porcentaje de comisión
- Deslizador de 0% a 60%
- Vista previa del cálculo con un ejemplo real

**Sucursales:**
- Datos de cada sucursal (nombre, dirección, ciudad, teléfono)
- Se guardan en la base de datos y se sincronizan en todo el sistema

---

## Página de reservas (pública)

URL: `http://localhost:5174/#booking`

Esta página es **pública** — no requiere iniciar sesión. Está pensada para que los pacientes reserven citas desde internet.

**Flujo del paciente:**
1. Selecciona sucursal
2. Elige un día disponible (próximos 8 días, sin domingos)
3. Elige un horario disponible (los ocupados aparecen tachados)
4. Ingresa nombre y celular
5. Envía la solicitud

La solicitud queda guardada en Supabase y aparece en el **panel de solicitudes web** de la Agenda para que recepción la apruebe o rechace.

---

## Flujo típico de trabajo

```
Paciente llama → Recepción crea cita en Agenda
                 ↓
            Paciente llega → Admisión o se abre Ficha existente
                 ↓
            Doctor atiende → Actualiza Historia clínica + Odontograma
                 ↓
            Se acuerda tratamiento → Se carga Plan en pestaña Tratamientos
                 ↓
            Recepción cobra → Módulo Cobros → aparece en Pagos de la ficha
                 ↓
            Fin de mes → Admin revisa Liquidación y paga comisiones
```

---

## Instalación y configuración

### Requisitos
- Node.js 18+
- Cuenta en [supabase.com](https://supabase.com)

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
copy .env.local.example .env.local
# Editar .env.local con tu URL y clave de Supabase

# 3. En Supabase SQL Editor, ejecutar:
#    supabase/schema.sql  (crea las tablas)
#    supabase/seed.sql    (carga datos de prueba)

# 4. En Supabase → Authentication → Users, crear los usuarios

# 5. Iniciar el servidor
npm run dev
```

### Usuarios de prueba

| Correo | Contraseña | Rol |
|--------|-----------|-----|
| admin@dentalcare.bo | 123456 | Admin |
| recepcion@dentalcare.bo | 123456 | Recepción |
| rosa@dentalcare.bo | 123456 | Doctor |
| andres@dentalcare.bo | 123456 | Doctor |

---

## Estructura de archivos

```
src/
├── App.jsx                    # Enrutamiento y sesión principal
├── lib/
│   ├── supabase.js            # Cliente de Supabase
│   └── db.js                  # Todas las funciones de base de datos
├── components/
│   ├── data.js                # Datos estáticos (catálogo, bancos, etc.)
│   ├── Login.jsx              # Pantalla de inicio de sesión
│   ├── Dashboard.jsx          # Inicio / resumen
│   ├── Pacientes.jsx          # Lista de pacientes
│   ├── FichaPaciente.jsx      # Ficha con pestañas
│   ├── FichaPaciente/
│   │   ├── Datos.jsx          # Pestaña datos personales
│   │   ├── HistoriaClinica.jsx# Pestaña historia clínica
│   │   ├── Historial.jsx      # Pestaña historial de visitas
│   │   ├── Odontograma.jsx    # Pestaña odontograma
│   │   ├── Tratamientos.jsx   # Pestaña plan de tratamiento
│   │   ├── Pagos.jsx          # Pestaña historial de pagos
│   │   └── Archivos.jsx       # Pestaña imágenes y documentos
│   ├── Agenda.jsx             # Calendario de citas
│   ├── Admision.jsx           # Registro de paciente nuevo (3 pasos)
│   ├── Cobro.jsx              # Registro de pagos
│   ├── Presupuestos.jsx       # Gestión de presupuestos
│   ├── Liquidacion.jsx        # Comisiones de doctores
│   ├── Reportes.jsx           # Estadísticas
│   ├── Configuracion.jsx      # Ajustes del sistema
│   └── BookingPage.jsx        # Página pública de reservas
└── supabase/
    ├── schema.sql             # Estructura de la base de datos
    └── seed.sql               # Datos de prueba
```

---

## Base de datos — tablas principales

| Tabla | Descripción |
|-------|-------------|
| `perfiles` | Usuarios del sistema (vinculados a auth) |
| `sucursales` | Datos de cada consultorio |
| `doctores` | Doctores con color, iniciales y comisión |
| `pacientes` | Datos personales de los pacientes |
| `historia_clinica` | Una por paciente (antecedentes médicos) |
| `historial_clinico` | Registro de visitas realizadas |
| `citas` | Agenda de citas programadas |
| `solicitudes` | Reservas desde la página pública |
| `planes_tratamiento` | Plan acordado con el paciente |
| `pasos_plan` | Pasos individuales del plan |
| `abonos` | Pagos parciales del plan |
| `pagos` | Cobros registrados |
| `estado_dental` | Estado de cada diente del odontograma |
| `catalogo_tratamientos` | Lista de tratamientos con precios |
| `imagenes_clinicas` | Fotos y radiografías |
| `consentimientos` | Documentos firmados |
| `presupuestos` | Presupuestos formales |
