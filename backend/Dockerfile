# Se construye desde la raíz del repositorio: docker build -f backend/Dockerfile .
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --workspace backend --include-workspace-root=false
COPY backend backend
RUN npm run build --workspace backend

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --workspace backend --include-workspace-root=false --omit=dev
COPY backend/prisma backend/prisma
COPY backend/src backend/src
COPY --from=build /app/backend/dist backend/dist
RUN cd backend && npx prisma generate
WORKDIR /app/backend
EXPOSE 4000
# Aplica migraciones, crea el admin inicial (si no existe) y arranca el API.
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && node dist/index.js"]
