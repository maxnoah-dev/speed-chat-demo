import "./src/config/env";
import { defineConfig } from "prisma/config";

// Ưu tiên MySQL từ DB_* nếu có; nếu không thì dùng DATABASE_URL
const databaseUrl =
  process.env.DB_HOST
    ? `mysql://${process.env.DB_USER || "root"}:${encodeURIComponent(process.env.DB_PASSWORD || "")}@${process.env.DB_HOST}:3306/${process.env.DB_NAME || "speed_chat"}`
    : process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: databaseUrl },
});
