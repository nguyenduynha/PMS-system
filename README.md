# HospiCore PMS

Repository được tổ chức theo mô hình monorepo với hai ứng dụng độc lập:

```text
Hotel-Management-main/
├── backend/       # Express API, Prisma và PostgreSQL
├── frontend/      # Next.js App Router
├── package.json   # Lệnh chạy chung cho local/CI
└── .gitignore
```

## Chạy local

```bash
npm run install:all
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Build toàn bộ dự án

```bash
npm run build
```

## Deploy

### Frontend trên Vercel

Đặt **Root Directory** thành `frontend` và cấu hình:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain/api
```

Không chọn repository root làm Next.js root vì root chỉ là workspace launcher.

### Backend

Đặt service root thành `backend`:

- Build command: `npm install && npx prisma migrate deploy && npm run build`
- Start command: `npm start`
- Health check: `/api/health`

Các biến bắt buộc được cấu hình trực tiếp trên nền tảng deploy, không commit file `.env`:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
FRONTEND_URL=https://your-frontend-domain
```
