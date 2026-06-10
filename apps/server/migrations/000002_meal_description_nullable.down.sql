UPDATE public.meal SET description = '' WHERE description IS NULL;
ALTER TABLE public.meal ALTER COLUMN description SET NOT NULL;
