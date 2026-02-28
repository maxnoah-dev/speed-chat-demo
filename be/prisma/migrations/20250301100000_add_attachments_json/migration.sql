-- AlterTable: thêm cột attachments (JSON) để lưu nhiều file [{ name, url }, ...]
ALTER TABLE `chat_messages` ADD COLUMN `attachments` JSON NULL;
