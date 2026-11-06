import { sql } from '../db/index.ts';

await sql("ALTER TABLE books ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'General';");
console.log('Migration complete');
