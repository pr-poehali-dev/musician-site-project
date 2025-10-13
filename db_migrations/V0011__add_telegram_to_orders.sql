-- Добавляем поля для интеграции с Telegram
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(255),
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;