ALTER TABLE meal DROP COLUMN IF EXISTS dietary_tags;

DROP TYPE IF EXISTS public.meal_dietary_tags_enum;
