# Template Fullstack: React + NestJS + PostgreSQL (Docker Ready)

โครงสร้างโปรเจกต์นี้รวม **Frontend** (React + Vite), **Backend** (NestJS + TypeORM) และ **Database** (PostgreSQL) พร้อมใช้งานด้วย Docker Compose

## โครงสร้างไฟล์

```
template-fullstack-react-nest-postgresql/
├─] .env (ignored)
├── .env.example
├── .gitignore
├── backend/
│   ├── .dockerignore
│   ├── .gitignore
│   ├── .prettierrc
│   ├─] dist/ (ignored)
│   ├── Dockerfile
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├─] node_modules/ (ignored)
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── src/
│   │   ├── app.controller.spec.ts
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   ├── tsconfig.build.json
│   └── tsconfig.json
├── docker-compose.yml
├── frontend/
│   ├── .dockerignore
│   ├── .gitignore
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├─] node_modules/ (ignored)
│   ├── package-lock.json
│   ├── package.json
│   ├── public/
│   │   └── vite.svg
│   ├── README.md
│   ├── src/
│   │   ├── App.tsx
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
└── readme.md
```

## 1. เตรียม `.env`

คัดลอกไฟล์ `.env.example` ไปเป็น `.env` และแก้ไขค่าตามต้องการ

### ตัวอย่าง .env:

```
# Environment variables for PostgreSQL configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=mydatabase

# Environment variables for application settings
PORT=3000

# Environment variables for JWT configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1h

# CORS Environment Variables
FRONTEND_URL=http://localhost:5173

# Frontend Environment Variables
VITE_API_URL=http://localhost:3000/api/v1
```

`หมายเหตุ: POSTGRES_HOST ต้องเป็นชื่อ service ของ postgres ใน docker-compose (postgres)`

## 2. รันด้วย Docker Compose

```
docker compose up --build
```

Docker จะรัน 3 services:

- frontend_app → React (Vite) ที่ http://localhost:5173

- backend_api → NestJS API ที่ http://localhost:3000

- postgres → PostgreSQL Database (port 5432)

## 3. คำสั่งที่ใช้บ่อย

```
# สร้าง image
docker compose build --no-cache

# สร้างและรัน container
docker compose up --build

# รันแบบ background
docker compose up -d

# หยุด service
docker compose down

# ลบ volume (เช่น ลบข้อมูล database)
docker compose down -v
```
