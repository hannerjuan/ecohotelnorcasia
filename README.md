# EcoHotel Madeguadua · Norcasia

Sitio web y panel de administración del EcoHotel Madeguadua (Norcasia, Caldas), con **backend y base de datos propios** (sin Firebase).

## Tecnologías

| Parte | Tecnología |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, React Router, Leaflet (mapa), react-datepicker |
| Backend | Node.js 22, Express 5, TypeScript, Zod (validación), JWT en cookie httpOnly, Multer (imágenes) |
| Base de datos | PostgreSQL 16 con Prisma (migraciones y seed) |
| Tiempo real | Server-Sent Events para avisar al panel de nuevas reservas |
| Despliegue | Docker Compose (PostgreSQL + API + Nginx) |
| Pruebas | Vitest + Supertest contra PostgreSQL, CI en GitHub Actions |

## Funcionalidades

**Sitio público**
- Inicio con carrusel de portada (fotos editables desde el panel), sección del hotel, cabañas destacadas, gastronomía, testimonios, actividades y mapa con la ubicación del hotel y de cada cabaña.
- Listado y detalle de cabañas: galería con visor, comodidades, calificación promedio.
- Reservas: calendario que bloquea fechas ocupadas, fechas recomendadas, validación de disponibilidad en vivo, total estimado, aceptación de la Ley 1581 de 2012. La solicitud queda guardada como *pendiente* y abre WhatsApp con el mensaje listo.
- Reseñas por cabaña.
- Actividades con galería, menú del restaurante, política de privacidad y reglas de convivencia y cancelación.
- Botón flotante de WhatsApp con el número configurado en el panel.

**Panel de administración** (`/admin`)
- Reservas: lista y calendario mensual, filtros por cabaña, estado, fechas y búsqueda, detalle con costo total, confirmar/cancelar/volver a pendiente, eliminar, exportar a CSV y aviso en vivo (y notificación del navegador) cuando llega una solicitud.
- El servidor impide confirmar dos reservas que se crucen en la misma cabaña.
- CRUD de cabañas (con coordenadas para el mapa), actividades y menú, con subida de imágenes al servidor.
- Moderación de reseñas y selección de las que aparecen como testimonios en el inicio.
- Configuración del hotel (nombre, WhatsApp, correo, dirección, ubicación, fotos de portada), gestión de administradores y cambio de contraseña.

## Desarrollo local

Requisitos: Node.js 22 y PostgreSQL 16 (o `docker compose up db`).

```bash
npm install
cp backend/.env.example backend/.env     # en Windows: copy backend\.env.example backend\.env
cd backend
npx prisma migrate dev                    # crea las tablas
npm run db:seed                           # admin inicial + contenido de ejemplo
cd ..
npm run dev                               # API en :4000 y web en http://localhost:5173
```

Entra al panel en `http://localhost:5173/ingresar` con `ADMIN_EMAIL` / `ADMIN_PASSWORD` del archivo `.env`.

### Pruebas

```bash
createdb ecohotel_test                    # base de datos solo para pruebas
npm test                                  # o TEST_DATABASE_URL=... npm test
```

## Producción con Docker

Linux / macOS:

```bash
cp .env.example .env                      # cambia ADMIN_PASSWORD y JWT_SECRET
docker compose up -d --build
```

Windows (cmd):

```bat
copy .env.example .env
notepad .env
docker compose up -d --build
```

En el Bloc de notas cambia `ADMIN_PASSWORD` (clave del panel) y `JWT_SECRET` (cualquier texto largo) antes de guardar. Si el archivo queda como `.env.txt`, renómbralo con `ren .env.txt .env`. En PowerShell usa `Copy-Item .env.example .env`.

El sitio queda en `http://localhost:8080` (puerto `WEB_PORT`). Al arrancar, el API aplica las migraciones y crea el administrador inicial si no existe. Los datos de PostgreSQL y las imágenes subidas se guardan en volúmenes de Docker (`db-data` y `uploads`). Detrás de HTTPS, pon `COOKIE_SECURE=true`.

## Estructura

```
backend/
  prisma/schema.prisma      modelo de datos
  prisma/seed.ts            admin inicial y contenido de ejemplo
  src/routes/               endpoints del API
  src/lib/availability.ts   reglas de disponibilidad
  tests/                    pruebas del API
frontend/
  src/pages/                páginas públicas
  src/pages/admin/          panel de administración
  src/components/           componentes compartidos
```

## API principal

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/login`, `/api/auth/logout` · GET `/api/auth/me` | Público |
| GET | `/api/cabins`, `/api/cabins/:id`, `/api/cabins/:id/availability`, `/api/cabins/:id/reviews` | Público |
| POST | `/api/cabins/:id/reviews`, `/api/reservations` | Público (con límite de envíos) |
| GET | `/api/activities`, `/api/menu`, `/api/settings`, `/api/reviews/featured` | Público |
| POST/PUT/DELETE | `/api/cabins`, `/api/activities`, `/api/menu` | Admin |
| GET/PATCH/DELETE | `/api/reservations`, `/api/reservations/:id/status`, `/api/reservations/export.csv` | Admin |
| GET/PATCH/DELETE | `/api/reviews` | Admin |
| PUT | `/api/settings` · POST `/api/uploads` · `/api/users` | Admin |
| GET | `/api/admin/events` (tiempo real) | Admin |

## Pendiente para el hotel

- Reemplazar las fotos de ejemplo (Unsplash) por fotos propias desde el panel.
- Confirmar el número oficial de WhatsApp en *Configuración* (por defecto `573044527620`, tomado del sitio anterior).
- Revisar los textos de privacidad y de reglas/cancelación, que son una base general.
- Ubicar cada cabaña en el mapa con sus coordenadas reales.
