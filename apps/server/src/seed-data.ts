import { NestFactory } from '@nestjs/core';
import { hash } from 'bcrypt';
import { ulid } from 'ulid';
import { DataSource } from 'typeorm';
import { EmployeeRole, IdentityType, MealType } from '@food-up/shared';
import { AppModule } from './app.module';

import { Business } from './core/businesses/infrastructure/persistence/business.typeorm-entity';
import { Employee } from './core/employees/infrastructure/persistence/employee.typeorm-entity';
import { Identity } from './core/identity/infrastructure/persistence/identity.typeorm-entity';
import { Meal } from './core/meals/infrastructure/persistence/meal.typeorm-entity';
import { MealSelection } from './core/meal-selections/infrastructure/persistence/meal-selection.typeorm-entity';
import { MealSelectionWindow } from './core/meal-selection-windows/infrastructure/persistence/meal-selection-window.typeorm-entity';
import { MenuItem } from './core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { MenuPeriod } from './core/menu-periods/infrastructure/persistence/menu-period.typeorm-entity';
import { Supplier } from './core/suppliers/infrastructure/persistence/supplier.typeorm-entity';

function arg(flag: string, envVar: string): string | undefined {
  const match = process.argv.find((a) => a.startsWith(`--${flag}=`));
  if (match) return match.slice(flag.length + 3);
  return process.env[envVar];
}

function requireArg(flag: string, envVar: string): string {
  const value = arg(flag, envVar);
  if (!value) {
    console.error(`Missing required argument: --${flag} (or env ${envVar})`);
    process.exit(1);
  }
  return value;
}

// Next work week (Mon–Fri, relative to today 2026-05-22)
const NEXT_WEEK = {
  mon: '2026-05-25',
  tue: '2026-05-26',
  wed: '2026-05-27',
  thu: '2026-05-28',
  fri: '2026-05-29',
};

const TARGET_DATES = Object.values(NEXT_WEEK);

const EMPLOYEE_NAMES = [
  { name: 'Marko Petrović',      email: 'marko.petrovic@demo.com' },
  { name: 'Ana Jovanović',        email: 'ana.jovanovic@demo.com' },
  { name: 'Stefan Nikolić',       email: 'stefan.nikolic@demo.com' },
  { name: 'Milica Đorđević',      email: 'milica.djordjevic@demo.com' },
  { name: 'Nikola Popović',       email: 'nikola.popovic@demo.com' },
  { name: 'Jelena Stojanović',    email: 'jelena.stojanovic@demo.com' },
  { name: 'Aleksandar Ilić',      email: 'aleksandar.ilic@demo.com' },
  { name: 'Ivana Stanković',      email: 'ivana.stankovic@demo.com' },
  { name: 'Miloš Vasić',          email: 'milos.vasic@demo.com' },
  { name: 'Tijana Marković',      email: 'tijana.markovic@demo.com' },
];

const SERBIAN_MEALS: { name: string; description: string; type: MealType; price?: number }[] = [
  { name: 'Pasulj',           description: 'Domaći pasulj sa dimljenom kobasicom',        type: MealType.Soup,      price: 200 },
  { name: 'Prebranac',        description: 'Zapečeni prebranac sa pečenim lukom',          type: MealType.Soup,      price: 180 },
  { name: 'Sarma',            description: 'Sarma u pavlaci sa kiselim kupusom',           type: MealType.Lunch,     price: 450 },
  { name: 'Ćevapi',           description: 'Ćevapi od mešanog mesa sa kajmakom i lukom',  type: MealType.Lunch,     price: 500 },
  { name: 'Pljeskavica',      description: 'Domaća pljeskavica sa lepinjom i ajvarom',    type: MealType.Lunch,     price: 520 },
  { name: 'Pileći paprikaš',  description: 'Pileći paprikaš sa domaćim rezancima',        type: MealType.Lunch,     price: 430 },
  { name: 'Šopska salata',    description: 'Svež paradajz, krastavac i sirenje',           type: MealType.Salad,     price: 150 },
  { name: 'Ajvar',            description: 'Domaći ljuti ajvar od pečene paprike',         type: MealType.Salad,     price: 100 },
  { name: 'Kifle',            description: 'Tople domaće kifle od integralnog brašna',     type: MealType.Bread,     price: 80  },
  { name: 'Burek sa mesom',   description: 'Hrskavi burek sa mlevenim mesom iz rerne',     type: MealType.Breakfast, price: 250 },
  { name: 'Urma',             description: 'Domaće urme sa orasima i medom',               type: MealType.Dessert,   price: 120 },
];

