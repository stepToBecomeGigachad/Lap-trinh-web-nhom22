Triển khai Docker cho dự án (Next.js + Prisma + MySQL)

1) Chuyển Prisma sang MySQL
- Mở `prisma/schema.prisma` và đổi datasource:
  
  ```
  datasource db {
    provider = "mysql"
    url      = env("DATABASE_URL")
  }
  ```

- Cập nhật `.env` khi chạy ngoài Docker (tùy chọn):
  `DATABASE_URL="mysql://book_user:strong_password_here@localhost:3306/bookstore"`

2) Build và chạy bằng Docker Compose
- Từ thư mục `bookstore-nextjs`:
  - `docker compose build`
  - `docker compose up -d`
  - Xem log: `docker compose logs -f app`

3) Truy cập
- App: http://localhost:3000
- MySQL: cổng 3306 (có thể kết nối bằng Workbench/DBeaver nếu cần)

4) Migrations/Seed
- App container tự chạy `prisma migrate deploy` trước khi khởi động (xem `Dockerfile`).
- Nếu bạn muốn seed dữ liệu:
  `docker compose run --rm app node prisma/seed.js`

5) Bảo mật & lưu ý
- Đổi `SESSION_SECRET`, mật khẩu MySQL trong `docker-compose.yml` trước khi deploy thật.
- Nếu không cần truy cập DB từ host, có thể bỏ `ports: 3306:3306` ở service `mysql`.

