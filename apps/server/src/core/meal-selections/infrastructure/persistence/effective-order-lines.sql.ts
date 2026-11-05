import { ChangeRequestStatus } from '@food-up/shared';

const APPROVED = `'${ChangeRequestStatus.Approved}'`;

/**
 * Derived table of what each window actually orders, one row per line. Every report, cost
 * and dashboard query reads from it so they all agree with the manager's daily overview
 * (daily-overview.builder.ts), which applies approved change requests in approval order:
 *
 *   - Selections: the latest approved swap or removal decides the meal (none = the original);
 *     the latest approved change of any kind decides the quantity (a quantity-only change
 *     keeps the current meal). Unchanged meals keep the price captured at selection time;
 *     swapped meals use the new menu item's price.
 *   - Late additions: approved change requests without a selection add a line.
 *   - Extra quantities: guest lines added by the manager.
 *
 * Lines can have no meal (skipped or removed) or quantity 0; filter on
 * `menu_item_id IS NOT NULL AND quantity > 0` for ordered meals.
 *
 * Columns: window_id, business_id, employee_id (null for guests), guest_name,
 * source ('selection' | 'late_addition' | 'extra'), date, menu_item_id, supplier_id,
 * quantity, unit_price.
 *
 * Usage: `FROM ${EFFECTIVE_ORDER_LINES} eol WHERE eol.window_id = $1`
 */
export const EFFECTIVE_ORDER_LINES = `(
  WITH approved AS (
    SELECT * FROM change_request WHERE status = ${APPROVED}
  ),
  last_change AS (
    SELECT DISTINCT ON (meal_selection_id) *
    FROM approved
    WHERE meal_selection_id IS NOT NULL
    ORDER BY meal_selection_id, approved_at DESC NULLS LAST, id DESC
  ),
  last_meal_change AS (
    SELECT DISTINCT ON (meal_selection_id) *
    FROM approved
    WHERE meal_selection_id IS NOT NULL
      AND (clear_selection OR new_menu_item_id IS NOT NULL)
    ORDER BY meal_selection_id, approved_at DESC NULLS LAST, id DESC
  ),
  lines AS (
    SELECT
      ms.meal_selection_window_id AS window_id,
      ms.employee_id,
      NULL::varchar AS guest_name,
      'selection' AS source,
      ms.date,
      CASE
        WHEN lmc.id IS NULL THEN ms.menu_item_id
        WHEN lmc.clear_selection THEN NULL
        ELSE lmc.new_menu_item_id
      END AS menu_item_id,
      CASE
        WHEN lc.id IS NULL THEN COALESCE(ms.quantity, 1)
        WHEN lc.clear_selection THEN 0
        WHEN lc.new_menu_item_id IS NOT NULL THEN COALESCE(lc.new_quantity, 1)
        ELSE COALESCE(lc.new_quantity, ms.quantity, 1)
      END AS quantity,
      lmc.id IS NULL AS keeps_original_meal,
      ms.price AS snapshot_price
    FROM meal_selection ms
    LEFT JOIN last_change lc ON lc.meal_selection_id = ms.id
    LEFT JOIN last_meal_change lmc ON lmc.meal_selection_id = ms.id

    UNION ALL

    SELECT
      cr.meal_selection_window_id,
      cr.employee_id,
      NULL::varchar,
      'late_addition',
      mi.day,
      cr.new_menu_item_id,
      COALESCE(cr.new_quantity, 1),
      false,
      NULL::numeric
    FROM approved cr
    JOIN menu_item mi ON mi.id = cr.new_menu_item_id
    WHERE cr.meal_selection_id IS NULL
      AND cr.clear_selection = false

    UNION ALL

    SELECT
      eq.window_id,
      NULL::varchar,
      eq.guest_name,
      'extra',
      mi.day,
      eq.menu_item_id,
      eq.quantity,
      false,
      NULL::numeric
    FROM extra_quantity eq
    JOIN menu_item mi ON mi.id = eq.menu_item_id
  )
  SELECT
    l.window_id,
    w.business_id,
    l.employee_id,
    l.guest_name,
    l.source,
    l.date,
    l.menu_item_id,
    mp.supplier_id,
    l.quantity,
    CASE WHEN l.keeps_original_meal THEN l.snapshot_price ELSE mi.price END AS unit_price
  FROM lines l
  JOIN meal_selection_window w ON w.id = l.window_id
  LEFT JOIN menu_item mi ON mi.id = l.menu_item_id
  LEFT JOIN menu_period mp ON mp.id = mi.menu_period_id
)`;
