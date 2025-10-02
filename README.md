# WhatsApp Message Analytics Dashboard

A full-stack mini conversational CRM for sending bulk WhatsApp messages (mocked), tracking delivery/read/replies in real-time, and visualizing engagement analytics.

## Tech Stack
- Frontend: React 18 + TypeScript, MUI, Zustand, React Query, Socket.io Client, Recharts/Chart.js, React Hook Form, React Router, Firebase Auth, Cypress
- Backend: NestJS + TypeScript, PostgreSQL + Prisma, Redis + BullMQ, Socket.io, JWT, RBAC, Swagger, optional Elasticsearch
- Infra: Docker, docker-compose

## Quickstart

1. Create env files from examples and edit values
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
2. Start services
   - `docker compose up --build`
3. Open frontend at http://localhost:5173 and backend at http://localhost:3000

## Monorepo Structure

```
whatsapp-analytics-dashboard/
  frontend/
  backend/
  docker-compose.yml
  README.md
```

## Development
- Backend runs with hot-reload via `start:dev`
- Frontend runs Vite dev server on `5173`

## Scripts
Use `npm` within each package (frontend, backend).

## License
MIT
