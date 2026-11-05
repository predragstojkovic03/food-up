import {
  EmployeeRole,
  IdentityType,
  Language,
  MealType,
  SupplierType,
} from '@food-up/shared';
import { hashSync } from 'bcrypt';
import { DataSource } from 'typeorm';
import { ulid } from 'ulid';

export const TEST_PASSWORD = 'password123';
const PASSWORD_HASH = hashSync(TEST_PASSWORD, 4);

export interface TestBusiness {
  id: string;
  name: string;
}

export interface TestEmployee {
  id: string;
  identityId: string;
  businessId: string;
  name: string;
  email: string;
  role: EmployeeRole;
}

export interface TestSupplier {
  id: string;
  name: string;
  identityId?: string;
}

export interface TestMeal {
  id: string;
  name: string;
  type: MealType;
  price: number | null;
}

export interface TestMenuItem {
  id: string;
  mealId: string;
  day: string;
  price: number | null;
}

/**
 * Inserts rows directly with SQL so each test states exactly what is in the database,
 * independent of the application code under test.
 */
export class TestData {
  private _counter = 0;

  constructor(private readonly _ds: DataSource) {}

  private _unique(prefix: string): string {
    this._counter += 1;
    return `${prefix} ${this._counter}`;
  }

  async business(
    opts: {
      name?: string;
      language?: Language;
      reportIncludeEmployeesWithoutSelection?: boolean;
    } = {},
  ): Promise<TestBusiness> {
    const id = ulid();
    const name = opts.name ?? this._unique('Business');
    await this._ds.query(
      `INSERT INTO business (id, name, contact_email, language, report_include_employees_without_selection)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        id,
        name,
        `${id.toLowerCase()}@business.test`,
        opts.language ?? Language.En,
        opts.reportIncludeEmployeesWithoutSelection ?? false,
      ],
    );
    return { id, name };
  }

  async employee(
    business: TestBusiness,
    opts: {
      name?: string;
      role?: EmployeeRole;
      active?: boolean;
      email?: string;
    } = {},
  ): Promise<TestEmployee> {
    const identityId = ulid();
    const id = ulid();
    const name = opts.name ?? this._unique('Employee');
    const email = opts.email ?? `${identityId.toLowerCase()}@employee.test`;
    const role = opts.role ?? EmployeeRole.Basic;
    await this._ds.query(
      `INSERT INTO identity (id, email, password_hash, type, is_active) VALUES ($1, $2, $3, $4, $5)`,
      [
        identityId,
        email,
        PASSWORD_HASH,
        IdentityType.Employee,
        opts.active ?? true,
      ],
    );
    await this._ds.query(
      `INSERT INTO employee (id, name, role, business_id, identity_id) VALUES ($1, $2, $3, $4, $5)`,
      [id, name, role, business.id, identityId],
    );
    return { id, identityId, businessId: business.id, name, email, role };
  }

  manager(
    business: TestBusiness,
    opts: { name?: string; email?: string } = {},
  ): Promise<TestEmployee> {
    return this.employee(business, { ...opts, role: EmployeeRole.Manager });
  }

  async managedSupplier(
    business: TestBusiness,
    opts: { name?: string; email?: string | null; language?: Language } = {},
  ): Promise<TestSupplier> {
    const id = ulid();
    const name = opts.name ?? this._unique('Supplier');
    await this._ds.query(
      `INSERT INTO supplier (id, name, type, email, managing_business_id, language)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        name,
        SupplierType.Managed,
        opts.email === undefined
          ? `${id.toLowerCase()}@supplier.test`
          : opts.email,
        business.id,
        opts.language ?? Language.En,
      ],
    );
    return { id, name };
  }

  /** A standalone supplier with its own account, linked as a partner to the given businesses. */
  async partnerSupplier(
    partners: TestBusiness[],
    opts: { name?: string } = {},
  ): Promise<TestSupplier> {
    const id = ulid();
    const identityId = ulid();
    const name = opts.name ?? this._unique('Partner Supplier');
    await this._ds.query(
      `INSERT INTO identity (id, email, password_hash, type, is_active) VALUES ($1, $2, $3, $4, true)`,
      [
        identityId,
        `${identityId.toLowerCase()}@partner.test`,
        PASSWORD_HASH,
        IdentityType.Supplier,
      ],
    );
    await this._ds.query(
      `INSERT INTO supplier (id, name, type, email, identity_id, language) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        name,
        SupplierType.Standalone,
        `${id.toLowerCase()}@supplier.test`,
        identityId,
        Language.En,
      ],
    );
    for (const business of partners) {
      await this._ds.query(
        `INSERT INTO business_supplier (id, business_id, supplier_id, language) VALUES ($1, $2, $3, $4)`,
        [ulid(), business.id, id, Language.En],
      );
    }
    return { id, name, identityId };
  }

  async meal(
    supplier: TestSupplier,
    opts: { name?: string; type?: MealType; price?: number | null } = {},
  ): Promise<TestMeal> {
    const id = ulid();
    const name = opts.name ?? this._unique('Meal');
    const type = opts.type ?? MealType.Lunch;
    const price = opts.price === undefined ? 500 : opts.price;
    await this._ds.query(
      `INSERT INTO meal (id, name, description, type, price, supplier_id) VALUES ($1, $2, NULL, $3, $4, $5)`,
      [id, name, type, price, supplier.id],
    );
    return { id, name, type, price };
  }

  async menuPeriod(
    supplier: TestSupplier,
    startDate: string,
    endDate: string,
  ): Promise<{ id: string }> {
    const id = ulid();
    await this._ds.query(
      `INSERT INTO menu_period (id, supplier_id, start_date, end_date) VALUES ($1, $2, $3, $4)`,
      [id, supplier.id, startDate, endDate],
    );
    return { id };
  }

  async menuItem(
    menuPeriod: { id: string },
    meal: TestMeal,
    day: string,
    opts: { price?: number | null } = {},
  ): Promise<TestMenuItem> {
    const id = ulid();
    const price = opts.price === undefined ? meal.price : opts.price;
    await this._ds.query(
      `INSERT INTO menu_item (id, price, day, menu_period_id, meal_id) VALUES ($1, $2, $3, $4, $5)`,
      [id, price, day, menuPeriod.id, meal.id],
    );
    return { id, mealId: meal.id, day, price };
  }

  async window(
    business: TestBusiness,
    opts: {
      menuPeriods: { id: string }[];
      targetDates: string[];
      startTime?: Date;
      endTime?: Date;
      isLocked?: boolean;
    },
  ): Promise<{ id: string }> {
    const id = ulid();
    const now = Date.now();
    await this._ds.query(
      `INSERT INTO meal_selection_window (id, start_time, end_time, target_dates, business_id, is_locked, notify_on_deadline)
       VALUES ($1, $2, $3, $4::date[], $5, $6, false)`,
      [
        id,
        opts.startTime ?? new Date(now - 7 * 86_400_000),
        opts.endTime ?? new Date(now - 86_400_000),
        opts.targetDates,
        business.id,
        opts.isLocked ?? false,
      ],
    );
    for (const mp of opts.menuPeriods) {
      await this._ds.query(
        `INSERT INTO meal_selection_window_menu_periods_menu_period (meal_selection_window_id, menu_period_id)
         VALUES ($1, $2)`,
        [id, mp.id],
      );
    }
    return { id };
  }

  /** A meal selection; pass `menuItem: null` for an explicitly skipped day. */
  async selection(
    window: { id: string },
    employee: TestEmployee,
    date: string,
    menuItem: TestMenuItem | null,
    opts: { quantity?: number | null; price?: number | null } = {},
  ): Promise<{ id: string }> {
    const id = ulid();
    const price =
      opts.price === undefined ? (menuItem?.price ?? null) : opts.price;
    await this._ds.query(
      `INSERT INTO meal_selection (id, employee_id, quantity, date, menu_item_id, meal_selection_window_id, price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        employee.id,
        opts.quantity === undefined ? 1 : opts.quantity,
        date,
        menuItem?.id ?? null,
        window.id,
        price,
      ],
    );
    return { id };
  }

  /**
   * A change request. Approved ones get approval times in call order unless given,
   * so tests can rely on "later call = approved later".
   */
  async changeRequest(opts: {
    window: { id: string };
    employee: TestEmployee;
    selection?: { id: string } | null;
    newMenuItem?: TestMenuItem | null;
    newQuantity?: number | null;
    clearSelection?: boolean;
    status?: 'pending' | 'approved' | 'rejected' | 'revoked';
    approvedBy?: TestEmployee;
    approvedAt?: Date;
  }): Promise<{ id: string }> {
    const id = ulid();
    const status = opts.status ?? 'approved';
    const decided = status === 'approved' || status === 'rejected';
    this._counter += 1;
    const approvedAt =
      opts.approvedAt ??
      new Date(Date.UTC(2026, 0, 1) + this._counter * 60_000);
    await this._ds.query(
      `INSERT INTO change_request (id, employee_id, meal_selection_id, new_quantity, clear_selection, status,
                                   approved_by, approved_at, new_menu_item_id, meal_selection_window_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        opts.employee.id,
        opts.selection?.id ?? null,
        opts.newQuantity ?? (opts.newMenuItem ? 1 : null),
        opts.clearSelection ?? false,
        status,
        decided ? (opts.approvedBy?.id ?? null) : null,
        decided ? approvedAt : null,
        opts.newMenuItem?.id ?? null,
        opts.window.id,
      ],
    );
    return { id };
  }

  async extraQuantity(
    window: { id: string },
    menuItem: TestMenuItem,
    quantity: number,
    guestName: string | null = null,
  ): Promise<{ id: string }> {
    const id = ulid();
    await this._ds.query(
      `INSERT INTO extra_quantity (id, window_id, menu_item_id, quantity, guest_name) VALUES ($1, $2, $3, $4, $5)`,
      [id, window.id, menuItem.id, quantity, guestName],
    );
    return { id };
  }

  async setMenuItemPrice(menuItem: TestMenuItem, price: number): Promise<void> {
    await this._ds.query(`UPDATE menu_item SET price = $2 WHERE id = $1`, [
      menuItem.id,
      price,
    ]);
  }
}
