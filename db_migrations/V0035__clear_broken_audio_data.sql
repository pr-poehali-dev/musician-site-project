-- Очищаем битые данные трека "Как бы мне тебе сказать" (содержит HTML вместо аудио)
UPDATE media_files 
SET data = '', file_type = ''
WHERE id = 'audio_1773394837510'
AND data NOT LIKE 'https://%'
AND data NOT LIKE 'data:audio/%';

-- Также очищаем пустую запись "Мой ЖУК"
UPDATE media_files 
SET data = '', file_type = ''
WHERE id = 'audio_1760355116128_%'
AND (data IS NULL OR length(data) = 0);
