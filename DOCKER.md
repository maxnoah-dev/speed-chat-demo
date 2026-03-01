# Docker Compose – Dev / Prod

Stack phụ thuộc **env** (development hoặc production) qua `--env-file`.

## Development (local)

- FE build với `REACT_APP_API_URL=http://localhost:3002`, BE CORS `http://localhost:3003`.
- Expose port: FE `3003`, BE `3002` (truy cập trực tiếp không qua nginx).

```bash
docker compose --env-file .env.development -f docker-compose.yml -f docker-compose.dev.yml up -d
```

- FE: http://localhost:3003  
- BE: http://localhost:3002  

## Production (VPS / deploy)

- FE build với `REACT_APP_API_URL=https://social-demo.maxnoah.io.vn`, CORS tương ứng.
- Trên VPS chỉ nginx expose 80/443. Ở local, BE cũng expose `3002` để FE (gọi `localhost:3002`) hoạt động khi mở qua nginx (`http://localhost`).

```bash
docker compose --env-file .env.production -f docker-compose.yml up -d
```

- Cần set `DB_PASSWORD` (và tùy chọn `DB_USER`, `DB_NAME`) trong `.env.production` hoặc env shell trước khi chạy.

## File env

| File | Mục đích |
|------|----------|
| `.env.development` | Biến cho compose khi chạy **dev** (REACT_APP_API_URL, CORS_ORIGIN, …). |
| `.env.production` | Biến cho compose khi chạy **prod**. Có thể thêm DB_* nếu không dùng be/.env. |

Override local (không commit): tạo `.env` ở thư mục gốc và set biến; compose ưu tiên biến môi trường khi chạy.
