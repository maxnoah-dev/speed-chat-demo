# Docker – Dev / Prod

**Dev:** `docker compose --env-file .env.development -f docker-compose.yml -f docker-compose.dev.yml up -d`  
→ FE http://localhost:3003, BE http://localhost:3002

**Prod:** `docker compose --env-file .env.production -f docker-compose.yml up -d`  
→ Chỉ nginx lộ 80/443.

**Trên server:** Bắt buộc có file `.env.production` ở thư mục gốc. Ít nhất cần:
- `DB_PASSWORD=...` (trùng mật khẩu trong `.env.mysql`).
Hoặc set luôn: `DATABASE_URL=mysql://root:MẬT_KHẨU@mysql:3306/speed_chat`.
Cùng file này compose sẽ load vào container BE (`env_file`).

Env: compose đọc **root**. MySQL dùng `.env.mysql`.

**Nếu container be-nodejs báo unhealthy:**  
Xem log: `docker logs be-nodejs`. Thường do (1) Prisma migrate lỗi (sai `DB_PASSWORD` / `DATABASE_URL` hoặc MySQL chưa sẵn sàng), (2) thiếu biến env trong `.env.production`. Đảm bảo `DB_HOST=mysql`, `DB_PASSWORD` trùng với `.env.mysql`, `DB_NAME=speed_chat`.
