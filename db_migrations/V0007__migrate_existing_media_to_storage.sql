
-- Переносим обложки альбомов в media_files
INSERT INTO media_files (id, file_type, data, created_at)
SELECT CONCAT('cover_', id) as id, 'image' as file_type, cover as data, created_at
FROM albums
WHERE LENGTH(cover) > 100
ON CONFLICT (id) DO NOTHING;

-- Обновляем ссылки на обложки в albums
UPDATE albums
SET cover = CONCAT('cover_', id)
WHERE LENGTH(cover) > 100;

-- Переносим аудиофайлы треков в media_files
INSERT INTO media_files (id, file_type, data, created_at)
SELECT CONCAT('audio_', id) as id, 'audio' as file_type, file as data, created_at
FROM tracks
WHERE LENGTH(file) > 100
ON CONFLICT (id) DO NOTHING;

-- Обновляем ссылки на аудио в tracks
UPDATE tracks
SET file = CONCAT('audio_', id)
WHERE LENGTH(file) > 100;

-- Переносим обложки треков в media_files
INSERT INTO media_files (id, file_type, data, created_at)
SELECT CONCAT('cover_track_', id) as id, 'image' as file_type, cover as data, created_at
FROM tracks
WHERE LENGTH(cover) > 100
ON CONFLICT (id) DO NOTHING;

-- Обновляем ссылки на обложки в tracks
UPDATE tracks
SET cover = CONCAT('cover_track_', id)
WHERE LENGTH(cover) > 100;
