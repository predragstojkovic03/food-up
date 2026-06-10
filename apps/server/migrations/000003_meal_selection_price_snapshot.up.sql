ALTER TABLE meal_selection ADD COLUMN price NUMERIC(10, 2);

UPDATE meal_selection ms
SET price = mi.price
FROM menu_item mi
WHERE ms.menu_item_id = mi.id
  AND ms.price IS NULL;
