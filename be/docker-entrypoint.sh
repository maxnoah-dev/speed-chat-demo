#!/bin/sh
set -e
# Prisma cần DATABASE_URL ngay khi chạy; nếu chưa có thì ghép từ DB_*
if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ]; then
  export DATABASE_URL=$(/usr/local/bin/node -e "
    const u = process.env.DB_USER || 'root';
    const p = (process.env.DB_PASSWORD || '');
    const h = process.env.DB_HOST;
    const d = process.env.DB_NAME || 'social_demo';
    console.log('mysql://' + u + ':' + encodeURIComponent(p) + '@' + h + ':3306/' + d);
  ")
fi
exec "$@"
