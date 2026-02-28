/**
 * Load env theo NODE_ENV: .env → .env.[development|production] → .env.local
 * Chạy đầu tiên (index.ts import, prisma.config.ts gọi loadEnv).
 */
import path from 'path';
import { config } from 'dotenv';

const root = process.cwd();
const nodeEnv = process.env.NODE_ENV || 'development';

config({ path: path.join(root, '.env') });
config({ path: path.join(root, `.env.${nodeEnv}`), override: true });
config({ path: path.join(root, '.env.local'), override: true });
