DROP INDEX IF EXISTS identity_google_id_key;
ALTER TABLE identity DROP COLUMN IF EXISTS google_id;
ALTER TABLE identity ALTER COLUMN password_hash SET NOT NULL;
