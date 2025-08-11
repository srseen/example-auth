# Deployment Guide

## Development

1. Copy environment file:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```
2. Start services with Docker:
   ```bash
   docker compose up --build
   ```
   This runs PostgreSQL, the NestJS backend on port 3000 and the React frontend on port 5173.

## Production

1. Set environment variables appropriately on your host or copy the `.env` files as shown above and adjust values for production.
2. Build frontend assets:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. Run database migrations and optional seed data:
   ```bash
   cd ../backend
   npm install
   npm run migration:run
   npm run seed # optional
   ```
4. Start the backend in production mode:
   ```bash
   npm run start:prod
   ```
   The compiled frontend in `frontend/dist` will be served by NestJS.
