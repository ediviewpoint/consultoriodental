# DentalCare Pro — Normas de Calidad y Seguridad

## Stack
Vite 6 + React 18 SPA · Supabase (auth + PostgreSQL) · hash-based routing · sin Tailwind (CSS custom con variables `--dc-*`)

## 🔐 Privacidad y Seguridad (PHI)

- **PROHIBIDO** imprimir datos de pacientes en `console.log` — nombres, C.I., diagnósticos, teléfonos, tratamientos. Solo `console.error(err)` para errores técnicos está permitido.
- Toda comunicación con Supabase ya usa HTTPS. No agregar fetch directo a APIs externas sin revisar si pasan datos de pacientes.
- Antes de escribir cualquier función de base de datos o autenticación, entrar en **Modo Plan** y evaluar riesgos de fuga de datos o inyección.

## 🔒 Control de roles

Roles disponibles: `admin`, `recepcion`, `doctor`. La validación de acceso vive en:
- **Frontend:** `ROLE_SCREENS` en `App.jsx` + `canAccess()` — pantallas permitidas por rol.
- **Sidebar:** `getSectionsForRole()` en `Sidebar.jsx` — ítems visibles por rol.
- **RLS Supabase:** cada tabla tiene Row Level Security activada en la base de datos.

**Reglas de negocio por rol que NO deben romperse:**
- `recepcion` no puede editar historia clínica ni diagnósticos (solo el doctor).
- `doctor` no ve cobros, reportes, configuración ni comisiones de otros doctores.
- `doctor` solo ve sus propias citas (`doctor_id = user.doctorId`).

Al agregar nuevas funciones, verificar que el rol correcto tenga acceso y que los demás no puedan acceder vía URL directa (`#screen`).

## 🦷 Reglas de Negocio Obligatorias

### Validación de colisión de citas
Al crear una cita (`createCita`), el sistema debe verificar que el doctor no tenga otra cita activa en ese mismo `fecha` + `hora`. Usar `getOcupadosDia(fecha, doctorId)` que ya existe en `db.js`. Si hay colisión, mostrar error al usuario — nunca insertar silenciosamente.

### Soft delete en registros médicos
- Nunca hacer `DELETE` directo en tablas de pacientes, historia clínica, citas, pagos o planes de tratamiento.
- Usar `estado = 'cancelada'` para citas, `estado = 'inactivo'` para pacientes.
- Si se implementa eliminación real en el futuro, debe escribir primero en una tabla `auditoria` con: `tabla`, `registro_id`, `accion`, `usuario_id`, `fecha`, `datos_anteriores`.

## 🗂️ Estructura de archivos

```
src/
  components/         # Componentes React
    reactbits/        # Componentes de ReactBits (Particles, BlurText, CountUp, Magnet)
    FichaPaciente/    # Sub-componentes de la ficha de paciente
  lib/
    db.js             # Todas las funciones de Supabase (única fuente de verdad)
    supabase.js       # Cliente Supabase
```

**Regla:** toda interacción con la base de datos va en `src/lib/db.js`. No hacer llamadas a `supabase` directamente desde componentes.

## 🛠️ Comandos

```bash
npm run dev      # Desarrollo local
npm run build    # Build de producción (ejecutar tras cada cambio para verificar)
```

Tras cada cambio significativo ejecutar `npm run build` para confirmar que no hay errores de compilación antes de hacer commit.

## 🤖 Directivas para Claude

- **Modo Plan obligatorio** antes de: cambios en autenticación, nuevas tablas/queries, cambios en lógica de roles, o cualquier función que acceda a datos de pacientes.
- No agregar `console.log` con datos de pacientes bajo ninguna circunstancia.
- Preferir editar archivos existentes sobre crear nuevos.
- No agregar comentarios que expliquen QUÉ hace el código — solo el POR QUÉ si no es obvio.
- Responder siempre en español.