// Which meal names go on which day (will be resolved against all known meals)
const DAILY_MEAL_NAMES: Record<string, string[]> = {
  [NEXT_WEEK.mon]: ['Pasulj',          'Ćevapi',          'Šopska salata', 'Kifle'],
  [NEXT_WEEK.tue]: ['Prebranac',       'Pljeskavica',     'Ajvar',         'Burek sa mesom'],
  [NEXT_WEEK.wed]: ['Sarma',           'Pileći paprikaš', 'Šopska salata', 'Urma'],
  [NEXT_WEEK.thu]: ['Pasulj',          'Ćevapi',          'Kifle',         'Urma'],
  [NEXT_WEEK.fri]: ['Prebranac',       'Pljeskavica',     'Ajvar',         'Burek sa mesom'],
};

async function seedData() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const managerEmail = requireArg('manager-email', 'SEED_MANAGER_EMAIL');
  const employeePassword = arg('employee-password', 'SEED_EMPLOYEE_PASSWORD') ?? 'password123';

  const ds = app.get(DataSource);
  const em = ds.manager;

  // ── 1. Find existing business via manager ──────────────────────────────
  const managerIdentity = await em.findOne(Identity, { where: { email: managerEmail } });
  if (!managerIdentity) {
    console.error(`No identity found for manager email: ${managerEmail}`);
    process.exit(1);
  }

  const managerEmployee = await em.findOne(Employee, {
    where: { identity: { id: managerIdentity.id } },
    relations: ['business'],
  });
  if (!managerEmployee?.business) {
    console.error('Manager employee or their business not found.');
    process.exit(1);
  }

  const business: Business = managerEmployee.business;
  console.log(`\nBusiness: ${business.name} (${business.id})`);

  // ── 2. Find a managed supplier ─────────────────────────────────────────
  const suppliers = await em.find(Supplier, {
    where: { managingBusinessId: business.id },
  });
  if (suppliers.length === 0) {
    console.error(
      'No managed supplier found. Please create one via the UI first, then re-run this script.',
    );
    process.exit(1);
  }
  const supplier = suppliers[0];
  console.log(`Supplier: ${supplier.name} (${supplier.id})`);

  // ── 3. Create 10 employees (skip if email already taken) ───────────────
  const passwordHash = await hash(employeePassword, 10);
  const createdEmployees: Employee[] = [];

  for (const data of EMPLOYEE_NAMES) {
    const existing = await em.findOne(Identity, { where: { email: data.email } });
    if (existing) {
      console.log(`  [skip] ${data.name} (${data.email}) — already exists`);
      continue;
    }

    const employee = em.create(Employee, {
      id: ulid(),
      name: data.name,
      role: EmployeeRole.Basic,
      business,
      identity: em.create(Identity, {
        id: ulid(),
        email: data.email,
        passwordHash,
        type: IdentityType.Employee,
        isActive: true,
      }),
    });
    await em.save(Employee, employee);
    createdEmployees.push(employee);
    console.log(`  + Employee: ${data.name}`);
  }
  console.log(`Created ${createdEmployees.length} new employees.`);

  // ── 4. Create Serbian meals (skip if name+supplier already exists) ─────
  const existingMeals = await em.find(Meal, {
    where: { supplier: { id: supplier.id } },
    relations: ['supplier'],
  });
  const existingMealNames = new Set(existingMeals.map((m) => m.name));
  const allMeals: Meal[] = [...existingMeals];

  for (const data of SERBIAN_MEALS) {
    if (existingMealNames.has(data.name)) {
      console.log(`  [skip] Meal "${data.name}" — already exists`);
      const found = existingMeals.find((m) => m.name === data.name)!;
      if (!allMeals.includes(found)) allMeals.push(found);
      continue;
    }

    const meal = em.create(Meal, {
      id: ulid(),
      name: data.name,
      description: data.description,
      type: data.type,
      price: data.price,
      supplier,
    });
    await em.save(Meal, meal);
    allMeals.push(meal);
    console.log(`  + Meal: ${data.name}`);
  }

  // ── 5. Create menu period for next work week ───────────────────────────
  const menuPeriod = em.create(MenuPeriod, {
    id: ulid(),
    startDate: NEXT_WEEK.mon,
    endDate: NEXT_WEEK.fri,
    supplierId: supplier.id,
    supplier,
  });
  await em.save(MenuPeriod, menuPeriod);
  console.log(`\nMenu period: ${NEXT_WEEK.mon} – ${NEXT_WEEK.fri} (id: ${menuPeriod.id})`);

  // ── 6. Create menu items per day ───────────────────────────────────────
  const menuItemsByDay: Record<string, MenuItem[]> = {};
  const mealByName = new Map(allMeals.map((m) => [m.name, m]));

  for (const [day, mealNames] of Object.entries(DAILY_MEAL_NAMES)) {
    menuItemsByDay[day] = [];

    // Add day-specific Serbian meals
    for (const mealName of mealNames) {
      const meal = mealByName.get(mealName);
      if (!meal) continue;

      const menuItem = em.create(MenuItem, {
        id: ulid(),
        price: meal.price ?? null,
        menuPeriod,
        day,
        meal,
      });
      await em.save(MenuItem, menuItem);
      menuItemsByDay[day].push(menuItem);
    }

    // Pad with existing (non-Serbian) meals if present and not yet on this day
    const addedMealIds = new Set(menuItemsByDay[day].map((mi) => mi.meal.id));
    for (const existingMeal of existingMeals) {
      if (addedMealIds.has(existingMeal.id)) continue;
      if (SERBIAN_MEALS.some((s) => s.name === existingMeal.name)) continue; // already handled

      const menuItem = em.create(MenuItem, {
        id: ulid(),
        price: existingMeal.price ?? null,
        menuPeriod,
        day,
        meal: existingMeal,
      });
      await em.save(MenuItem, menuItem);
      menuItemsByDay[day].push(menuItem);
      addedMealIds.add(existingMeal.id);
    }

    console.log(`  Day ${day}: ${menuItemsByDay[day].length} menu items`);
  }

  // ── 7. Create meal selection window (deadline already passed) ──────────
  const selectionWindow = em.create(MealSelectionWindow, {
  id: ulid(),
  startTime: new Date('2026-05-18T07:00:00Z'), // opened last Monday
  endTime: new Date('2026-05-21T17:00:00Z'),   // deadline last Thursday — already passed
  business,
  targetDates: TARGET_DATES,
  menuPeriods: [menuPeriod],
  isLocked: false,
  notifyOnDeadline: false,
});
  await em.save(MealSelectionWindow, selectionWindow);
  console.log(`\nMeal selection window: deadline ${selectionWindow.endTime.toISOString()} (already passed)`);

  // ── 8. Create meal selections for all basic employees ─────────────────
  const allBasicEmployees = await em.find(Employee, {
    where: { business: { id: business.id }, role: EmployeeRole.Basic },
    relations: ['business'],
  });
  console.log(`\nCreating selections for ${allBasicEmployees.length} basic employees...`);

  let selectionCount = 0;
  for (const [empIdx, employee] of allBasicEmployees.entries()) {
    for (const [dayIdx, day] of TARGET_DATES.entries()) {
      const dayItems = menuItemsByDay[day];
      if (!dayItems?.length) continue;

      // Vary selections: each employee picks a different item on the same day
      const menuItem = dayItems[(empIdx + dayIdx) % dayItems.length];

      const selection = em.create(MealSelection, {
        id: ulid(),
        employeeId: employee.id,
        mealSelectionWindowId: selectionWindow.id,
        mealSelectionWindow: selectionWindow,
        date: day,
        menuItem,
        menuItemId: menuItem.id,
        quantity: 1,
      });
      await em.save(MealSelection, selection);
      selectionCount++;
    }
  }

  console.log(`Created ${selectionCount} meal selections.`);

  console.log('\n──────────────────────────────────────────');
  console.log('Seed data complete!');
  console.log(`  Employees created : ${createdEmployees.length} (password: ${employeePassword})`);
  console.log(`  Serbian meals added: ${allMeals.length - existingMeals.length}`);
  console.log(`  Menu period        : ${NEXT_WEEK.mon} – ${NEXT_WEEK.fri}`);
  console.log(`  Meal window ID     : ${selectionWindow.id}`);
  console.log(`  Selections created : ${selectionCount}`);
  console.log('──────────────────────────────────────────\n');

  await app.close();
}

seedData().catch((err) => {
  console.error('Seed data failed:', err.message ?? err);
  process.exit(1);
});
