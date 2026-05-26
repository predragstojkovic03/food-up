# Daily Order Overview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-day employee order overview Dialog to the manager's meal selection windows view, backed by a new server-side query endpoint that LEFT JOINs employees against selections.

**Architecture:** A new Query Repository (`MealSelectionOverviewQueryRepository`) runs raw SQL that CROSS JOINs all employees in the business against the window's target dates, then LEFT JOINs meal selection rows so the server derives ordered/skipped/no_record status. A new `GET /meal-selections/window/:windowId/daily-overview` endpoint returns `IWindowDailyOverviewItem[]`. On the frontend, a `useWindowDailyOverview` hook fetches the data when `WindowDetails` mounts; clicking an icon button next to any date header opens a `DailyOrderDialog` showing the table.

**Tech Stack:** NestJS 11, TypeORM 0.3, PostgreSQL 17 (raw SQL via `DataSource.query`), React 19, TanStack Query, shadcn Dialog, Tailwind CSS v4, react-i18next.

---

## File Map

| Action | Path |
|--------|------|
| Modify | `shared/src/interfaces/meal-selection.ts` |
| Create | `apps/server/src/core/meal-selections/application/queries/meal-selection-overview-query-repository.interface.ts` |
| Create | `apps/server/src/core/meal-selections/application/queries/dto/window-daily-overview-item.dto.ts` |
| Create | `apps/server/src/core/meal-selections/application/queries/meal-selection-overview-query.service.ts` |
| Create | `apps/server/src/core/meal-selections/application/queries/meal-selection-overview-query.service.spec.ts` |
| Create | `apps/server/src/core/meal-selections/infrastructure/persistence/meal-selection-overview-query-typeorm.repository.ts` |
| Modify | `apps/server/src/core/meal-selections/meal-selections.module.ts` |
| Modify | `apps/server/src/core/meal-selections/presentation/rest/meal-selections.controller.ts` |
| Modify | `apps/web/src/features/meal-selections/domain/meal-selection-service.interface.ts` |
| Modify | `apps/web/src/features/meal-selections/infrastructure/meal-selection.service.ts` |
| Create | `apps/web/src/features/meal-selections/application/use-window-daily-overview.hook.ts` |
| Create | `apps/web/src/features/meal-selection-windows/presentation/pages/components/daily-order-dialog.tsx` |
| Modify | `apps/web/src/features/meal-selection-windows/presentation/pages/meal-selection-windows.page.tsx` |
| Modify | `apps/web/src/i18n/en/meals.json` |
| Modify | `apps/web/src/i18n/sr/meals.json` |

---

## Task 1: Add `IWindowDailyOverviewItem` to shared

**Files:**
- Modify: `shared/src/interfaces/meal-selection.ts`

`shared/src/interfaces/index.ts` already re-exports everything from `meal-selection.ts`, so no changes needed there.

- [ ] **Step 1: Add the interface**

Append to `shared/src/interfaces/meal-selection.ts`:

```typescript
export interface IWindowDailyOverviewMeal {
  name: string;
  type: MealType;
}

export interface IWindowDailyOverviewItem {
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'ordered' | 'skipped' | 'no_record';
  meals: IWindowDailyOverviewMeal[];
}
```

- [ ] **Step 2: Build shared to verify no type errors**

```bash
cd /path/to/food-up && npm run build --workspace=shared
```

Expected: exits 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add shared/src/interfaces/meal-selection.ts
git commit -m "feat(shared): add IWindowDailyOverviewItem interface"
```

---

## Task 2: Create query repository interface and DTO

**Files:**
- Create: `apps/server/src/core/meal-selections/application/queries/meal-selection-overview-query-repository.interface.ts`
- Create: `apps/server/src/core/meal-selections/application/queries/dto/window-daily-overview-item.dto.ts`

- [ ] **Step 1: Create the DTO**

Create `apps/server/src/core/meal-selections/application/queries/dto/window-daily-overview-item.dto.ts`:

```typescript
import { MealType } from '@food-up/shared';

