CREATE TABLE IF NOT EXISTS artist_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  bio TEXT DEFAULT '',
  banner_url TEXT,
  social_links JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE INDEX idx_artist_profiles_user_id ON artist_profiles(user_id);

INSERT INTO artist_profiles (user_id, bio, is_public)
SELECT id, COALESCE(bio, ''), true
FROM users
WHERE id NOT IN (SELECT user_id FROM artist_profiles);
