# FreshCut

API para gestión de citas en barberías. Múltiples profesionales, duración de servicio variable, sin pagos en línea.

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
