ALTER TABLE members
  ADD COLUMN IF NOT EXISTS date_of_birth date;

-- If you already created the table without this column, this will add it safely.
-- Run it in the same PostgreSQL database used by the app.
