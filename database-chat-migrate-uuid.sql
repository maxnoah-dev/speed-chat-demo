-- Migration: chuyển bảng chat sang ID UUID v7 (CHAR(36)).
-- Chạy khi gặp lỗi "Incorrect arguments to mysqld_stmt_execute" do backend đã dùng UUID mà DB vẫn dùng id INT.
-- Lưu ý: Dữ liệu chat cũ sẽ bị xóa.
--
-- Cách chạy (PowerShell, không dùng < được):
--   Get-Content .\database-chat-migrate-uuid.sql | docker compose exec -T mysql mysql -u root -pMẬT_KHẨU social_demo
--
-- Cách chạy (cmd):
--   docker compose exec -T mysql mysql -u root -pMẬT_KHẨU social_demo < database-chat-migrate-uuid.sql

USE social_demo;

DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_rooms;

CREATE TABLE chat_rooms (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id CHAR(36) PRIMARY KEY,
    room_id CHAR(36) NOT NULL,
    sender VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    attachment_name VARCHAR(255) NULL,
    attachment_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE
);
