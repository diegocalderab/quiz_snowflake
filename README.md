# SnowPro Core Study App

Angular + Node.js/Express + PostgreSQL (Neon). Sin IA — respuestas y explicaciones vienen del Excel.

## Stack
- **Frontend**: Angular 17 → Vercel
- **Backend**: Node.js + Express → Render  
- **DB**: PostgreSQL → Neon

---

## 1. Neon (Base de datos)
1. Crear cuenta en [neon.tech](https://neon.tech)
2. Nuevo proyecto → copiar **Connection String** (`postgresql://user:pass@host/db?sslmode=require`)

---

## 2. Backend → Render

### Variables de entorno
```
DATABASE_URL=postgresql://...
JWT_SECRET=una-clave-secreta-larga
FRONTEND_URL=https://tu-app.vercel.app
NODE_ENV=production
```

### Deploy
1. Subir `/backend` a GitHub
2. Render → New Web Service → conectar repo
3. Build: `npm install` · Start: `npm start`
4. Añadir las 3 variables de entorno

### Seed (una sola vez desde Render Shell)
```bash
npm run seed
```
Crea tablas e inserta las **1352 preguntas** con respuestas y explicaciones.

---

## 3. Frontend → Vercel

Editar `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://TU-NOMBRE.onrender.com/api'
};
```

Deploy:
1. Subir `/frontend` a GitHub
2. Vercel → New Project → Angular
3. Output dir: `dist/snowflake-study-frontend/browser`

---

## Local

```bash
# Backend
cd backend && cp .env.example .env  # rellenar DATABASE_URL y JWT_SECRET
npm install && npm run seed && npm run dev

# Frontend
cd frontend && npm install && npm start
```

---

## API
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/register | Registro |
| POST | /api/auth/login | Login |
| GET | /api/questions/session?mode=due | Preguntas (due/random/weak/exam/area) |
| GET | /api/questions/areas | Stats por área |
| PATCH | /api/progress/:id | Registrar respuesta |
| POST | /api/progress/session | Guardar sesión |
| DELETE | /api/progress | Resetear progreso |
| GET | /api/stats | Estadísticas globales |
