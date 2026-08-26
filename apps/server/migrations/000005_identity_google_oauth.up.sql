ALTER TABLE identity ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE identity ADD COLUMN google_id VARCHAR(255) NULL;
CREATE UNIQUE INDEX identity_google_id_key ON identity (google_id) WHERE google_id IS NOT NULL;
