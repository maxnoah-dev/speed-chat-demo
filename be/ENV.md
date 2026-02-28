# Biến môi trường (Backend)

Load theo thứ tự (sau ghi đè trước):

1. **`.env`** — giá trị mặc định
2. **`.env.development`** (khi `NODE_ENV=development`) hoặc **`.env.production`** (khi `NODE_ENV=production`)
3. **`.env.local`** — override local, không commit (đã gitignore)

## Chạy local

- `npm run dev` → mặc định coi là development, dùng `.env.development` (DB_HOST=localhost, CORS local).
- Có thể tạo `.env.local` để ghi đè (ví dụ `DB_PASSWORD`).

## Deploy production

- Trong Docker: set `NODE_ENV=production`, truyền `DB_*`, `CORS_ORIGIN` qua `environment` hoặc `env_file`.
- Chạy trực tiếp: `NODE_ENV=production npm run start` và có `.env.production` hoặc `.env.local`.

## Tạo file từ mẫu

```bash
cp .env.example .env.local
# Chỉnh .env.local (mật khẩu, CORS, ...)
```
