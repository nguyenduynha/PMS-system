# HospiCore PMS - Hệ thống quản lý khách sạn

HospiCore PMS là hệ thống quản lý vận hành khách sạn được xây dựng theo mô hình monorepo. Dự án gồm dashboard quản trị bằng Next.js, REST API bằng Express và cơ sở dữ liệu PostgreSQL thông qua Prisma ORM.

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt nhanh](#cài-đặt-nhanh)
- [Biến môi trường](#biến-môi-trường)
- [Cơ sở dữ liệu](#cơ-sở-dữ-liệu)
- [API, xác thực và phân quyền](#api-xác-thực-và-phân-quyền)
- [Các lệnh thường dùng](#các-lệnh-thường-dùng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Tài khoản demo](#tài-khoản-demo)
- [Triển khai production](#triển-khai-production)

## Tính năng chính

### Tổng quan vận hành

- Dashboard hiển thị số liệu và tình hình hoạt động của khách sạn.
- Theo dõi trạng thái phòng trực quan theo tầng và loại phòng.
- Quản lý thông tin khách sạn và các thiết lập vận hành.

### Phòng và đặt phòng

- Quản lý phòng, loại phòng, sức chứa, tiện nghi và trạng thái phòng.
- Hỗ trợ hình thức thuê theo giờ, theo ngày và qua đêm.
- Thiết lập bảng giá ngày thường, cuối tuần và ngày lễ.
- Tạo và quản lý đặt phòng, khách lưu trú, thời gian nhận/trả phòng thực tế.
- Theo dõi dịch vụ phát sinh và lịch sử trạng thái của booking.

### Khách hàng và hóa đơn

- Quản lý hồ sơ khách hàng, thông tin liên hệ và giấy tờ tùy thân.
- Tạo hóa đơn từ booking, áp dụng thuế và giảm giá.
- Ghi nhận thanh toán theo nhiều phương thức.
- Xuất dữ liệu phục vụ báo cáo và nghiệp vụ kế toán.

### Vận hành nội bộ

- Quản lý dịch vụ khách sạn.
- Quản lý kho, nhập/xuất vật tư, tồn tối thiểu và nhà cung cấp.
- Theo dõi bảo trì phòng, nhân viên phụ trách và chi phí sửa chữa.
- Quản lý giao dịch thu/chi và báo cáo tài chính.
- Quản lý người dùng, vai trò và quyền truy cập theo từng chức năng.

## Công nghệ sử dụng

### Frontend

- Next.js 16 App Router
- React 19 và TypeScript
- Tailwind CSS 4
- Radix UI và Lucide React
- React Hook Form và Zod
- Recharts, pdfmake và xlsx

### Backend

- Node.js và Express 4
- TypeScript
- Prisma ORM 6
- PostgreSQL
- JSON Web Token và bcrypt
- Swagger/OpenAPI

## Yêu cầu hệ thống

- Node.js 20 LTS hoặc mới hơn
- npm
- PostgreSQL đang hoạt động và có database dành cho dự án

## Cài đặt nhanh

### 1. Cài dependencies

```bash
npm install
npm run install:all
```

### 2. Cấu hình backend

Tạo file `backend/.env` và khai báo các biến trong phần [Biến môi trường](#biến-môi-trường).

### 3. Khởi tạo database

```bash
cd backend
npx prisma migrate deploy
npm run seed
cd ..
```

### 4. Chạy toàn bộ dự án

```bash
npm run dev
```

Sau khi khởi động:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`
- OpenAPI JSON: `http://localhost:5000/api-docs-json`

## Biến môi trường

### Backend

Tạo `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5000
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

`DIRECT_URL` có thể trùng `DATABASE_URL` khi dùng PostgreSQL thông thường. Với dịch vụ có connection pooler, đặt `DATABASE_URL` là URL pooled và `DIRECT_URL` là kết nối trực tiếp dùng cho migration.

### Frontend

Có thể tạo `frontend/.env.local` để ghi đè giá trị mặc định:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:5000/api"
NEXT_PUBLIC_LANDING_PAGE_URL="https://your-landing-page.example.com"
```

Không commit `.env`, `.env.local` hoặc thông tin đăng nhập database lên GitHub.

## Cơ sở dữ liệu

Schema chính nằm tại `backend/prisma/schema.prisma`. Dự án sử dụng PostgreSQL với các nhóm dữ liệu chính:

- Người dùng, chức vụ, vai trò và quyền hạn
- Phòng, loại phòng và bảng giá
- Booking, khách hàng và dịch vụ đi kèm
- Hóa đơn và thanh toán
- Kho và giao dịch nhập/xuất
- Bảo trì phòng
- Giao dịch tài chính
- Ngày lễ và thông tin khách sạn

Các lệnh database thường dùng:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
npm run seed
```

`npm run seed` tạo dữ liệu loại phòng, phòng mẫu, ngày lễ và tài khoản super admin. Backend cũng tự tạo một số dữ liệu development khi database trống; production không tự động seed.

## API, xác thực và phân quyền

REST API được đặt dưới tiền tố `/api` với các nhóm endpoint:

| Nhóm | Endpoint |
| --- | --- |
| Người dùng | `/api/users` |
| Phòng | `/api/rooms` |
| Đặt phòng | `/api/bookings` |
| Khách hàng | `/api/customers` |
| Dịch vụ | `/api/services` |
| Hóa đơn | `/api/invoices` |
| Kho | `/api/inventory` |
| Bảo trì | `/api/maintenance` |
| Tài chính | `/api/finance` |
| Dashboard | `/api/dashboard` |
| Vai trò và quyền | `/api/roles` |
| Thông tin khách sạn | `/api/hotel-profile` |

- Người dùng đăng nhập bằng mã nhân viên và mật khẩu; backend cấp JWT.
- Các route được bảo vệ nhận token qua header `Authorization: Bearer <token>`.
- Hệ thống hỗ trợ vai trò, quyền chi tiết theo module và tài khoản `SUPERADMIN`.
- CORS chỉ cho phép frontend local, domain production đã cấu hình và `FRONTEND_URL`.
- Dự án hiện chưa tích hợp Redis hoặc rate limit. Khi public API ra Internet, nên bổ sung rate limit và lớp bảo vệ tại reverse proxy/CDN.

## Các lệnh thường dùng

Chạy tại thư mục gốc:

| Lệnh | Công dụng |
| --- | --- |
| `npm run install:all` | Cài dependencies cho backend và frontend |
| `npm run dev` | Chạy đồng thời backend và frontend |
| `npm run build` | Build toàn bộ dự án |
| `npm run build:backend` | Chỉ build backend |
| `npm run build:frontend` | Chỉ build frontend |
| `npm run start:backend` | Chạy backend đã build |
| `npm run start:frontend` | Chạy frontend production |

Chạy trong `backend`:

| Lệnh | Công dụng |
| --- | --- |
| `npm run dev` | Chạy API ở chế độ watch |
| `npm run build` | Generate Prisma Client và biên dịch TypeScript |
| `npm start` | Chạy API từ thư mục `dist` |
| `npm run seed` | Seed dữ liệu mẫu và tài khoản demo |
| `npm run seed:rooms` | Seed dữ liệu phòng |
| `npm run seed:permissions` | Seed quyền và vai trò hệ thống |

Chạy trong `frontend`:

| Lệnh | Công dụng |
| --- | --- |
| `npm run dev` | Chạy Next.js development server |
| `npm run build` | Build frontend production |
| `npm start` | Chạy frontend đã build |
| `npm run lint` | Kiểm tra mã nguồn bằng ESLint |

## Cấu trúc thư mục

```text
.
├── backend/
│   ├── config/          # Prisma và cấu hình quyền
│   ├── controllers/     # Xử lý request/response
│   ├── middleware/      # Xác thực và phân quyền
│   ├── prisma/          # Schema, migration và seed
│   ├── routes/          # REST API routes
│   ├── services/        # Nghiệp vụ và truy cập dữ liệu
│   ├── app.ts           # Cấu hình Express
│   └── server.ts        # Kết nối database và khởi động API
├── frontend/
│   ├── app/             # Trang và layout Next.js
│   ├── components/      # Component nghiệp vụ và UI
│   ├── contexts/        # Auth context
│   ├── hooks/           # React hooks dùng chung
│   ├── lib/             # Kiểu dữ liệu, quyền và cấu hình
│   ├── public/          # Tài nguyên tĩnh
│   └── services/        # Client gọi REST API
├── LANDING_INTEGRATION.md
├── package.json         # Scripts điều phối monorepo
└── README.md
```

## Tài khoản demo

Sau khi chạy `npm run seed` trong thư mục `backend`, đăng nhập bằng:

```text
Tên đăng nhập: superadmin
Email: superadmin@gmail.com
Mật khẩu: 123
Vai trò: SUPERADMIN
```

Tài khoản này chỉ dành cho local/demo. Hãy đổi mật khẩu ngay và không seed thông tin đăng nhập mặc định trên production.

## Triển khai production

### Frontend trên Vercel

- Chọn `frontend` làm **Root Directory**.
- Build command: `npm run build`.
- Cấu hình `NEXT_PUBLIC_API_BASE_URL` trỏ tới URL backend và có hậu tố `/api`.
- Cấu hình `NEXT_PUBLIC_LANDING_PAGE_URL` nếu sử dụng landing page riêng.

### Backend

- Chọn `backend` làm service root.
- Build command: `npm install && npx prisma migrate deploy && npm run build`.
- Start command: `npm start`.
- Health check: `/api/health`.
- Cấu hình `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `FRONTEND_URL` và `NODE_ENV=production` trên nền tảng deploy.

### Checklist trước khi public

- Dùng chuỗi `JWT_SECRET` dài, ngẫu nhiên và không dùng lại giữa các môi trường.
- Không sử dụng tài khoản/mật khẩu demo trên production.
- Chạy migration trước khi khởi động phiên bản mới.
- Chỉ cho phép đúng frontend production qua CORS.
- Bật HTTPS, rate limit, logging, backup database và lớp bảo vệ CDN/WAF.
- Chạy `npm run build` và kiểm tra `/api/health` trước khi phát hành.
