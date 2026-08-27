CREATE TYPE public.meal_dietary_tags_enum AS ENUM (
    'vegetarian',
    'vegan',
    'lenten',
    'chrono',
    'gluten_free',
    'dairy_free',
    'halal'
);

ALTER TABLE meal ADD COLUMN dietary_tags public.meal_dietary_tags_enum[] NOT NULL DEFAULT '{}';