export interface WindowDailyOverviewItemDto {
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'ordered' | 'skipped' | 'no_record';
  meals: Array<{ name: string; type: MealType }>;
}
```

- [ ] **Step 2: Create the repository interface**

Create `apps/server/src/core/meal-selections/application/queries/meal-selection-overview-query-repository.interface.ts`:

```typescript
import { WindowDailyOverviewItemDto } from './dto/window-daily-overview-item.dto';

export const I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY = Symbol(
  'IMealSelectionOverviewQueryRepository',
);

export interface IMealSelectionOverviewQueryRepository {
  getDailyOverview(windowId: string): Promise<WindowDailyOverviewItemDto[]>;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/server/src/core/meal-selections/application/queries/
git commit -m "feat(server): add meal selection overview query repository interface and DTO"
```

---

## Task 3: Create the query service (TDD)

**Files:**
- Create: `apps/server/src/core/meal-selections/application/queries/meal-selection-overview-query.service.spec.ts`
- Create: `apps/server/src/core/meal-selections/application/queries/meal-selection-overview-query.service.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/server/src/core/meal-selections/application/queries/meal-selection-overview-query.service.spec.ts`:

```typescript
import { WindowDailyOverviewItemDto } from './dto/window-daily-overview-item.dto';
import { MealSelectionOverviewQueryService } from './meal-selection-overview-query.service';

describe('MealSelectionOverviewQueryService', () => {
  let service: MealSelectionOverviewQueryService;
  let mockRepository: { getDailyOverview: jest.Mock };

  beforeEach(() => {
    mockRepository = { getDailyOverview: jest.fn() };
    service = new MealSelectionOverviewQueryService(mockRepository as any);
  });

  describe('getDailyOverview', () => {
    it('delegates to the repository with the given windowId', async () => {
      mockRepository.getDailyOverview.mockResolvedValue([]);

      await service.getDailyOverview('window-1');

      expect(mockRepository.getDailyOverview).toHaveBeenCalledWith('window-1');
    });

    it('returns the items from the repository', async () => {
      const items: WindowDailyOverviewItemDto[] = [
        {
          employeeId: 'e-1',
          employeeName: 'Alice',
          date: '2026-05-26',
          status: 'ordered',
          meals: [],
        },
      ];
      mockRepository.getDailyOverview.mockResolvedValue(items);

      const result = await service.getDailyOverview('window-1');

      expect(result).toBe(items);
    });
  });
});
```

- [ ] **Step 2: Run the test — verify it fails**

```bash
cd apps/server && npx jest meal-selection-overview-query.service.spec.ts --no-coverage
```

Expected: FAIL — `Cannot find module './meal-selection-overview-query.service'`

- [ ] **Step 3: Implement the service**

Create `apps/server/src/core/meal-selections/application/queries/meal-selection-overview-query.service.ts`:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import {
  I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY,
  IMealSelectionOverviewQueryRepository,
} from './meal-selection-overview-query-repository.interface';
import { WindowDailyOverviewItemDto } from './dto/window-daily-overview-item.dto';

@Injectable()
export class MealSelectionOverviewQueryService {
  constructor(
    @Inject(I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY)
    private readonly _repository: IMealSelectionOverviewQueryRepository,
  ) {}

  getDailyOverview(windowId: string): Promise<WindowDailyOverviewItemDto[]> {
    return this._repository.getDailyOverview(windowId);
  }
}
```

- [ ] **Step 4: Run the test — verify it passes**

```bash
cd apps/server && npx jest meal-selection-overview-query.service.spec.ts --no-coverage
```

Expected: PASS — 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/core/meal-selections/application/queries/
git commit -m "feat(server): add MealSelectionOverviewQueryService with tests"
```

---

## Task 4: Create the TypeORM query repository

**Files:**
- Create: `apps/server/src/core/meal-selections/infrastructure/persistence/meal-selection-overview-query-typeorm.repository.ts`

The query LEFT JOINs all employees in the business against the window's target dates (via `UNNEST`) and then against `meal_selection` rows. Status is derived in the mapping layer: `mealSelectionId IS NULL` → `no_record`; all `menuItemId` null → `skipped`; any non-null `menuItemId` → `ordered`.

- [ ] **Step 1: Create the repository**

Create `apps/server/src/core/meal-selections/infrastructure/persistence/meal-selection-overview-query-typeorm.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { MealType } from '@food-up/shared';
import { DataSource } from 'typeorm';
import { IMealSelectionOverviewQueryRepository } from '../../application/queries/meal-selection-overview-query-repository.interface';
import { WindowDailyOverviewItemDto } from '../../application/queries/dto/window-daily-overview-item.dto';

interface RawRow {
  employeeId: string;
  employeeName: string;
  date: string;
  mealSelectionId: string | null;
  mealName: string | null;
  mealType: string | null;
}

@Injectable()
export class MealSelectionOverviewQueryTypeOrmRepository
  implements IMealSelectionOverviewQueryRepository
{
  constructor(@InjectDataSource() private readonly _dataSource: DataSource) {}

  async getDailyOverview(windowId: string): Promise<WindowDailyOverviewItemDto[]> {
    const rows: RawRow[] = await this._dataSource.query(
      `
      SELECT
        e.id                   AS "employeeId",
        e.name                 AS "employeeName",
        dates.date::text       AS date,
        ms.id                  AS "mealSelectionId",
        meal.name              AS "mealName",
        meal.type              AS "mealType"
      FROM employee e
      CROSS JOIN (
        SELECT UNNEST(w.target_dates) AS date
        FROM meal_selection_window w
        WHERE w.id = $1
      ) dates
      LEFT JOIN meal_selection ms
        ON  ms.employee_id               = e.id
        AND ms.meal_selection_window_id  = $1
        AND ms.date                      = dates.date
      LEFT JOIN menu_item mi ON mi.id   = ms.menu_item_id
      LEFT JOIN meal       ON meal.id   = mi.meal_id
      WHERE e.business_id = (
        SELECT business_id FROM meal_selection_window WHERE id = $1
      )
      ORDER BY e.name, dates.date
      `,
      [windowId],
    );

    return this._mapRows(rows);
  }

  private _mapRows(rows: RawRow[]): WindowDailyOverviewItemDto[] {
    const grouped = new Map<
      string,
      { employeeId: string; employeeName: string; date: string; rows: RawRow[] }
    >();

    for (const row of rows) {
      const key = `${row.employeeId}::${row.date}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          employeeId: row.employeeId,
          employeeName: row.employeeName,
          date: row.date,
          rows: [],
        });
      }
      grouped.get(key)!.rows.push(row);
    }

    return [...grouped.values()].map(({ employeeId, employeeName, date, rows: groupRows }) => {
      const hasAnyRecord = groupRows.some((r) => r.mealSelectionId !== null);
      const meals = groupRows
        .filter((r) => r.mealName !== null)
        .map((r) => ({ name: r.mealName!, type: r.mealType as MealType }));

      let status: 'ordered' | 'skipped' | 'no_record';
      if (!hasAnyRecord) {
        status = 'no_record';
      } else if (meals.length === 0) {
        status = 'skipped';
      } else {
        status = 'ordered';
      }

      return { employeeId, employeeName, date, status, meals };
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/server/src/core/meal-selections/infrastructure/persistence/meal-selection-overview-query-typeorm.repository.ts
git commit -m "feat(server): add MealSelectionOverviewQueryTypeOrmRepository"
```

---

## Task 5: Wire up module and add controller endpoint

**Files:**
- Modify: `apps/server/src/core/meal-selections/meal-selections.module.ts`
- Modify: `apps/server/src/core/meal-selections/presentation/rest/meal-selections.controller.ts`

- [ ] **Step 1: Register providers in the module**

Replace the content of `apps/server/src/core/meal-selections/meal-selections.module.ts`:

```typescript
import { Module, Provider } from '@nestjs/common';
import { EmployeesModule } from '../employees/employees.module';
import { MealSelectionWindowsModule } from '../meal-selection-windows/meal-selection-windows.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { MenuPeriodsModule } from '../menu-periods/menu-periods.module';
import { MealSelectionsService } from './application/meal-selections.service';
import { I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY } from './application/queries/meal-selection-overview-query-repository.interface';
import { MealSelectionOverviewQueryService } from './application/queries/meal-selection-overview-query.service';
import { MealSelectionsRepositoryProvide } from './infrastructure/meal-selections.providers';
import { MealSelectionOverviewQueryTypeOrmRepository } from './infrastructure/persistence/meal-selection-overview-query-typeorm.repository';
import { MealSelectionsController } from './presentation/rest/meal-selections.controller';

const MealSelectionOverviewQueryRepositoryProvider: Provider = {
  provide: I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY,
  useClass: MealSelectionOverviewQueryTypeOrmRepository,
};

@Module({
  imports: [
    MenuPeriodsModule,
    EmployeesModule,
    MenuItemsModule,
    MealSelectionWindowsModule,
  ],
  controllers: [MealSelectionsController],
  providers: [
    MealSelectionsRepositoryProvide,
    MealSelectionOverviewQueryRepositoryProvider,
    MealSelectionsService,
    MealSelectionOverviewQueryService,
  ],
  exports: [MealSelectionsService],
})
export class MealSelectionsModule {}
```

- [ ] **Step 2: Add the controller endpoint**

In `apps/server/src/core/meal-selections/presentation/rest/meal-selections.controller.ts`:

Add `MealSelectionOverviewQueryService` import and constructor injection, then add the new endpoint. The full updated file:

```typescript
import { EmployeeRole, IdentityType } from '@food-up/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CurrentIdentity } from 'src/core/auth/infrastructure/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { RequiredEmployeeRole } from 'src/core/employees/presentation/rest/employee-role.decorator';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { MealSelectionsService } from '../../application/meal-selections.service';
import { MealSelectionOverviewQueryService } from '../../application/queries/meal-selection-overview-query.service';
import { WindowDailyOverviewItemDto } from '../../application/queries/dto/window-daily-overview-item.dto';
import { MealSelection } from '../../domain/meal-selection.entity';
import { CreateMealSelectionDto } from './dto/create-meal-selection.dto';
import { MealSelectionResponseDto } from './dto/meal-selection-response.dto';
import { MyMealSelectionResponseDto } from './dto/my-meal-selection-response.dto';
import { UpdateMealSelectionDto } from './dto/update-meal-selection.dto';

@ApiTags('MealSelections')
@Controller('meal-selections')
export class MealSelectionsController {
  constructor(
    private readonly _mealSelectionsService: MealSelectionsService,
    private readonly _overviewQueryService: MealSelectionOverviewQueryService,
  ) {}

  @ApiOperation({ summary: 'Create a new meal selection' })
  @ApiResponse({
    status: 201,
    description: 'Meal selection created',
    type: MealSelectionResponseDto,
  })
  @RequiredIdentityType(IdentityType.Employee)
  @ApiBearerAuth()
  @Post()
  async create(
    @Body() dto: CreateMealSelectionDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MealSelectionResponseDto> {
    const result = await this._mealSelectionsService.create(sub, dto);
    return this.toResponseDto(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal selections' })
  @ApiResponse({
    status: 200,
    description: 'List of meal selections',
    type: [MealSelectionResponseDto],
  })
  @ApiBearerAuth()
  async findAll(): Promise<MealSelectionResponseDto[]> {
    const result = await this._mealSelectionsService.findAll();
    return result.map(this.toResponseDto);
  }

  @RequiredIdentityType(IdentityType.Employee)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @ApiBearerAuth()
  @Get('window/:windowId')
  @ApiOperation({
    summary: 'Get all meal selections for a window (manager view)',
  })
  @ApiResponse({ status: 200, type: [MealSelectionResponseDto] })
  async findByWindow(
    @Param('windowId') windowId: string,
  ): Promise<MealSelectionResponseDto[]> {
    const result = await this._mealSelectionsService.findByWindow(windowId);
    return result.map((e) => this.toResponseDto(e));
  }

  @RequiredIdentityType(IdentityType.Employee)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @ApiBearerAuth()
  @Get('window/:windowId/daily-overview')
  @ApiOperation({
    summary: 'Get per-employee daily order overview for a window (manager view)',
  })
  @ApiResponse({ status: 200, description: 'List of per-employee per-day overview items' })
  async getDailyOverview(
    @Param('windowId') windowId: string,
  ): Promise<WindowDailyOverviewItemDto[]> {
    return this._overviewQueryService.getDailyOverview(windowId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meal selection by ID' })
  @ApiResponse({
    status: 200,
    description: 'Meal selection found',
    type: MealSelectionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Meal selection not found' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<MealSelectionResponseDto> {
    const result = await this._mealSelectionsService.findOne(id);
    return this.toResponseDto(result);
  }

  @ApiOperation({ summary: 'Update a meal selection' })
  @ApiResponse({
    status: 200,
    description: 'Meal selection updated',
    type: MealSelectionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Meal selection not found' })
  @RequiredIdentityType(IdentityType.Employee)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMealSelectionDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MealSelectionResponseDto> {
    const result = await this._mealSelectionsService.update(id, sub, dto);
    return this.toResponseDto(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal selection' })
  @ApiResponse({ status: 200, description: 'Meal selection deleted' })
  @ApiResponse({ status: 404, description: 'Meal selection not found' })
  @ApiBearerAuth()
  async delete(@Param('id') id: string): Promise<void> {
    return this._mealSelectionsService.delete(id);
  }

  @RequiredIdentityType(IdentityType.Employee)
  @ApiBearerAuth()
  @Get('my/window/:windowId')
  @ApiOperation({ summary: 'Get current employee selections for a window' })
  @ApiResponse({ status: 200, type: [MyMealSelectionResponseDto] })
  async findMySelectionsForWindow(
    @Param('windowId') windowId: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MyMealSelectionResponseDto[]> {
    return plainToInstance(
      MyMealSelectionResponseDto,
      await this._mealSelectionsService.findMySelectionsForWindow(sub, windowId),
    );
  }

  private toResponseDto(entity: MealSelection): MealSelectionResponseDto {
    const dto: MealSelectionResponseDto = {
      id: entity.id,
      employeeId: entity.employeeId,
      menuItemId: entity.menuItemId ?? null,
      mealSelectionWindowId: entity.mealSelectionWindowId,
      date: entity.date,
      quantity: entity.quantity,
    };
    return plainToInstance(MealSelectionResponseDto, dto);
  }
}
```

**Important:** The new `GET window/:windowId/daily-overview` route must be declared BEFORE `GET :id` in the file — Express resolves routes in order and `daily-overview` would be matched as an `:id` param if it comes later. The file above already has the correct order.

- [ ] **Step 3: Run server tests to confirm nothing broke**

```bash
cd apps/server && npx jest --no-coverage
```

Expected: all existing tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/server/src/core/meal-selections/
git commit -m "feat(server): wire daily overview query service and add GET window/:windowId/daily-overview endpoint"
```

---

## Task 6: Add `getDailyOverview` to the frontend service

**Files:**
- Modify: `apps/web/src/features/meal-selections/domain/meal-selection-service.interface.ts`
- Modify: `apps/web/src/features/meal-selections/infrastructure/meal-selection.service.ts`

- [ ] **Step 1: Extend the interface**

In `apps/web/src/features/meal-selections/domain/meal-selection-service.interface.ts`, add the import and method:

```typescript
import {
  ICreateMealSelection,
  IMealSelectionResponse,
  IMyMealSelectionResponse,
  IUpdateMealSelection,
  IWindowDailyOverviewItem,
} from '@food-up/shared';

export interface IMealSelectionService {
  getByWindow(windowId: string): Promise<IMealSelectionResponse[]>;
  getMySelectionsForWindow(windowId: string): Promise<IMyMealSelectionResponse[]>;
  getDailyOverview(windowId: string): Promise<IWindowDailyOverviewItem[]>;
  create(data: ICreateMealSelection): Promise<IMealSelectionResponse>;
  update(id: string, data: IUpdateMealSelection): Promise<IMealSelectionResponse>;
}
```

- [ ] **Step 2: Implement the method in the service**

In `apps/web/src/features/meal-selections/infrastructure/meal-selection.service.ts`, add the import and implementation:

```typescript
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import {
  ICreateMealSelection,
  IMealSelectionResponse,
  IMyMealSelectionResponse,
  IUpdateMealSelection,
  IWindowDailyOverviewItem,
} from '@food-up/shared';
import { IMealSelectionService } from '../domain/meal-selection-service.interface';

export class MealSelectionService implements IMealSelectionService {
  constructor(private readonly http: HttpClient) {}

  getByWindow(windowId: string): Promise<IMealSelectionResponse[]> {
    return this.http.get<IMealSelectionResponse[]>(`/api/meal-selections/window/${windowId}`);
  }

  getMySelectionsForWindow(windowId: string): Promise<IMyMealSelectionResponse[]> {
    return this.http.get<IMyMealSelectionResponse[]>(`/api/meal-selections/my/window/${windowId}`);
  }

  getDailyOverview(windowId: string): Promise<IWindowDailyOverviewItem[]> {
    return this.http.get<IWindowDailyOverviewItem[]>(
      `/api/meal-selections/window/${windowId}/daily-overview`,
    );
  }

  create(data: ICreateMealSelection): Promise<IMealSelectionResponse> {
    return this.http.post<ICreateMealSelection, IMealSelectionResponse>('/api/meal-selections', data);
  }

  update(id: string, data: IUpdateMealSelection): Promise<IMealSelectionResponse> {
    return this.http.patch<IUpdateMealSelection, IMealSelectionResponse>(
      `/api/meal-selections/${id}`,
      data,
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/meal-selections/
git commit -m "feat(web): add getDailyOverview to meal selection service"
```

---

## Task 7: Create `useWindowDailyOverview` hook

**Files:**
- Create: `apps/web/src/features/meal-selections/application/use-window-daily-overview.hook.ts`

- [ ] **Step 1: Create the hook**

Create `apps/web/src/features/meal-selections/application/use-window-daily-overview.hook.ts`:

```typescript
import { useServices } from '@/shared/infrastructure/di/service.context';
import { IWindowDailyOverviewItem } from '@food-up/shared';
import { useQuery } from '@tanstack/react-query';

export function useWindowDailyOverview(windowId: string) {
  const { mealSelectionService } = useServices();
  return useQuery<IWindowDailyOverviewItem[]>({
    queryKey: ['meal-selections', 'daily-overview', windowId],
    queryFn: () => mealSelectionService.getDailyOverview(windowId),
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/meal-selections/application/use-window-daily-overview.hook.ts
git commit -m "feat(web): add useWindowDailyOverview hook"
```

---

## Task 8: Add i18n keys

**Files:**
- Modify: `apps/web/src/i18n/en/meals.json`
- Modify: `apps/web/src/i18n/sr/meals.json`

The new keys live under `windows.detail.dailyOverview`.

- [ ] **Step 1: Add English keys**

Inside `apps/web/src/i18n/en/meals.json`, add inside `"windows" > "detail"` (after the `"costSummary"` block, before the closing brace of `"detail"`):

```json
"dailyOverview": {
  "triggerLabel": "View orders",
  "dialogTitle": "Orders for {{date}}",
  "colEmployee": "Employee",
  "colMeals": "Meals ordered",
  "colStatus": "Status",
  "statusOrdered": "Ordered",
  "statusSkipped": "Skipped",
  "noMeals": "—",
  "loadingError": "Failed to load order overview."
}
```

- [ ] **Step 2: Add Serbian keys**

Inside `apps/web/src/i18n/sr/meals.json`, add inside `"windows" > "detail"` in the same position:

```json
"dailyOverview": {
  "triggerLabel": "Pogledaj narudžbine",
  "dialogTitle": "Narudžbine za {{date}}",
  "colEmployee": "Zaposleni",
  "colMeals": "Naručeni obroci",
  "colStatus": "Status",
  "statusOrdered": "Naručeno",
  "statusSkipped": "Preskočeno",
  "noMeals": "—",
  "loadingError": "Nije moguće učitati pregled narudžbina."
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/i18n/
git commit -m "feat(web): add dailyOverview i18n keys for meals namespace"
```

---

## Task 9: Create `DailyOrderDialog` component

**Files:**
- Create: `apps/web/src/features/meal-selection-windows/presentation/pages/components/daily-order-dialog.tsx`

This component is co-located with `WindowDetails` because it only exists to serve the windows page.

- [ ] **Step 1: Create the component**

Create `apps/web/src/features/meal-selection-windows/presentation/pages/components/daily-order-dialog.tsx`:

```typescript
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWindowDailyOverview } from '@/features/meal-selections/application/use-window-daily-overview.hook';
import { IWindowDailyOverviewItem } from '@food-up/shared';
import { useTranslation } from 'react-i18next';

interface DailyOrderDialogProps {
  windowId: string;
  date: string | null;
  formattedDate: string;
  onClose: () => void;
}

export function DailyOrderDialog({
  windowId,
  date,
  formattedDate,
  onClose,
}: DailyOrderDialogProps) {
  const { t } = useTranslation('meals');
  const { data: items = [], isError } = useWindowDailyOverview(windowId);

  const dayItems = date ? items.filter((item) => item.date === date) : [];

  return (
    <Dialog open={date !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className='max-w-2xl max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>
            {t('windows.detail.dailyOverview.dialogTitle', { date: formattedDate })}
          </DialogTitle>
        </DialogHeader>

        {isError && (
          <p className='text-sm text-destructive py-4 text-center'>
            {t('windows.detail.dailyOverview.loadingError')}
          </p>
        )}

        {!isError && (
          <div className='overflow-y-auto flex-1'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b bg-muted/40 text-xs font-medium text-muted-foreground'>
                  <th className='px-3 py-2 text-left font-medium'>
                    {t('windows.detail.dailyOverview.colEmployee')}
                  </th>
                  <th className='px-3 py-2 text-left font-medium'>
                    {t('windows.detail.dailyOverview.colMeals')}
                  </th>
                  <th className='px-3 py-2 text-left font-medium'>
                    {t('windows.detail.dailyOverview.colStatus')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {dayItems.map((item) => (
                  <DailyOrderRow key={item.employeeId} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DailyOrderRow({ item }: { item: IWindowDailyOverviewItem }) {
  const { t } = useTranslation('meals');

  const rowClass =
    item.status === 'no_record'
      ? 'border-b bg-destructive/10 last:border-b-0'
      : 'border-b last:border-b-0';

  return (
    <tr className={rowClass}>
      <td className='px-3 py-2.5 font-medium'>{item.employeeName}</td>
      <td className='px-3 py-2.5 text-muted-foreground'>
        {item.meals.length > 0
          ? item.meals.map((m) => m.name).join(', ')
          : t('windows.detail.dailyOverview.noMeals')}
      </td>
      <td className='px-3 py-2.5'>
        {item.status === 'ordered' && (
          <Badge variant='default' className='text-xs'>
            {t('windows.detail.dailyOverview.statusOrdered')}
          </Badge>
        )}
        {item.status === 'skipped' && (
          <Badge variant='secondary' className='text-xs'>
            {t('windows.detail.dailyOverview.statusSkipped')}
          </Badge>
        )}
      </td>
    </tr>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/meal-selection-windows/presentation/pages/components/daily-order-dialog.tsx
git commit -m "feat(web): add DailyOrderDialog component"
```

---

## Task 10: Integrate into `WindowDetails`

**Files:**
- Modify: `apps/web/src/features/meal-selection-windows/presentation/pages/meal-selection-windows.page.tsx`

`WindowDetails` starts at line 373. Changes needed:
1. Import `useState`, `DailyOrderDialog`, `useWindowDailyOverview`, `Users` (lucide).
2. Add `openDate` state.
3. Call `useWindowDailyOverview(windowId)` — data pre-fetches immediately so Dialog opens instantly.
4. Wrap each date header in a `flex items-center justify-between` container and add the icon button.
5. Render `<DailyOrderDialog>` once below the main `return` body.

- [ ] **Step 1: Add imports**

At the top of `meal-selection-windows.page.tsx`, add to the existing import blocks:

```typescript
import { useState } from 'react';
import { Users } from 'lucide-react';
import { DailyOrderDialog } from './components/daily-order-dialog';
import { useWindowDailyOverview } from '@/features/meal-selections/application/use-window-daily-overview.hook';
```

(`useState` may already be imported — check first and only add if missing.)

- [ ] **Step 2: Add state and pre-fetch inside `WindowDetails`**

Inside `function WindowDetails(...)`, add after the existing `useQuery` calls:

```typescript
const [openDate, setOpenDate] = useState<string | null>(null);
useWindowDailyOverview(windowId); // pre-fetch so Dialog opens instantly
```

- [ ] **Step 3: Compute `openDateFormatted` for the Dialog title**

Inside `WindowDetails`, add after `openDate` state:

```typescript
const openDateFormatted = openDate
  ? new Date(openDate + 'T00:00:00').toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    })
  : '';
```

- [ ] **Step 4: Replace the date section header `<h3>` with a flex row**

Find this block (around line 428):

```tsx
<h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2'>
  {new Date(date + 'T00:00:00').toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })}
</h3>
```

Replace with:

```tsx
<div className='flex items-center justify-between mb-2'>
  <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
    {new Date(date + 'T00:00:00').toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    })}
  </h3>
  <button
    type='button'
    onClick={() => setOpenDate(date)}
    className='p-1 text-muted-foreground hover:text-foreground transition-colors'
    title={t('windows.detail.dailyOverview.triggerLabel')}
  >
    <Users className='size-4' />
  </button>
</div>
```

- [ ] **Step 5: Render the Dialog after the main content**

At the end of the `return (...)` block of `WindowDetails`, just before the closing `</div>`, add:

```tsx
<DailyOrderDialog
  windowId={windowId}
  date={openDate}
  formattedDate={openDateFormatted}
  onClose={() => setOpenDate(null)}
/>
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/features/meal-selection-windows/presentation/pages/meal-selection-windows.page.tsx
git commit -m "feat(web): integrate DailyOrderDialog into WindowDetails"
```

---

## Task 11: End-to-end verification

- [ ] **Step 1: Start the dev server**

```bash
npm run start:dev
```

- [ ] **Step 2: Seed a test scenario if needed**

Ensure at least one meal selection window exists in the DB with multiple target dates and a mix of:
- Employees who ordered (have selection rows with non-null `menuItemId`)
- Employees who skipped (have selection rows with `menuItemId = null`)
- Employees who never opened the wizard (no selection row at all for that date)

- [ ] **Step 3: Verify manager flow**

1. Log in as a manager.
2. Navigate to Meal Selection Windows.
3. Expand a window — confirm the date headers still look correct.
4. Click the `Users` icon button next to a date.
5. Confirm the Dialog opens with the correct date in the title.
6. Confirm ordered employees appear with meal names and "Ordered" badge.
7. Confirm skipped employees appear with `—` and "Skipped" badge, no red highlight.
8. Confirm no-record employees have `bg-destructive/10` row (red tint) and no badge.
9. Confirm rows are sorted alphabetically by employee name.
10. Click a different date's icon — Dialog updates instantly (no loading flash).
11. Close the Dialog via X button and backdrop click.

- [ ] **Step 4: Verify regression — existing functionality unchanged**

1. Confirm window expand/collapse still works.
2. Confirm XLSX download still works.
3. Confirm the existing `GET /meal-selections/window/:windowId` endpoint still returns correct data (check via network tab or Swagger at `/api/docs`).

- [ ] **Step 5: Switch language to Serbian**

1. Change language to Serbian in Account Settings.
2. Reopen the Dialog — confirm column headers and status badges are in Serbian.
3. Confirm the Dialog title date is formatted correctly in Serbian (Latin script, not Cyrillic).
