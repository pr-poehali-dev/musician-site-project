CREATE TABLE IF NOT EXISTS blog_posts (
  id VARCHAR(50) PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(255) NOT NULL DEFAULT 'Дмитрий Шмелидзэ',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);
