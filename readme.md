## Fullstack Authentication

ระบบ Authentication สมัยใหม่สำหรับเรียนรู้ Full Stack Development ด้วย React, NestJS, และ PostgreSQL

### เทคสแตค (Tech Stack)

- **Frontend:** React, TypeScript, React Router, Axios, Context API, NextUI, Tailwind CSS
- **Backend:** NestJS, TypeORM, Passport.js, JWT
- **Database:** PostgreSQL
- **Authentication:** Email/Password, Google Social Login, JWT (Access & Refresh Tokens)

### ฟีเจอร์หลัก (Features)

- **Authentication:**
  - สมัครสมาชิก / เข้าสู่ระบบด้วย Email-Password
  - เข้าสู่ระบบด้วยบัญชี Google (Social Login)
  - ระบบ JWT และ Refresh Token เพื่อรักษา session
- **Task Management:**
  - เพิ่ม, แก้ไข, ลบ, และดูรายการงาน
  - จัดการได้เฉพาะงานของตนเอง (Authorization)
- **User Profile:**
  - ดูและอัปเดตข้อมูลส่วนตัว

### สิ่งที่ควรรู้เกี่ยวกับระบบ Authentication

- รหัสผ่านของผู้ใช้จะถูก Hash ด้วย `bcrypt` ก่อนบันทึกลงฐานข้อมูลเพื่อความปลอดภัย
- ใช้กลยุทธ์จาก `Passport.js` ได้แก่ Local, JWT และ Google OAuth 2.0 สำหรับยืนยันตัวตน
- Backend สร้าง **Access Token** และ **Refresh Token** โดย Refresh Token จะถูกเก็บแบบ hash ในฐานข้อมูลเพื่อใช้สร้างคู่ใหม่เมื่อ Access Token หมดอายุ
- ฝั่ง Frontend จัดเก็บ tokens ใน `localStorage` และแนบ Access Token ไปกับทุกคำขอผ่าน Axios interceptor
- เมื่อ Access Token หมดอายุ interceptor จะใช้ Refresh Token ขอ Access Token ใหม่โดยอัตโนมัติ ทำให้ผู้ใช้ไม่ต้องล็อกอินซ้ำบ่อยๆ

### การติดตั้งและเริ่มใช้งาน (Getting Started)

#### ข้อกำหนดเบื้องต้น (Prerequisites)

- Node.js (v18+)
- npm หรือ yarn
- PostgreSQL
- Git

#### รันด้วย Docker Compose (แนะนำสำหรับ Dev)

1. **คัดลอกไฟล์ Environment:**
   ```bash
   cp .env.example .env
   ```
   ไฟล์ `.env` นี้จะถูกใช้ร่วมกันทั้ง Backend และ Frontend
2. **เริ่มระบบทั้งหมด:**
   ```bash
   docker compose up --build
   ```
   คำสั่งนี้จะสตาร์ตบริการ `postgres` (ฐานข้อมูล), `backend` (NestJS API ที่ `http://localhost:3000`) และ `frontend` (Vite app ที่ `http://localhost:5173`)

#### การตั้งค่า Backend (NestJS)

1.  **Clone a project:**
    ```bash
    # Replace with your git clone command
    git clone <repository_url>
    cd mini-task-manager
    ```
2.  **เข้าไปที่โฟลเดอร์ backend:**
    ```bash
    cd backend
    ```
3.  **ติดตั้ง dependencies:**
    ```bash
    npm install
    ```
4.  **สร้างฐานข้อมูล PostgreSQL:**

    - สร้าง database ชื่อ `mini_task_manager`

5.  **ตั้งค่า Environment Variables:**

    - จากโฟลเดอร์โปรเจกต์หลัก ให้คัดลอกไฟล์ `.env.example` เป็น `.env`
    - `cp .env.example .env`
    - แก้ไขค่าในไฟล์ `.env` ให้ถูกต้อง (ข้อมูลเชื่อมต่อ DB, JWT secrets, Google OAuth credentials)

6.  **รัน Backend server:**
    ```bash
    npm run start:dev
    ```
    เซิร์ฟเวอร์จะรันที่ `http://localhost:3000`

#### การตั้งค่า Frontend (React)

1.  **เข้าไปที่โฟลเดอร์ frontend:**
    ```bash
    cd ../frontend
    ```
2.  **ติดตั้ง dependencies:**
    ```bash
    npm install
    ```
3.  **ตั้งค่า Environment Variables:**

    - Frontend จะโหลดค่า environment จากไฟล์ `.env` ที่โฟลเดอร์โปรเจกต์หลักโดยอัตโนมัติ (เช่น `VITE_API_URL=http://localhost:3000/api/v1`)

4.  **รัน Frontend development server:**
    ```bash
    npm run dev
    ```
    แอปพลิเคชันจะเปิดที่ `http://localhost:5173`

### โฟลว์การยืนยันตัวตน (Authentication Flow)

1.  **Email/Password:** ผู้ใช้กรอกข้อมูล -> Frontend ส่งไปที่ Backend -> Backend ตรวจสอบและสร้าง Access/Refresh Token -> Frontend จัดเก็บ Token และนำทางผู้ใช้
2.  **Google Login:** ผู้ใช้คลิกปุ่ม -> Frontend redirect ไปยัง Backend (`/api/auth/google`) -> Backend redirect ไปยัง Google -> ผู้ใช้ยืนยันตัวตนกับ Google -> Google redirect กลับมาที่ Backend (`/api/auth/google/callback`) -> Backend สร้าง/ค้นหาผู้ใช้ และสร้าง Tokens -> Backend redirect กลับมาที่ Frontend พร้อม Tokens ใน query string -> Frontend จัดเก็บ Token และนำทางผู้ใช้
3.  **Token Refresh:** เมื่อ Access Token หมดอายุ, Axios interceptor จะส่ง Refresh Token ไปยัง Backend เพื่อขอ Access Token ใหม่โดยอัตโนมัติ ทำให้ผู้ใช้ไม่ต้องล็อกอินใหม่บ่อยๆ

### การทดสอบ (Testing)

- **Backend:**
  ```bash
  cd backend
  npm test
  ```
- **Frontend:**
  ```bash
  cd frontend
  npm test
  ```
  การทดสอบใช้ Jest และ Vitest เพื่อครอบคลุมฟังก์ชัน authentication หลักทั้งสองฝั่ง

### Database Migrations & Seed

จากภายในโฟลเดอร์ `backend` สามารถรัน migration และ seed ได้ดังนี้

```bash
npm run migration:run
npm run seed
```

### API Documentation

หากติดตั้งโมดูล `@nestjs/swagger` แล้ว เอกสาร API จะพร้อมใช้งานที่ `/api/docs` เมื่อรันเซิร์ฟเวอร์

### Deployment

คำแนะนำแบบละเอียดสำหรับการ deploy มีอยู่ในไฟล์ `DEPLOYMENT.md`
