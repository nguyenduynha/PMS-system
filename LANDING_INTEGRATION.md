# Kết nối Landing Page với HospiCore PMS

## 1. Cấu hình PMS frontend

Khai báo các biến môi trường trên Vercel của dự án PMS:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_LANDING_PAGE_URL=https://landing-page-pms-system.vercel.app
```

Sau khi cập nhật biến môi trường, redeploy PMS frontend.

## 2. Cấu hình nút trên landing page

Cho các nút `Đăng nhập`, `Dùng thử` hoặc `Vào hệ thống` trỏ tới:

```text
https://your-pms-domain.com/login?source=landing
```

Ví dụ React/Next.js:

```tsx
<a href="https://your-pms-domain.com/login?source=landing">
  Đăng nhập
</a>
```

## 3. Luồng hoạt động

1. Khách truy cập landing page.
2. Chọn `Đăng nhập` để chuyển sang PMS.
3. PMS xác thực tài khoản qua backend đã cấu hình.
4. Đăng nhập thành công sẽ chuyển tới `/dashboard`.
5. Người dùng có thể chọn `Về trang giới thiệu` để quay lại landing page.
