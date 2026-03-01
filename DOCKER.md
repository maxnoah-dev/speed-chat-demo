# Docker – Dev / Prod

**Dev:** `docker compose --env-file .env.development -f docker-compose.yml -f docker-compose.dev.yml up -d`  
→ FE http://localhost:3003, BE http://localhost:3002

**Prod:** `docker compose --env-file .env.production -f docker-compose.yml up -d`  
→ Chỉ nginx lộ 80/443. Set `DB_PASSWORD` (và `DB_USER`, `DB_NAME` nếu cần) trong `.env.production`; migration chạy tự khi BE start.

Env: compose đọc **root** (`.env.development` / `.env.production`). MySQL dùng `.env.mysql`.

**VPS ít RAM:** Build FE có thể treo ở `yarn install`. Đã set `NODE_OPTIONS=--max-old-space-size=768` trong Dockerfile. Nếu vẫn treo: build image FE trên máy/CI (`docker build -t fe-react ./fe`), push lên registry, trên VPS dùng image đó thay vì build.
