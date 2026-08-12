# Barber 💈

Sistema de gestión de citas para barberías. Múltiples profesionales, duración de servicio variable, concurrencia resuelta a nivel de base de datos, sin pagos en línea.

---

## Arquitectura general

```
barberia/                  ← Raíz del repositorio (monorepo)
│
├── 📁 frontend/           ← App Next.js (lo que el usuario ve en el navegador)
│   ├── src/app/           → Páginas, Server Actions, rutas de Next.js
│   └── src/components/    → Componentes reutilizables (BookingFlow, Header, etc.)
│
├── 📁 src/                ← API backend Node.js / Express
│   ├── controllers/       → Lógica de cada endpoint
│   ├── models/            → Queries SQL a la base de datos
│   ├── routes/            → Definición de rutas y sus middlewares
│   ├── middleware/        → JWT, roles, manejo de errores
│   ├── utils/             → Algoritmo de disponibilidad, correo
│   ├── app.js             → Setup de Express
│   └── db.js              → Pool de conexiones MySQL
│
├── 📁 migrations/         ← Esquema SQL de la base de datos
├── 📁 seeds/              ← Datos de prueba (admin, profesionales, servicios)
├── 📁 scripts/            ← Script de migración y seed
├── 📁 tests/              ← Tests de integración con Jest + Supertest
│
├── 📁 .github/workflows/  ← Pipeline CI/CD (lint → tests → build → push a GHCR)
├── server.js              ← Punto de entrada del backend
├── Dockerfile             ← Imagen Docker del backend
└── docker-compose.yml     ← Orquesta MySQL + API + Adminer para desarrollo
```

**Flujo de datos:**
```
Navegador → Next.js (:3002) → API Express (:3001) → MySQL (:3306)
```

El frontend **no tiene lógica de negocio**: toda la validación de disponibilidad, concurrencia y reglas de cancelación vive en el backend.

---

## Cómo levantarlo en local (desde cero cada día)

### Primera vez (solo una vez)

```bash
# Instalar dependencias del backend
npm install

# Instalar dependencias del frontend
cd frontend && npm install && cd ..

# Levantar la DB y correr migraciones + datos de prueba
docker compose up db -d
npm run seed
```

### Días siguientes (rutina diaria)

Abre **3 terminales** en este orden:

```bash
# Terminal 1 — Base de datos (desde /barberia)
docker compose up db -d

# Terminal 2 — Backend (desde /barberia)
npm run dev
# → API en http://localhost:3001

# Terminal 3 — Frontend (desde /barberia/frontend)
npm run dev
# → App en http://localhost:3002
```

> **¿Para qué sirve cada uno?**
> - `docker compose up db -d`: levanta MySQL en segundo plano (el `-d` evita que ocupe la terminal)
> - `npm run dev` (backend): inicia la API Express con recarga automática al editar código
> - `npm run dev` (frontend): inicia Next.js con hot-reload

### Levantar TODO con Docker (sin editar código)

Si solo quieres probarlo sin tocar nada:
```bash
docker compose up --build
```
Levanta: API en `:3000`, MySQL en `:3306`, Adminer (UI de base de datos) en `:8080`.

---

## Variables de entorno

```bash
cp .env.example .env
# Edita .env con tus valores
```

| Variable | Descripción | Valor dev |
|---|---|---|
| `PORT` | Puerto del backend | `3001` |
| `DB_HOST` | Host de MySQL | `127.0.0.1` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_USER` | Usuario | `barber` |
| `DB_PASSWORD` | Contraseña | `barber_secret` |
| `DB_NAME` | Base de datos | `barber` |
| `JWT_SECRET` | Secreto access token | (cadena larga y aleatoria) |
| `JWT_REFRESH_SECRET` | Secreto refresh token | (otra cadena diferente) |

---

## Cómo desplegarlo a internet

### Frontend → Vercel (gratis)

1. Ve a [vercel.com](https://vercel.com) e importa tu repo de GitHub
2. En la configuración del proyecto:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js (se detecta automático)
3. Agrega en Vercel → Settings → Environment Variables:
   - `API_URL` = URL pública de tu backend (ej. `https://tu-api.railway.app`)
4. Deploy → queda en `https://tu-proyecto.vercel.app`

### Backend + DB → Railway (gratis, plan Hobby)

