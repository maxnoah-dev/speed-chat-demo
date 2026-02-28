-- Chạy file này nếu DB đã tồn tại nhưng thiếu bảng chat (lỗi "chat_messages doesn't exist").
-- Cách chạy (Docker): docker compose exec -T mysql mysql -u root -p<MẬT_KHẨU> social_demo < database-chat-tables.sql
-- ID dùng UUID v7 (CHAR(36)), do backend sinh khi insert.
-- Nếu đã có bảng chat với id INT cũ: DROP TABLE IF EXISTS chat_messages; DROP TABLE IF EXISTS chat_rooms; rồi chạy lại file này.

USE social_demo;

CREATE TABLE IF NOT EXISTS chat_rooms (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id CHAR(36) PRIMARY KEY,
    room_id CHAR(36) NOT NULL,
    sender VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    attachment_name VARCHAR(255) NULL,
    attachment_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE
);
