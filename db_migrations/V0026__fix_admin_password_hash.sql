UPDATE admin_credentials 
SET password_hash = 'b8c8f9e0ee9e1f8c7a3f5d9b2a4e6f8c1d3e5a7b9c1f3e5d7a9b1c3e5f7a9b1c', 
    updated_at = CURRENT_TIMESTAMP 
WHERE username = 'admin';
