#!/bin/sh
set -e
# Prisma cần DATABASE_URL ngay khi chạy; nếu chưa có thì ghép từ DB_*
if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ]; then
  export DATABASE_URL=$(/usr/local/bin/node -e "
    const u = process.env.DB_USER || 'root';
    const p = (process.env.DB_PASSWORD || '');
    const h = process.env.DB_HOST;
    const d = process.env.DB_NAME || 'speed_chat';
    console.log('mysql://' + u + ':' + encodeURIComponent(p) + '@' + h + ':3306/' + d);
  ")
fi
# Nếu lệnh là yarn start: retry prisma migrate (MySQL có thể chưa sẵn sàng ngay)
case "$*" in
  *yarn*start*)
    for i in 1 2 3 4 5; do
      if /usr/local/bin/npx prisma migrate deploy; then
        exec node dist/index.js
      fi
      echo "Prisma migrate attempt $i failed, retrying in 5s..."
      sleep 5
    done
    echo "Prisma migrate deploy failed after 5 attempts."
    exit 1
    ;;
  *)
    exec "$@"
    ;;
esac
