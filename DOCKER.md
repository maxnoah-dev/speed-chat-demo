# Docker – Dev / Prod

**Dev:** `docker compose --env-file .env.development -f docker-compose.yml -f docker-compose.dev.yml up -d`  
→ FE http://localhost:3003, BE http://localhost:3002

**Prod:** `docker compose --env-file .env.production -f docker-compose.yml up -d`  
→ Chỉ nginx lộ 80/443.

**Trên server:** Tạo file `.env.production` ở thư mục gốc (cạnh docker-compose.yml) với ít nhất:
`DB_PASSWORD=mật_khẩu_mysql` (cùng với mật khẩu trong `.env.mysql`). Có thể thêm `DB_USER`, `DB_NAME`, `REACT_APP_API_URL`, `CORS_ORIGIN` nếu cần.

Env: compose đọc **root**. MySQL dùng `.env.mysql`.
