/** Load .env → .env.[NODE_ENV] → .env.local. Tự ghép DATABASE_URL từ DB_* nếu chưa có. */
import path from 'path';
import { config } from 'dotenv';

const root = process.cwd();
const nodeEnv = process.env.NODE_ENV || 'development';

config({ path: path.join(root, '.env') });
config({ path: path.join(root, `.env.${nodeEnv}`), override: true });
config({ path: path.join(root, '.env.local'), override: true });

if (!process.env.DATABASE_URL && process.env.DB_HOST) {
  process.env.DATABASE_URL = `mysql://${process.env.DB_USER || 'root'}:${encodeURIComponent(process.env.DB_PASSWORD || '')}@${process.env.DB_HOST}:3306/${process.env.DB_NAME || 'social_demo'}`;
}
