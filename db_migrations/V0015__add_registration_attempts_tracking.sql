-- Create table for tracking registration attempts by IP
CREATE TABLE IF NOT EXISTS t_p39135821_musician_site_projec.registration_attempts (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    first_attempt_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_attempt_at TIMESTAMP NOT NULL DEFAULT NOW(),
    blocked_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create unique index on IP address
CREATE UNIQUE INDEX IF NOT EXISTS idx_registration_attempts_ip 
ON t_p39135821_musician_site_projec.registration_attempts(ip_address);

-- Create index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_registration_attempts_blocked 
ON t_p39135821_musician_site_projec.registration_attempts(blocked_until);