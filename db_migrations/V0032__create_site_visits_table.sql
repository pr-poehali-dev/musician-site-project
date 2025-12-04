-- Создание таблицы для отслеживания посещений сайта
CREATE TABLE IF NOT EXISTS t_p39135821_musician_site_projec.site_visits (
    id SERIAL PRIMARY KEY,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    page_url TEXT
);

-- Создание индекса для быстрого подсчета визитов
CREATE INDEX idx_visits_date ON t_p39135821_musician_site_projec.site_visits(visited_at);
