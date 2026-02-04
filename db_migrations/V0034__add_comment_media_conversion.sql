-- Convert Yandex.Disk URLs to base64 in media_files (manual update required)
-- This migration adds a comment only, actual conversion will be done via backend script
COMMENT ON TABLE media_files IS 'Audio files: URLs should be converted to base64 for playback';