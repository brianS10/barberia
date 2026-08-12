# Barber 💈

Gestor sencillo de citas para barberías. Permite manejar múltiples barberos, servicios con distinta duración y previene colisiones de reservas. Sin pagos en línea.

## Inicio rápido

```bash
# Instalar dependencias del backend
npm install

# Instalar dependencias del frontend
cd frontend && npm install && cd ..

# Levantar base de datos local
docker compose up db -d

# Llenar base de datos inicial
npm run seed

# Iniciar backend (http://localhost:3001)
npm run dev

# Iniciar frontend (http://localhost:3002)
cd frontend && npm run dev
```

## Docker (Levantar todo junto)

```bash
docker compose up --build
```
Levanta: API en el puerto 3000, MySQL en el 3306 y Adminer en el 8080.


## Despliegue

- **Frontend**: Vercel (configura la variable `API_URL` apuntando a la del backend).
- **Backend**: Railway (detecta automáticamente el `Dockerfile`, añade base de datos MySQL y configura las variables de entorno).

## Endpoints principales de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST   | /auth/registro | Crear cuenta |
| POST   | /auth/login    | Iniciar sesión (obtiene JWT) |
| GET    | /profesionales | Listado de barberos |
| GET    | /servicios     | Listado de servicios |
| GET    | /disponibilidad | Horarios disponibles |
| POST   | /citas         | Reservar cita |
| PATCH  | /citas/:id/cancelar | Cancelar cita (mínimo 4 horas antes) |

## Tests

```bash
# Pruebas integrales (requieren MySQL corriendo)
npm test

# Prueba del algoritmo de disponibilidad
npx jest tests/disponibilidad.test.js
```

Licencia MIT 
