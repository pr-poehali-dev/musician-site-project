-- Обновляем поле file в таблице tracks: убираем расширение .mp3 из имен файлов
UPDATE tracks 
SET file = REPLACE(file, '.mp3', '')
WHERE file LIKE '%.mp3';