-- Sync Supabase to the current app schema
-- Run this in the Supabase SQL editor.

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'General';

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS date_of_birth date;

UPDATE books
SET category = 'General'
WHERE category IS NULL OR category = '';

SELECT id, title, category
FROM books
ORDER BY id;

SELECT id, name, date_of_birth
FROM members
ORDER BY id;
