UPDATE admin_credentials 
SET password_hash = '8ecd67dceb90a898b1f94bddf570ce1c23629cd328140d81f1e02e43d42eb44e', 
    updated_at = CURRENT_TIMESTAMP 
WHERE username = 'admin';
