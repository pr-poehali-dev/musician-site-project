-- Добавляем записи для аудиофайлов в media_files
INSERT INTO media_files (id, file_type, data, created_at)
SELECT DISTINCT 
    file,
    'audio/mpeg',
    '',
    CURRENT_TIMESTAMP
FROM tracks
WHERE file IS NOT NULL 
  AND file != '' 
  AND file LIKE 'audio_%'
  AND NOT EXISTS (
    SELECT 1 FROM media_files WHERE media_files.id = tracks.file
  );