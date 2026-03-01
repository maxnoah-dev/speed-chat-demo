#!/bin/sh
# Đặt DATABASE_URL từ DB_* trước khi chạy prisma (Prisma đọc env ngay khi validate schema)
if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ]; then
  export DATABASE_URL=$(node -e "const p=process.env.DB_PASSWORD||''; const enc=encodeURIComponent(p); console.log('mysql://'+(process.env.DB_USER||'root')+':'+enc+'@'+(process.env.DB_HOST)+':3306/'+(process.env.DB_NAME||'social_demo'))")
fi
exec "$@"
