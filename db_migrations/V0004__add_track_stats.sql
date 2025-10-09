CREATE TABLE IF NOT EXISTS track_stats (
    id SERIAL PRIMARY KEY,
    track_id VARCHAR(255) NOT NULL UNIQUE,
    plays_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    last_played_at TIMESTAMP,
    last_downloaded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_track_stats_track_id ON track_stats(track_id);
CREATE INDEX IF NOT EXISTS idx_track_stats_plays ON track_stats(plays_count DESC);
CREATE INDEX IF NOT EXISTS idx_track_stats_downloads ON track_stats(downloads_count DESC);