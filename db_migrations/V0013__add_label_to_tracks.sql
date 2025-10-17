-- Добавление поля label к таблице tracks
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS label VARCHAR(255);