-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индекса для быстрого поиска по email и username
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Добавление поля user_id к существующей таблице albums
ALTER TABLE albums ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id);

-- Создание индекса для связи альбомов с пользователями
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);

-- Добавление поля user_id к существующей таблице tracks
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id);

-- Создание индекса для связи треков с пользователями
CREATE INDEX IF NOT EXISTS idx_tracks_user_id ON tracks(user_id);

-- Создание таблицы сессий для авторизации
CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);