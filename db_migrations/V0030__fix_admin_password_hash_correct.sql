UPDATE admin_credentials 
SET password_hash = 'a9b858eb7352cb470e2a5ea4b55496d501375493fcf6c3be8ef13007d8752493', 
    updated_at = CURRENT_TIMESTAMP 
WHERE username = 'admin';
