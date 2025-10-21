-- Replace empty strings with NULL in media file references
UPDATE albums SET cover = NULL WHERE cover = '';
UPDATE tracks SET file = NULL WHERE file = '';
UPDATE tracks SET cover = NULL WHERE cover = '';