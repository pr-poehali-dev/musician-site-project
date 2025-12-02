UPDATE admin_credentials 
SET password_hash = '5f94dc8d8eb04d8de2e1e8b4e7e1f1e5f0d8e8e8e8e8e8e8e8e8e8e8e8e8e8e8', 
    updated_at = CURRENT_TIMESTAMP 
WHERE username = 'admin';
