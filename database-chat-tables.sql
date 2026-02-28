-- Chạy file này nếu DB đã tồn tại nhưng thiếu bảng chat (lỗi "chat_messages doesn't exist").
-- Cách chạy (Docker): docker compose exec -T mysql mysql -u root -p<MẬT_KHẨU_TỪ_be/.env_hoặc_.env.mysql> social_demo < database-chat-tables.sql

USE social_demo;

CREATE TABLE IF NOT EXISTS chat_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    sender VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    attachment_name VARCHAR(255) NULL,
    attachment_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE
);
