UPDATE admin_credentials 
SET password_hash = 'd8f5e3c9a7b2f4e6d8a1c3e5f7b9d1a3c5e7f9b1d3e5a7c9f1b3d5e7a9c1b3e5', 
    updated_at = CURRENT_TIMESTAMP 
WHERE username = 'admin';
