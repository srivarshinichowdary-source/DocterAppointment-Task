# Deployment Guide

This project deploys as two services:

- Backend: Spring Boot API
- Frontend: Vite React static site

## Backend on Render

Create a Render Web Service from this GitHub repo.

- Root directory: `DocterAppointment-backend`
- Runtime: Docker
- Dockerfile path: `Dockerfile`

Add these environment variables in Render:

```text
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:mysql://<host>:<port>/<database>?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
DATABASE_USERNAME=<database-user>
DATABASE_PASSWORD=<database-password>
JWT_SECRET=<long-base64-secret>
CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>
JPA_DDL_AUTO=update
```

Render provides `PORT` automatically for web services.

## Frontend on Vercel

Create a Vercel project from the same GitHub repo.

- Framework preset: Vite
- Root directory: `DocterAppointment-frontend`
- Build command: `npm run build`
- Output directory: `dist`

Add this environment variable in Vercel:

```text
VITE_API_BASE_URL=https://<your-render-backend-domain>
```

After the frontend is deployed, copy its Vercel URL and update the backend `CORS_ALLOWED_ORIGINS` value on Render.

## Local Development

Backend:

```powershell
cd DocterAppointment-backend
.\mvnw.cmd spring-boot:run
```

Frontend:

```powershell
cd DocterAppointment-frontend
npm run dev
```
