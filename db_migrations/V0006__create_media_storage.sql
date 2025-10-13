
-- Создаём таблицу для хранения медиафайлов (изображения, аудио)
CREATE TABLE IF NOT EXISTS media_files (
    id VARCHAR(255) PRIMARY KEY,
    file_type VARCHAR(50) NOT NULL,
    data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по типу
CREATE INDEX IF NOT EXISTS idx_media_files_type ON media_files(file_type);
