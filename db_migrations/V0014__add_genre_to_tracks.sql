-- Add genre column to tracks table
ALTER TABLE t_p39135821_musician_site_projec.tracks 
ADD COLUMN IF NOT EXISTS genre VARCHAR(100);