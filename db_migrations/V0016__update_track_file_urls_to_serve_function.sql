-- Update file URLs from storage.poehali.dev to file-serve function
UPDATE t_p39135821_musician_site_projec.tracks 
SET file = 'https://functions.poehali.dev/2cf47b50-85f0-48ec-a719-845bb26354d4?id=' || 
           SUBSTRING(file FROM 'uploads/([^.]+)')
WHERE file LIKE 'https://storage.poehali.dev/uploads/%';
