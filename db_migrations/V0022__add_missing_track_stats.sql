-- Add missing track stats for all tracks that don't have statistics yet
INSERT INTO t_p39135821_musician_site_projec.track_stats (track_id, plays_count, downloads_count)
SELECT t.id, 0, 0
FROM t_p39135821_musician_site_projec.tracks t
WHERE NOT EXISTS (
    SELECT 1 FROM t_p39135821_musician_site_projec.track_stats ts WHERE ts.track_id = t.id
);