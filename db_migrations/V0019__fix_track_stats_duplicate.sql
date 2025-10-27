-- Переносим статистику со старого трека на новый (актуальный трек в альбоме)
UPDATE t_p39135821_musician_site_projec.track_stats
SET track_id = '1761044071788',
    updated_at = NOW()
WHERE track_id = '1760355118403';