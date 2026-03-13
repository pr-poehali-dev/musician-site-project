INSERT INTO t_p39135821_musician_site_projec.track_stats (track_id, plays_count, downloads_count, last_played_at, created_at, updated_at)
VALUES ('1773397307241', 50, 0, NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

UPDATE t_p39135821_musician_site_projec.track_stats
SET plays_count = 50, updated_at = NOW()
WHERE track_id = '1773397307241';
