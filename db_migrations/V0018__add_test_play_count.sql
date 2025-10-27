-- Добавляем тестовые данные для проверки счётчика прослушиваний
INSERT INTO t_p39135821_musician_site_projec.track_stats (track_id, plays_count, last_played_at, created_at, updated_at)
VALUES 
  ('1760355118403', 5, NOW(), NOW(), NOW())
ON CONFLICT (track_id) DO UPDATE SET 
  plays_count = 5,
  last_played_at = NOW(),
  updated_at = NOW();