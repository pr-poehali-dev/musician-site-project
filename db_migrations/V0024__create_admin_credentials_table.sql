CREATE TABLE IF NOT EXISTS admin_credentials (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_credentials (username, password_hash) 
VALUES ('admin', 'a51c2ff4c05c85e4a86f1fd29c11f09e7f93d7e3b8e1c77e7e1d5c8f5e4d3c2b')
ON CONFLICT (username) DO NOTHING;