1. Ve a [railway.app](https://railway.app) e importa el mismo repo
2. Railway detecta el `Dockerfile` automáticamente y construye la imagen
3. Añade un plugin de **MySQL** en el mismo proyecto → Railway te da las credenciales
4. Agrega las variables de entorno (mismas que `.env` pero con los valores de Railway)
5. Railway te da una URL pública para la API → úsala en `API_URL` de Vercel

### Alternativa: Backend → Render + DB → PlanetScale

- Backend: [render.com](https://render.com) → Web Service → Docker
- DB: [planetscale.com](https://planetscale.com) → plan gratuito de MySQL compatible

---

## Tests

```bash
# Unitarios (no requieren DB)
npx jest tests/disponibilidad.test.js --verbose

# Todos los tests (requieren MySQL corriendo)
npm test
```

**21 tests en total:**
- Algoritmo de disponibilidad: 8 casos (día vacío, bloqueo total, traslapes, etc.)
- Auth: 6 casos (registro, login, tokens, protección por rol)
- Citas: 7 casos (agendar, conflicto 409, fuera de jornada, concurrencia paralela)

---

## Por qué es técnicamente interesante

**Algoritmo de disponibilidad** (`src/utils/disponibilidad.js`): dado un profesional y un día, calcula qué horarios están libres fusionando intervalos de citas y bloqueos que se traslapan, encontrando huecos y generando slots válidos según la duración del servicio.

**Concurrencia al agendar** (`src/controllers/citas.js`): si dos clientes ven el mismo slot y mandan la petición simultánea, solo uno gana. Se resuelve bloqueando la fila del profesional con `SELECT ... FOR UPDATE` al inicio de la transacción, serializando los intentos sin deadlocks.

---

## Endpoints principales

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/auth/registro` | Público | Crear cuenta |
| POST | `/auth/login` | Público | Login, obtiene JWT |
| GET | `/profesionales` | Público | Lista de profesionales |
| GET | `/servicios` | Público | Lista de servicios |
| GET | `/disponibilidad` | Público | Slots libres de un prof |
| POST | `/citas` | Cliente | Agendar cita |
| GET | `/citas/mias` | Cliente | Ver mis citas |
| PATCH | `/citas/:id/cancelar` | Cliente | Cancelar cita |
| GET | `/empleado/agenda` | Empleado | Ver agenda del día |
| POST | `/bloqueos` | Empleado | Bloquear horario |
| GET | `/admin/agenda` | Admin | Ver toda la agenda |
| POST | `/admin/servicios` | Admin | Crear servicio |

---

## Pipeline CI/CD

En cada `git push` a `main`, GitHub Actions ejecuta automáticamente:

```
lint-test ──────────┐
                    ├──→ build ──→ push (imagen Docker a ghcr.io)
frontend-lint-build ┘
```

1. **lint-test**: ESLint del backend + 21 tests contra MySQL real
2. **frontend-lint-build**: ESLint de React + compilación completa de Next.js
3. **build**: construye la imagen Docker del backend
4. **push**: sube la imagen a GitHub Container Registry (solo en `main`)


## Qué resuelve y por qué lo construí

Quería un proyecto que tuviera un problema técnico real, no solo CRUD. La parte interesante está en dos cosas:

1. **El algoritmo de disponibilidad** — dado un profesional y un día, calcular qué horarios están libres considerando sus citas activas, bloqueos de horario (comida, día libre) y la duración del servicio que el cliente quiere agendar. Hay que fusionar intervalos que se traslapan, calcular huecos y generar slots de inicio válidos dentro de cada hueco.

2. **El problema de concurrencia al agendar** — si dos clientes ven el mismo slot libre y mandan la petición al mismo tiempo, solo uno debería ganar. Esto lo resolví con una transacción MySQL que hace `SELECT ... FOR UPDATE` sobre las citas del profesional en el rango de tiempo solicitado. El `FOR UPDATE` bloquea esas filas hasta que la transacción termine, así que el segundo request espera y al verificar encuentra el conflicto.

## Stack

- Node.js + Express
- MySQL 8 con `mysql2` (queries preparadas, sin ORM)
- JWT para autenticación (access token + refresh token)
- Docker + Docker Compose
- Jest + Supertest para tests
- Nodemailer con Ethereal para notificaciones simuladas

## Cómo levantar

### Con Docker (recomendado)

```bash
docker-compose up --build
```

Esto levanta la API en `localhost:3000`, MySQL en `localhost:3306` y Adminer en `localhost:8080`.

Después, corre las migraciones y seed:

```bash
docker compose exec api node scripts/migrate.js --seed
```

### Sin Docker

Necesitas MySQL 8 corriendo localmente.

```bash
# Configurar y levantar el Backend (Puerto 3001)
cp .env.example .env
# Edita .env con tus credenciales de MySQL (cambiar PORT a 3001 para evitar conflictos)
npm install
npm run seed    # Crea tablas e inserta datos de prueba
npm run dev     # Levanta el backend

# Configurar y levantar el Frontend (Puerto 3000)
cd frontend
npm install
npm run dev     # Levanta el frontend en http://localhost:3000
```

## Endpoints principales

**Públicos:** registro, login, lista de profesionales, lista de servicios, consulta de disponibilidad.

**Cliente (requiere JWT):** agendar cita, ver mis citas, cancelar cita.

**Empleado:** ver mi agenda del día, crear/eliminar bloqueos de horario.

**Admin:** ver agenda general de todos los profesionales, crear servicios, crear perfiles de profesional.

La documentación completa de cada endpoint está en los archivos de rutas en `src/routes/`.

## Tests

```bash
# Tests unitarios del algoritmo de disponibilidad (no requieren DB)
npx jest tests/disponibilidad.test.js

# Tests de integración (requieren MySQL corriendo)
npm test
```

Los tests del algoritmo cubren: día vacío, cita a media mañana, bloqueo total, citas pegadas, servicio que no cabe en un hueco, traslape de bloqueo con cita, y múltiples huecos.

Los tests de citas incluyen un caso de concurrencia donde dos requests se mandan en paralelo al mismo slot — verifica que exactamente uno recibe 201 y el otro 409.

## Política de cancelación

Se puede cancelar una cita con al menos 4 horas de anticipación (configurable con `CANCEL_HOURS_THRESHOLD`). Si cancelas con menos tiempo, la cita queda marcada como `cancelacion_tardia` en vez de `cancelada`.

## Estructura del proyecto

```
src/
  routes/       # Definición de rutas y middleware por grupo
  controllers/  # Lógica de cada endpoint
  models/       # Queries a la base de datos
  middleware/    # JWT, roles, manejo de errores
  utils/        # Algoritmo de disponibilidad, email
  db.js         # Pool de conexiones MySQL
  app.js        # Express setup
```
# barberia
    