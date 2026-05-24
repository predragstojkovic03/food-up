# Extra Quantities for Non-Employee Guests — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow managers to add extra meal quantities for non-employee guests, with optional guest names that appear as individual rows in XLSX day sheets; extras are silently merged into supplier totals everywhere else; a cost summary panel shows estimated spend per supplier.

**Architecture:** New `ExtraQuantity` entity + repository in its own DDD module under `apps/server/src/core/extra-quantities/`. Extras are merged into order totals by extending `OrderSummaryQueryTypeOrmRepository` with a fourth query source. A new `GET /reports/cost-summary` endpoint aggregates costs across all four sources. Two new React components (`ExtraQuantitiesSection`, `CostSummarySection`) render below the XLSX download button inside the expired-window detail panel. The extras meal dropdown needs supplier names, so `IWindowMenuItemResponse` is extended with `supplierId` and `supplierName`.

**Tech Stack:** NestJS 11, TypeORM 0.3, PostgreSQL, React 19, TanStack Query, react-i18next, Tailwind CSS v4, shadcn/ui

---

## File Map

**New (backend)**
- `apps/server/src/core/extra-quantities/domain/extra-quantity.entity.ts`
- `apps/server/src/core/extra-quantities/domain/extra-quantities.repository.interface.ts`
- `apps/server/src/core/extra-quantities/infrastructure/persistence/extra-quantity.typeorm-entity.ts`
- `apps/server/src/core/extra-quantities/infrastructure/persistence/extra-quantities-typeorm.repository.ts`
- `apps/server/src/core/extra-quantities/application/extra-quantities.service.ts`
- `apps/server/src/core/extra-quantities/presentation/rest/dto/create-extra-quantity.dto.ts`
- `apps/server/src/core/extra-quantities/presentation/rest/dto/extra-quantity-response.dto.ts`
- `apps/server/src/core/extra-quantities/presentation/rest/extra-quantities.controller.ts`
- `apps/server/src/core/extra-quantities/extra-quantities.module.ts`
- `apps/server/src/core/reports/presentation/rest/dto/window-cost-summary-response.dto.ts`

**New (shared)**
- `shared/src/interfaces/extra-quantity.ts`

**New (frontend)**
- `apps/web/src/features/extra-quantities/domain/extra-quantity-service.interface.ts`
- `apps/web/src/features/extra-quantities/infrastructure/extra-quantity.service.ts`

**Modified**
- `shared/src/interfaces/index.ts`
- `shared/src/interfaces/meal-selection-window.ts`
- `apps/server/src/core/menu-items/application/queries/dto/find-menu-items-with-meals.dto.ts`
- `apps/server/src/core/menu-items/infrastructure/persistence/menu-items-query-typeorm.repository.ts`
- `apps/server/src/core/meal-selection-windows/presentation/rest/dto/window-menu-item-response.dto.ts`
- `apps/server/src/core/reports/application/queries/order-summary-query-repository.interface.ts`
- `apps/server/src/core/reports/infrastructure/persistence/order-summary-query-typeorm.repository.ts`
- `apps/server/src/core/reports/application/reports.service.ts`
- `apps/server/src/core/reports/presentation/rest/reports.controller.ts`
- `apps/server/src/core/core.module.ts`
- `apps/web/src/features/reports/domain/report-service.interface.ts`
- `apps/web/src/features/reports/infrastructure/report.service.ts`
- `apps/web/src/shared/infrastructure/di/service-container.ts`
- `apps/web/src/app/app-providers.tsx`
- `apps/web/src/i18n/en/meals.json`
- `apps/web/src/i18n/sr/meals.json`
- `apps/web/src/features/meal-selection-windows/presentation/pages/meal-selection-windows.page.tsx`

---

## Task 1: Shared interfaces

**Files:**
- Create: `shared/src/interfaces/extra-quantity.ts`
- Modify: `shared/src/interfaces/index.ts`
- Modify: `shared/src/interfaces/meal-selection-window.ts`

- [ ] **Step 1: Create `shared/src/interfaces/extra-quantity.ts`**

```ts
export interface IExtraQuantity {
  id: string;
  windowId: string;
  menuItemId: string;
  quantity: number;
  guestName: string | null;
}

export interface IWindowCostSummary {
  supplierId: string;
  supplierName: string;
  totalCost: number;
}
```

- [ ] **Step 2: Export from `shared/src/interfaces/index.ts`**

Add this line to the end of the file:
```ts
export * from './extra-quantity';
```

- [ ] **Step 3: Extend `IWindowMenuItemResponse` in `shared/src/interfaces/meal-selection-window.ts`**

The extras meal dropdown must show `"meal.name — supplierName"`. Add `supplierId` and `supplierName` to both `IWindowMenuItemResponse` and `ICurrentWindowMenuItem`:

```ts
export interface ICurrentWindowMenuItem {
  id: string;
  day: string;
  price?: number;
  supplierId: string;
  supplierName: string;
  meal: IWindowMenuItemMeal;
}

export interface IWindowMenuItemResponse {
  id: string;
  day: string;
  price?: number;
  supplierId: string;
  supplierName: string;
  meal: IWindowMenuItemMeal;
}
```

- [ ] **Step 4: Commit**

```bash
git add shared/src/interfaces/extra-quantity.ts shared/src/interfaces/index.ts shared/src/interfaces/meal-selection-window.ts
git commit -m "feat(shared): add IExtraQuantity, IWindowCostSummary; add supplierId/supplierName to IWindowMenuItemResponse"
```

---

## Task 2: Extend menu item query with supplier info

The backend `findWithMealsByMenuPeriodIds` query doesn't currently join to the supplier. This task wires supplier data into the response so the frontend dropdown can display it.

**Files:**
- Modify: `apps/server/src/core/menu-items/application/queries/dto/find-menu-items-with-meals.dto.ts`
- Modify: `apps/server/src/core/menu-items/infrastructure/persistence/menu-items-query-typeorm.repository.ts`
- Modify: `apps/server/src/core/meal-selection-windows/presentation/rest/dto/window-menu-item-response.dto.ts`

- [ ] **Step 1: Add `supplierId` and `supplierName` to `MenuItemWithMealDto`**

Full replacement of `apps/server/src/core/menu-items/application/queries/dto/find-menu-items-with-meals.dto.ts`:

```ts
import { MealType } from '@food-up/shared';

type MealDto = {
  name: string;
  description: string;
  type: MealType;
};

export type MenuItemWithMealDto = {
  id: string;
  day: string;
  price?: number;
  supplierId: string;
  supplierName: string;
  meal: MealDto;
};
```

- [ ] **Step 2: Update the query to join supplier**

Full replacement of `apps/server/src/core/menu-items/infrastructure/persistence/menu-items-query-typeorm.repository.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';
import { MenuItemWithMealDto } from '../../application/queries/dto/find-menu-items-with-meals.dto';
import { IMenuItemsQueryRepository } from '../../application/queries/menu-items-query-repository.interface';
import { MenuItem } from './menu-item.typeorm-entity';

@Injectable()
export class MenuItemsQueryTypeOrmRepository
  implements IMenuItemsQueryRepository
{
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private get _repository(): Repository<MenuItem> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(MenuItem)
      : this._dataSource.getRepository(MenuItem);
  }

  async findWithMealsByMenuPeriodIds(
    menuPeriodIds: string[],
  ): Promise<MenuItemWithMealDto[]> {
    const menuItems = await this._repository
      .createQueryBuilder('menuItem')
      .leftJoinAndSelect('menuItem.meal', 'meal')
      .leftJoinAndSelect('menuItem.menuPeriod', 'menuPeriod')
      .leftJoinAndSelect('menuPeriod.supplier', 'supplier')
      .where('menuPeriod.id IN (:...menuPeriodIds)', { menuPeriodIds })
      .getMany();

    return menuItems.map((menuItem) => ({
      id: menuItem.id,
      day: menuItem.day,
      price: menuItem.price ?? undefined,
      supplierId: menuItem.menuPeriod.supplierId,
      supplierName: menuItem.menuPeriod.supplier.name,
      meal: {
        name: menuItem.meal.name,
        description: menuItem.meal.description,
        type: menuItem.meal.type,
      },
    }));
  }
}
```

- [ ] **Step 3: Expose new fields in `WindowMenuItemResponseDto`**

Full replacement of `apps/server/src/core/meal-selection-windows/presentation/rest/dto/window-menu-item-response.dto.ts`:

```ts
import { IWindowMenuItemMeal, IWindowMenuItemResponse, MealType } from '@food-up/shared';
import { Expose, Type } from 'class-transformer';

export class WindowMenuItemMealDto implements IWindowMenuItemMeal {
  @Expose() name: string;
  @Expose() description: string;
  @Expose() type: MealType;
}

export class WindowMenuItemResponseDto implements IWindowMenuItemResponse {
  @Expose() id: string;
  @Expose() day: string;
  @Expose() price?: number;
  @Expose() supplierId: string;
  @Expose() supplierName: string;

  @Expose()
  @Type(() => WindowMenuItemMealDto)
  meal: WindowMenuItemMealDto;
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/server/src/core/menu-items/application/queries/dto/find-menu-items-with-meals.dto.ts \
        apps/server/src/core/menu-items/infrastructure/persistence/menu-items-query-typeorm.repository.ts \
        apps/server/src/core/meal-selection-windows/presentation/rest/dto/window-menu-item-response.dto.ts
git commit -m "feat(menu-items): include supplierId and supplierName in window menu item response"
```

---

## Task 3: Domain layer — ExtraQuantity entity + repository interface

**Files:**
- Create: `apps/server/src/core/extra-quantities/domain/extra-quantity.entity.ts`
- Create: `apps/server/src/core/extra-quantities/domain/extra-quantities.repository.interface.ts`

- [ ] **Step 1: Create the domain entity**

`apps/server/src/core/extra-quantities/domain/extra-quantity.entity.ts`:

```ts
import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';

export class ExtraQuantity extends Entity {
  private constructor(
    private readonly _id: string,
    private readonly _windowId: string,
    private readonly _menuItemId: string,
    private readonly _quantity: number,
    private readonly _guestName: string | null,
  ) {
    super();
  }

  static create(
    windowId: string,
    menuItemId: string,
    quantity: number,
    guestName: string | null,
  ): ExtraQuantity {
    return new ExtraQuantity(generateId(), windowId, menuItemId, quantity, guestName);
  }

  static reconstitute(
    id: string,
    windowId: string,
    menuItemId: string,
    quantity: number,
    guestName: string | null,
  ): ExtraQuantity {
    return new ExtraQuantity(id, windowId, menuItemId, quantity, guestName);
  }

  get id(): string { return this._id; }
  get windowId(): string { return this._windowId; }
  get menuItemId(): string { return this._menuItemId; }
  get quantity(): number { return this._quantity; }
  get guestName(): string | null { return this._guestName; }
}
```

- [ ] **Step 2: Create the repository interface**

`apps/server/src/core/extra-quantities/domain/extra-quantities.repository.interface.ts`:

```ts
import { ExtraQuantity } from './extra-quantity.entity';

export const I_EXTRA_QUANTITIES_REPOSITORY = Symbol('IExtraQuantitiesRepository');

export interface IExtraQuantitiesRepository {
  insert(entity: ExtraQuantity): Promise<void>;
  findByWindow(windowId: string): Promise<ExtraQuantity[]>;
  remove(id: string): Promise<void>;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/server/src/core/extra-quantities/
git commit -m "feat(extra-quantities): add ExtraQuantity domain entity and repository interface"
```

---

## Task 4: Infrastructure layer — TypeORM entity + repository

**Files:**
- Create: `apps/server/src/core/extra-quantities/infrastructure/persistence/extra-quantity.typeorm-entity.ts`
- Create: `apps/server/src/core/extra-quantities/infrastructure/persistence/extra-quantities-typeorm.repository.ts`

- [ ] **Step 1: Create the TypeORM entity**

`apps/server/src/core/extra-quantities/infrastructure/persistence/extra-quantity.typeorm-entity.ts`:

```ts
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ExtraQuantity {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  windowId: string;

  @Column('character varying', { length: 26 })
  menuItemId: string;

  @Column('int')
  quantity: number;

  @Column('varchar', { length: 255, nullable: true })
  guestName: string | null;
}
```

`ORM_SYNC=true` in dev will create the `extra_quantity` table automatically (SnakeNamingStrategy converts `ExtraQuantity` → `extra_quantity`).

- [ ] **Step 2: Create the TypeORM repository**

`apps/server/src/core/extra-quantities/infrastructure/persistence/extra-quantities-typeorm.repository.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';
import { ExtraQuantity as ExtraQuantityDomain } from '../../domain/extra-quantity.entity';
import { IExtraQuantitiesRepository } from '../../domain/extra-quantities.repository.interface';
import { ExtraQuantity as ExtraQuantityPersistence } from './extra-quantity.typeorm-entity';

@Injectable()
export class ExtraQuantitiesTypeOrmRepository implements IExtraQuantitiesRepository {
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private get _repository(): Repository<ExtraQuantityPersistence> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(ExtraQuantityPersistence)
      : this._dataSource.getRepository(ExtraQuantityPersistence);
  }

  async insert(entity: ExtraQuantityDomain): Promise<void> {
    const persistence = new ExtraQuantityPersistence();
    persistence.id = entity.id;
    persistence.windowId = entity.windowId;
    persistence.menuItemId = entity.menuItemId;
    persistence.quantity = entity.quantity;
    persistence.guestName = entity.guestName;
    await this._repository.save(persistence);
  }

  async findByWindow(windowId: string): Promise<ExtraQuantityDomain[]> {
    const records = await this._repository.find({ where: { windowId } });
    return records.map((r) =>
      ExtraQuantityDomain.reconstitute(r.id, r.windowId, r.menuItemId, r.quantity, r.guestName),
    );
  }

  async remove(id: string): Promise<void> {
    await this._repository.delete({ id });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/server/src/core/extra-quantities/infrastructure/
git commit -m "feat(extra-quantities): add TypeORM entity and repository"
```

---

## Task 5: Application service

**Files:**
- Create: `apps/server/src/core/extra-quantities/application/extra-quantities.service.ts`

- [ ] **Step 1: Create the service**

`apps/server/src/core/extra-quantities/application/extra-quantities.service.ts`:

```ts
import { Inject, Injectable } from '@nestjs/common';
import { ExtraQuantity } from '../domain/extra-quantity.entity';
import {
  I_EXTRA_QUANTITIES_REPOSITORY,
  IExtraQuantitiesRepository,
} from '../domain/extra-quantities.repository.interface';

@Injectable()
export class ExtraQuantitiesService {
  constructor(
    @Inject(I_EXTRA_QUANTITIES_REPOSITORY)
    private readonly _repository: IExtraQuantitiesRepository,
  ) {}

  async add(
    windowId: string,
    menuItemId: string,
    quantity: number,
    guestName: string | null,
  ): Promise<ExtraQuantity> {
    const entity = ExtraQuantity.create(windowId, menuItemId, quantity, guestName);
    await this._repository.insert(entity);
    return entity;
  }

  async findByWindow(windowId: string): Promise<ExtraQuantity[]> {
    return this._repository.findByWindow(windowId);
  }

  async remove(id: string): Promise<void> {
    return this._repository.remove(id);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/server/src/core/extra-quantities/application/
git commit -m "feat(extra-quantities): add ExtraQuantitiesService"
```

---

## Task 6: Presentation layer, module, and wire into CoreModule

**Files:**
- Create: `apps/server/src/core/extra-quantities/presentation/rest/dto/create-extra-quantity.dto.ts`
- Create: `apps/server/src/core/extra-quantities/presentation/rest/dto/extra-quantity-response.dto.ts`
- Create: `apps/server/src/core/extra-quantities/presentation/rest/extra-quantities.controller.ts`
- Create: `apps/server/src/core/extra-quantities/extra-quantities.module.ts`
- Modify: `apps/server/src/core/core.module.ts`

- [ ] **Step 1: Create the request DTO**

`apps/server/src/core/extra-quantities/presentation/rest/dto/create-extra-quantity.dto.ts`:

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateExtraQuantityDto {
  @ApiProperty()
  @IsString()
  windowId: string;

  @ApiProperty()
  @IsString()
  menuItemId: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  guestName?: string;
}
```

- [ ] **Step 2: Create the response DTO**

`apps/server/src/core/extra-quantities/presentation/rest/dto/extra-quantity-response.dto.ts`:

```ts
import { IExtraQuantity } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ExtraQuantityResponseDto implements IExtraQuantity {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() windowId: string;
  @ApiProperty() @Expose() menuItemId: string;
  @ApiProperty() @Expose() quantity: number;
  @ApiProperty({ nullable: true }) @Expose() guestName: string | null;
}
```

- [ ] **Step 3: Create the controller**

`apps/server/src/core/extra-quantities/presentation/rest/extra-quantities.controller.ts`:

```ts
import { EmployeeRole, IdentityType } from '@food-up/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { RequiredEmployeeRole } from 'src/core/employees/presentation/rest/employee-role.decorator';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { ExtraQuantitiesService } from '../../application/extra-quantities.service';
import { CreateExtraQuantityDto } from './dto/create-extra-quantity.dto';
import { ExtraQuantityResponseDto } from './dto/extra-quantity-response.dto';

@ApiTags('ExtraQuantities')
@Controller('extra-quantities')
@ApiBearerAuth()
@RequiredIdentityType(IdentityType.Employee)
@RequiredEmployeeRole(EmployeeRole.Manager)
export class ExtraQuantitiesController {
  constructor(private readonly _service: ExtraQuantitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Add an extra quantity for a guest' })
  @ApiResponse({ status: 201, type: ExtraQuantityResponseDto })
  async add(@Body() dto: CreateExtraQuantityDto): Promise<ExtraQuantityResponseDto> {
    const entity = await this._service.add(
      dto.windowId,
      dto.menuItemId,
      dto.quantity,
      dto.guestName ?? null,
    );
    return plainToInstance(ExtraQuantityResponseDto, entity, { strategy: 'excludeAll' });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an extra quantity row' })
  @ApiResponse({ status: 200 })
  async remove(@Param('id') id: string): Promise<void> {
    return this._service.remove(id);
  }

  @Get()
  @ApiOperation({ summary: 'List extra quantities for a window' })
  @ApiQuery({ name: 'windowId', required: true, type: String })
  @ApiResponse({ status: 200, type: [ExtraQuantityResponseDto] })
  async findByWindow(@Query('windowId') windowId: string): Promise<ExtraQuantityResponseDto[]> {
    const entities = await this._service.findByWindow(windowId);
    return plainToInstance(ExtraQuantityResponseDto, entities, { strategy: 'excludeAll' });
  }
}
```

- [ ] **Step 4: Create the module**

`apps/server/src/core/extra-quantities/extra-quantities.module.ts`:

```ts
import { Module, Provider } from '@nestjs/common';
import { ExtraQuantitiesService } from './application/extra-quantities.service';
import { I_EXTRA_QUANTITIES_REPOSITORY } from './domain/extra-quantities.repository.interface';
import { ExtraQuantitiesTypeOrmRepository } from './infrastructure/persistence/extra-quantities-typeorm.repository';
import { ExtraQuantitiesController } from './presentation/rest/extra-quantities.controller';

const ExtraQuantitiesRepositoryProvider: Provider = {
  provide: I_EXTRA_QUANTITIES_REPOSITORY,
  useClass: ExtraQuantitiesTypeOrmRepository,
};

@Module({
  controllers: [ExtraQuantitiesController],
  providers: [ExtraQuantitiesRepositoryProvider, ExtraQuantitiesService],
  exports: [ExtraQuantitiesService],
})
export class ExtraQuantitiesModule {}
```

- [ ] **Step 5: Import `ExtraQuantitiesModule` in `CoreModule`**

In `apps/server/src/core/core.module.ts`, add `ExtraQuantitiesModule` to the `imports` array and add the import statement:

```ts
import { ExtraQuantitiesModule } from './extra-quantities/extra-quantities.module';

// In @Module imports array, add:
ExtraQuantitiesModule,
```

- [ ] **Step 6: Start server and verify endpoints exist**

```bash
npm run dev:server
```

Open `http://localhost:3000/api/docs` — verify `ExtraQuantities` tag appears with `POST /extra-quantities`, `DELETE /extra-quantities/{id}`, and `GET /extra-quantities`.

- [ ] **Step 7: Commit**

```bash
git add apps/server/src/core/extra-quantities/ apps/server/src/core/core.module.ts
git commit -m "feat(extra-quantities): add controller, DTOs, module; wire into CoreModule"
```

---

## Task 7: Query repository — merge extras into all order totals

Extras must be silently merged into supplier totals (no separate labelling). This task adds a fourth query source to `getByWindow` and `getByWindowAndSupplier`, and adds named guest extras to `getEmployeeSelections`. It also adds `getCostByWindow` for the cost summary.

**Files:**
- Modify: `apps/server/src/core/reports/application/queries/order-summary-query-repository.interface.ts`
- Modify: `apps/server/src/core/reports/infrastructure/persistence/order-summary-query-typeorm.repository.ts`

- [ ] **Step 1: Add `getCostByWindow` to the interface**

In `apps/server/src/core/reports/application/queries/order-summary-query-repository.interface.ts`, add the new method and define the return type:

```ts
import { EmployeeDaySelectionRow, OrderSummaryRow } from './dto/order-summary-row.dto';

export const I_ORDER_SUMMARY_QUERY_REPOSITORY = Symbol(
  'IOrderSummaryQueryRepository',
);

export type CostByWindowRow = {
  supplierId: string;
  supplierName: string;
  totalCost: number;
};

export interface IOrderSummaryQueryRepository {
  getByWindow(windowId: string): Promise<OrderSummaryRow[]>;
  getByWindowAndSupplier(
    windowId: string,
    supplierId: string,
  ): Promise<OrderSummaryRow[]>;
  getEmployeeSelections(windowId: string): Promise<EmployeeDaySelectionRow[]>;
  getCostByWindow(windowId: string): Promise<CostByWindowRow[]>;
}
```

- [ ] **Step 2: Update `OrderSummaryQueryTypeOrmRepository`**

Full replacement of `apps/server/src/core/reports/infrastructure/persistence/order-summary-query-typeorm.repository.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ChangeRequestStatus } from '@food-up/shared';
import { ChangeRequest } from 'src/core/change-requests/infrastructure/persistence/change-request.typeorm-entity';
import { Employee } from 'src/core/employees/infrastructure/persistence/employee.typeorm-entity';
import { ExtraQuantity as ExtraQuantityPersistence } from 'src/core/extra-quantities/infrastructure/persistence/extra-quantity.typeorm-entity';
import { MealSelection } from 'src/core/meal-selections/infrastructure/persistence/meal-selection.typeorm-entity';
import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';
import {
  CostByWindowRow,
  IOrderSummaryQueryRepository,
} from '../../application/queries/order-summary-query-repository.interface';
import {
  EmployeeDaySelectionRow,
  OrderSummaryRow,
} from '../../application/queries/dto/order-summary-row.dto';

const MEAL_TYPE_ORDER: Record<string, number> = {
  breakfast: 0,
  soup: 1,
  salad: 2,
  bread: 3,
  lunch: 4,
  dinner: 5,
  dessert: 6,
};

@Injectable()
export class OrderSummaryQueryTypeOrmRepository
  implements IOrderSummaryQueryRepository
{
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private get _msRepository(): Repository<MealSelection> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(MealSelection)
      : this._dataSource.getRepository(MealSelection);
  }

  private get _crRepository(): Repository<ChangeRequest> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(ChangeRequest)
      : this._dataSource.getRepository(ChangeRequest);
  }

  private get _eqRepository(): Repository<ExtraQuantityPersistence> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(ExtraQuantityPersistence)
      : this._dataSource.getRepository(ExtraQuantityPersistence);
  }

  async getByWindow(windowId: string): Promise<OrderSummaryRow[]> {
    const [unaffected, modified, late, extras] = await Promise.all([
      this._queryUnaffected(windowId),
      this._queryModified(windowId),
      this._queryLate(windowId),
      this._queryExtras(windowId),
    ]);
    return this._aggregate([...unaffected, ...modified, ...late, ...extras]);
  }

  async getByWindowAndSupplier(
    windowId: string,
    supplierId: string,
  ): Promise<OrderSummaryRow[]> {
    const [unaffected, modified, late, extras] = await Promise.all([
      this._queryUnaffected(windowId, supplierId),
      this._queryModified(windowId, supplierId),
      this._queryLate(windowId, supplierId),
      this._queryExtras(windowId, supplierId),
    ]);
    return this._aggregate([...unaffected, ...modified, ...late, ...extras]);
  }

  async getEmployeeSelections(windowId: string): Promise<EmployeeDaySelectionRow[]> {
    const [unaffected, modified, late, namedGuests] = await Promise.all([
      this._queryUnaffectedEmployee(windowId),
      this._queryModifiedEmployee(windowId),
      this._queryLateEmployee(windowId),
      this._queryNamedGuestExtras(windowId),
    ]);

    const rows = [...unaffected, ...modified, ...late, ...namedGuests];
    return rows
      .map((r) => ({
        date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date),
        employeeName: r.employeeName,
        mealName: r.mealName,
        mealType: r.mealType,
        quantity: Number(r.quantity),
      }))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.employeeName.localeCompare(b.employeeName);
      });
  }

  async getCostByWindow(windowId: string): Promise<CostByWindowRow[]> {
    const result = await this._dataSource.query<
      { supplierId: string; supplierName: string; totalCost: string }[]
    >(
      `
      SELECT "supplierId", "supplierName", SUM("totalCost") AS "totalCost"
      FROM (
        SELECT s.id AS "supplierId", s.name AS "supplierName",
               SUM(mi.price * COALESCE(ms.quantity, 1)) AS "totalCost"
        FROM meal_selection ms
        INNER JOIN menu_item mi ON mi.id = ms.menu_item_id
        INNER JOIN menu_period mp ON mp.id = mi.menu_period_id
        INNER JOIN supplier s ON s.id = mp.supplier_id
        WHERE ms.meal_selection_window_id = $1
          AND ms.menu_item_id IS NOT NULL
          AND COALESCE(ms.quantity, 1) > 0
          AND mi.price IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM change_request cr
            WHERE cr.meal_selection_id = ms.id AND cr.status = 'approved'
          )
        GROUP BY s.id, s.name

        UNION ALL

        SELECT s.id, s.name,
               SUM(mi.price * COALESCE(cr.new_quantity, 1))
        FROM meal_selection ms
        INNER JOIN change_request cr
          ON cr.meal_selection_id = ms.id
          AND cr.status = 'approved'
          AND cr.clear_selection = false
        INNER JOIN menu_item mi ON mi.id = cr.new_menu_item_id
        INNER JOIN menu_period mp ON mp.id = mi.menu_period_id
        INNER JOIN supplier s ON s.id = mp.supplier_id
        WHERE ms.meal_selection_window_id = $1
          AND cr.new_menu_item_id IS NOT NULL
          AND mi.price IS NOT NULL
        GROUP BY s.id, s.name

        UNION ALL

        SELECT s.id, s.name,
               SUM(mi.price * COALESCE(cr.new_quantity, 1))
        FROM change_request cr
        INNER JOIN menu_item mi ON mi.id = cr.new_menu_item_id
        INNER JOIN menu_period mp ON mp.id = mi.menu_period_id
        INNER JOIN supplier s ON s.id = mp.supplier_id
        WHERE cr.meal_selection_window_id = $1
          AND cr.meal_selection_id IS NULL
          AND cr.status = 'approved'
          AND cr.clear_selection = false
          AND cr.new_menu_item_id IS NOT NULL
          AND mi.price IS NOT NULL
          AND COALESCE(cr.new_quantity, 1) > 0
        GROUP BY s.id, s.name

        UNION ALL

        SELECT s.id, s.name,
               SUM(mi.price * eq.quantity)
        FROM extra_quantity eq
        INNER JOIN menu_item mi ON mi.id = eq.menu_item_id
        INNER JOIN menu_period mp ON mp.id = mi.menu_period_id
        INNER JOIN supplier s ON s.id = mp.supplier_id
        WHERE eq.window_id = $1
          AND mi.price IS NOT NULL
        GROUP BY s.id, s.name
      ) AS combined
      GROUP BY "supplierId", "supplierName"
      ORDER BY "supplierName"
    `,
      [windowId],
    );

    return result.map((r) => ({
      supplierId: r.supplierId,
      supplierName: r.supplierName,
      totalCost: Number(r.totalCost),
    }));
  }

  /** Selections with no approved CR — use original menu item and quantity */
  private async _queryUnaffected(
    windowId: string,
    supplierId?: string,
  ): Promise<RawRow[]> {
    const qb = this._msRepository
      .createQueryBuilder('ms')
      .innerJoin('ms.menuItem', 'mi')
      .innerJoin('mi.meal', 'm')
      .innerJoin('mi.menuPeriod', 'mp')
      .innerJoin('mp.supplier', 's')
      .select([
        's.id AS "supplierId"',
        's.name AS "supplierName"',
        'ms.date AS "date"',
        'm.type AS "mealType"',
        'm.name AS "mealName"',
        'COALESCE(ms.quantity, 1) AS "quantity"',
      ])
      .where('ms.mealSelectionWindowId = :windowId', { windowId })
      .andWhere('ms.menuItemId IS NOT NULL')
      .andWhere('COALESCE(ms.quantity, 1) > 0')
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM change_request cr
          WHERE cr.meal_selection_id = ms.id
          AND cr.status = :approved
        )`,
        { approved: ChangeRequestStatus.Approved },
      );

    if (supplierId) {
      qb.andWhere('s.id = :supplierId', { supplierId });
    }

    return qb.getRawMany();
  }

  /** Selections where an approved non-clearing CR changes the menu item/quantity */
  private async _queryModified(
    windowId: string,
    supplierId?: string,
  ): Promise<RawRow[]> {
    const qb = this._msRepository
      .createQueryBuilder('ms')
      .innerJoin(
        ChangeRequest,
        'cr',
        'cr.mealSelectionId = ms.id AND cr.status = :approved AND cr.clearSelection = false',
        { approved: ChangeRequestStatus.Approved },
      )
      .innerJoin(MenuItem, 'mi', 'mi.id = cr.newMenuItemId')
      .innerJoin('mi.meal', 'm')
      .innerJoin('mi.menuPeriod', 'mp')
      .innerJoin('mp.supplier', 's')
      .select([
        's.id AS "supplierId"',
        's.name AS "supplierName"',
        'ms.date AS "date"',
        'm.type AS "mealType"',
        'm.name AS "mealName"',
        'COALESCE(cr.newQuantity, 1) AS "quantity"',
      ])
      .where('ms.mealSelectionWindowId = :windowId', { windowId })
      .andWhere('cr.newMenuItemId IS NOT NULL');

    if (supplierId) {
      qb.andWhere('s.id = :supplierId', { supplierId });
    }

    return qb.getRawMany();
  }

  /** CRs with no mealSelectionId (late selections) — derive date from MenuItem.day */
  private async _queryLate(
    windowId: string,
    supplierId?: string,
  ): Promise<RawRow[]> {
    const qb = this._crRepository
      .createQueryBuilder('cr')
      .innerJoin(MenuItem, 'mi', 'mi.id = cr.newMenuItemId')
      .innerJoin('mi.meal', 'm')
      .innerJoin('mi.menuPeriod', 'mp')
      .innerJoin('mp.supplier', 's')
      .select([
        's.id AS "supplierId"',
        's.name AS "supplierName"',
        'mi.day AS "date"',
        'm.type AS "mealType"',
        'm.name AS "mealName"',
        'COALESCE(cr.newQuantity, 1) AS "quantity"',
      ])
      .where('cr.mealSelectionWindowId = :windowId', { windowId })
      .andWhere('cr.mealSelectionId IS NULL')
      .andWhere('cr.status = :approved', {
        approved: ChangeRequestStatus.Approved,
      })
      .andWhere('cr.clearSelection = false')
      .andWhere('cr.newMenuItemId IS NOT NULL')
      .andWhere('COALESCE(cr.newQuantity, 1) > 0');

    if (supplierId) {
      qb.andWhere('s.id = :supplierId', { supplierId });
    }

    return qb.getRawMany();
  }

  /** Extra quantities added by the manager for non-employee guests */
  private async _queryExtras(
    windowId: string,
    supplierId?: string,
  ): Promise<RawRow[]> {
    const qb = this._eqRepository
      .createQueryBuilder('eq')
      .innerJoin(MenuItem, 'mi', 'mi.id = eq.menuItemId')
      .innerJoin('mi.meal', 'm')
      .innerJoin('mi.menuPeriod', 'mp')
      .innerJoin('mp.supplier', 's')
      .select([
        's.id AS "supplierId"',
        's.name AS "supplierName"',
        'mi.day AS "date"',
        'm.type AS "mealType"',
        'm.name AS "mealName"',
        'eq.quantity AS "quantity"',
      ])
      .where('eq.windowId = :windowId', { windowId });

    if (supplierId) {
      qb.andWhere('s.id = :supplierId', { supplierId });
    }

    return qb.getRawMany();
  }

  /** Named guest extras — appear as individual rows in XLSX day sheets */
  private async _queryNamedGuestExtras(windowId: string): Promise<EmployeeRawRow[]> {
    return this._eqRepository
      .createQueryBuilder('eq')
      .innerJoin(MenuItem, 'mi', 'mi.id = eq.menuItemId')
      .innerJoin('mi.meal', 'm')
      .select([
        'mi.day AS "date"',
        'eq.guestName AS "employeeName"',
        'm.name AS "mealName"',
        'm.type AS "mealType"',
        'eq.quantity AS "quantity"',
      ])
      .where('eq.windowId = :windowId', { windowId })
      .andWhere('eq.guestName IS NOT NULL')
      .getRawMany();
  }

  /** Employee selections with no approved CR */
  private async _queryUnaffectedEmployee(windowId: string): Promise<EmployeeRawRow[]> {
    return this._msRepository
      .createQueryBuilder('ms')
      .innerJoin(Employee, 'e', 'e.id = ms.employeeId')
      .innerJoin('ms.menuItem', 'mi')
      .innerJoin('mi.meal', 'm')
      .select([
        'ms.date AS "date"',
        'e.name AS "employeeName"',
        'm.name AS "mealName"',
        'm.type AS "mealType"',
        'COALESCE(ms.quantity, 1) AS "quantity"',
      ])
      .where('ms.mealSelectionWindowId = :windowId', { windowId })
      .andWhere('ms.menuItemId IS NOT NULL')
      .andWhere('COALESCE(ms.quantity, 1) > 0')
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM change_request cr
          WHERE cr.meal_selection_id = ms.id
          AND cr.status = :approved
        )`,
        { approved: ChangeRequestStatus.Approved },
      )
      .getRawMany();
  }

  /** Employee selections where an approved non-clearing CR overrides the meal */
  private async _queryModifiedEmployee(windowId: string): Promise<EmployeeRawRow[]> {
    return this._msRepository
      .createQueryBuilder('ms')
      .innerJoin(Employee, 'e', 'e.id = ms.employeeId')
      .innerJoin(
        ChangeRequest,
        'cr',
        'cr.mealSelectionId = ms.id AND cr.status = :approved AND cr.clearSelection = false',
        { approved: ChangeRequestStatus.Approved },
      )
      .innerJoin(MenuItem, 'mi', 'mi.id = cr.newMenuItemId')
      .innerJoin('mi.meal', 'm')
      .select([
        'ms.date AS "date"',
        'e.name AS "employeeName"',
        'm.name AS "mealName"',
        'm.type AS "mealType"',
        'COALESCE(cr.newQuantity, 1) AS "quantity"',
      ])
      .where('ms.mealSelectionWindowId = :windowId', { windowId })
      .andWhere('cr.newMenuItemId IS NOT NULL')
      .getRawMany();
  }

  /** Late employee selections (CRs with no original meal selection) */
  private async _queryLateEmployee(windowId: string): Promise<EmployeeRawRow[]> {
    return this._crRepository
      .createQueryBuilder('cr')
      .innerJoin(Employee, 'e', 'e.id = cr.employeeId')
      .innerJoin(MenuItem, 'mi', 'mi.id = cr.newMenuItemId')
      .innerJoin('mi.meal', 'm')
      .select([
        'mi.day AS "date"',
        'e.name AS "employeeName"',
        'm.name AS "mealName"',
        'm.type AS "mealType"',
        'COALESCE(cr.newQuantity, 1) AS "quantity"',
      ])
      .where('cr.mealSelectionWindowId = :windowId', { windowId })
      .andWhere('cr.mealSelectionId IS NULL')
      .andWhere('cr.status = :approved', {
        approved: ChangeRequestStatus.Approved,
      })
      .andWhere('cr.clearSelection = false')
      .andWhere('cr.newMenuItemId IS NOT NULL')
      .andWhere('COALESCE(cr.newQuantity, 1) > 0')
      .getRawMany();
  }

  private _aggregate(rows: RawRow[]): OrderSummaryRow[] {
    const map = new Map<string, OrderSummaryRow>();

    for (const row of rows) {
      const key = `${row.supplierId}|${row.date}|${row.mealType}|${row.mealName}`;
      const existing = map.get(key);
      const qty = Number(row.quantity);
      if (existing) {
        existing.totalQuantity += qty;
      } else {
        map.set(key, {
          supplierId: row.supplierId,
          supplierName: row.supplierName,
          date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date),
          mealType: row.mealType,
          mealName: row.mealName,
          totalQuantity: qty,
        });
      }
    }

    return [...map.values()].sort((a, b) => {
      if (a.supplierName !== b.supplierName)
        return a.supplierName.localeCompare(b.supplierName);
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      const typeOrderA = MEAL_TYPE_ORDER[a.mealType] ?? 99;
      const typeOrderB = MEAL_TYPE_ORDER[b.mealType] ?? 99;
      if (typeOrderA !== typeOrderB) return typeOrderA - typeOrderB;
      return a.mealName.localeCompare(b.mealName);
    });
  }
}

type RawRow = {
  supplierId: string;
  supplierName: string;
  date: string | Date;
  mealType: string;
  mealName: string;
  quantity: string | number;
};

type EmployeeRawRow = {
  date: string | Date;
  employeeName: string;
  mealName: string;
  mealType: string;
  quantity: string | number;
};
```

- [ ] **Step 3: Start server and verify TypeScript compilation**

```bash
npm run dev:server
```

Expected: server starts without TypeScript errors. Check server logs for the `extra_quantity` table being created by ORM_SYNC.

- [ ] **Step 4: Commit**

```bash
git add apps/server/src/core/reports/application/queries/order-summary-query-repository.interface.ts \
        apps/server/src/core/reports/infrastructure/persistence/order-summary-query-typeorm.repository.ts
git commit -m "feat(reports): merge extra quantities into order totals and day sheets; add getCostByWindow"
```

---

## Task 8: Reports cost summary endpoint

**Files:**
- Create: `apps/server/src/core/reports/presentation/rest/dto/window-cost-summary-response.dto.ts`
- Modify: `apps/server/src/core/reports/application/reports.service.ts`
- Modify: `apps/server/src/core/reports/presentation/rest/reports.controller.ts`

- [ ] **Step 1: Create the response DTO**

`apps/server/src/core/reports/presentation/rest/dto/window-cost-summary-response.dto.ts`:

```ts
import { IWindowCostSummary } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WindowCostSummaryResponseDto implements IWindowCostSummary {
  @ApiProperty() @Expose() supplierId: string;
  @ApiProperty() @Expose() supplierName: string;
  @ApiProperty() @Expose() totalCost: number;
}
```

- [ ] **Step 2: Add `getCostSummary` to `ReportsService`**

In `apps/server/src/core/reports/application/reports.service.ts`, add this method (and import `IWindowCostSummary` from `@food-up/shared` and `CostByWindowRow` from the query repository interface):

```ts
async getCostSummary(windowId: string): Promise<IWindowCostSummary[]> {
  return this._queryRepository.getCostByWindow(windowId);
}
```

Also add `IWindowCostSummary` to the import from `@food-up/shared`:
```ts
import { IOrderSummarySend, ISendReportItem, IWindowCostSummary, Language } from '@food-up/shared';
```

- [ ] **Step 3: Add `GET /reports/cost-summary` endpoint**

In `apps/server/src/core/reports/presentation/rest/reports.controller.ts`, add the import and endpoint:

```ts
import { WindowCostSummaryResponseDto } from './dto/window-cost-summary-response.dto';
```

```ts
@Get('cost-summary')
@ApiOperation({ summary: 'Get estimated cost breakdown by supplier for a meal selection window' })
@ApiQuery({ name: 'windowId', required: true, type: String })
@ApiResponse({ status: 200, type: [WindowCostSummaryResponseDto] })
async getCostSummary(
  @Query('windowId') windowId: string,
): Promise<WindowCostSummaryResponseDto[]> {
  const rows = await this._reportsService.getCostSummary(windowId);
  return plainToInstance(WindowCostSummaryResponseDto, rows, { strategy: 'excludeAll' });
}
```

- [ ] **Step 4: Start server and verify endpoint**

```bash
npm run dev:server
```

Open `http://localhost:3000/api/docs` — verify `GET /reports/cost-summary` appears in the `Reports` section.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/core/reports/presentation/rest/dto/window-cost-summary-response.dto.ts \
        apps/server/src/core/reports/application/reports.service.ts \
        apps/server/src/core/reports/presentation/rest/reports.controller.ts
git commit -m "feat(reports): add getCostSummary service method and GET /reports/cost-summary endpoint"
```

---

## Task 9: Frontend service layer

**Files:**
- Create: `apps/web/src/features/extra-quantities/domain/extra-quantity-service.interface.ts`
- Create: `apps/web/src/features/extra-quantities/infrastructure/extra-quantity.service.ts`
- Modify: `apps/web/src/shared/infrastructure/di/service-container.ts`
- Modify: `apps/web/src/app/app-providers.tsx`
- Modify: `apps/web/src/features/reports/domain/report-service.interface.ts`
- Modify: `apps/web/src/features/reports/infrastructure/report.service.ts`

- [ ] **Step 1: Create `IExtraQuantityService` interface**

`apps/web/src/features/extra-quantities/domain/extra-quantity-service.interface.ts`:

```ts
import { IExtraQuantity } from '@food-up/shared';

export interface IExtraQuantityService {
  getByWindow(windowId: string): Promise<IExtraQuantity[]>;
  add(data: {
    windowId: string;
    menuItemId: string;
    quantity: number;
    guestName?: string;
  }): Promise<IExtraQuantity>;
  remove(id: string): Promise<void>;
}
```

- [ ] **Step 2: Create `ExtraQuantityService` HTTP implementation**

`apps/web/src/features/extra-quantities/infrastructure/extra-quantity.service.ts`:

```ts
import { IExtraQuantity } from '@food-up/shared';
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { IExtraQuantityService } from '../domain/extra-quantity-service.interface';

export class ExtraQuantityService implements IExtraQuantityService {
  constructor(private readonly http: HttpClient) {}

  getByWindow(windowId: string): Promise<IExtraQuantity[]> {
    return this.http.get<IExtraQuantity[]>(`/api/extra-quantities?windowId=${windowId}`);
  }

  add(data: {
    windowId: string;
    menuItemId: string;
    quantity: number;
    guestName?: string;
  }): Promise<IExtraQuantity> {
    return this.http.post<typeof data, IExtraQuantity>('/api/extra-quantities', data);
  }

  remove(id: string): Promise<void> {
    return this.http.delete(`/api/extra-quantities/${id}`);
  }
}
```

- [ ] **Step 3: Add `extraQuantityService` to `ServiceContainer`**

In `apps/web/src/shared/infrastructure/di/service-container.ts`, add the import and field:

```ts
import { IExtraQuantityService } from '@/features/extra-quantities/domain/extra-quantity-service.interface';

// In the ServiceContainer interface, add:
extraQuantityService: IExtraQuantityService;
```

- [ ] **Step 4: Wire `ExtraQuantityService` in `app-providers.tsx`**

In `apps/web/src/app/app-providers.tsx`, add:

```ts
import { ExtraQuantityService } from '@/features/extra-quantities/infrastructure/extra-quantity.service';

// In the services object, add:
extraQuantityService: new ExtraQuantityService(httpClient),
```

- [ ] **Step 5: Add `getCostSummary` to `IReportService`**

In `apps/web/src/features/reports/domain/report-service.interface.ts`:

```ts
import { IMailPreview, IOrderSummarySend, ISendReportItem, ISupplierSendStatus, IWindowCostSummary } from '@food-up/shared';

export interface IReportService {
  getSendStatus(windowId: string): Promise<ISupplierSendStatus[]>;
  getPreview(windowId: string, supplierId: string): Promise<IMailPreview>;
  sendToSuppliers(windowId: string, suppliers: ISendReportItem[]): Promise<void>;
  getSends(windowId: string): Promise<IOrderSummarySend[]>;
  downloadXlsx(windowId: string): Promise<void>;
  getCostSummary(windowId: string): Promise<IWindowCostSummary[]>;
}
```

- [ ] **Step 6: Implement `getCostSummary` in `ReportService`**

In `apps/web/src/features/reports/infrastructure/report.service.ts`, add:

```ts
import { IMailPreview, IOrderSummarySend, ISendReport, ISendReportItem, ISupplierSendStatus, IWindowCostSummary } from '@food-up/shared';

// In the class, add:
getCostSummary(windowId: string): Promise<IWindowCostSummary[]> {
  return this.http.get<IWindowCostSummary[]>(`/api/reports/cost-summary?windowId=${windowId}`);
}
```

- [ ] **Step 7: Check for TypeScript errors**

```bash
npm run build 2>&1 | grep -E "error TS|Error" | head -20
```

Expected: no TypeScript errors. Fix any that appear.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/features/extra-quantities/ \
        apps/web/src/shared/infrastructure/di/service-container.ts \
        apps/web/src/app/app-providers.tsx \
        apps/web/src/features/reports/domain/report-service.interface.ts \
        apps/web/src/features/reports/infrastructure/report.service.ts
git commit -m "feat(web): add ExtraQuantityService; add getCostSummary to ReportService; wire DI"
```

---

## Task 10: i18n strings

**Files:**
- Modify: `apps/web/src/i18n/en/meals.json`
- Modify: `apps/web/src/i18n/sr/meals.json`

- [ ] **Step 1: Add English strings to `en/meals.json`**

Inside `windows.detail`, add two new sibling objects after `"sendError": "..."`:

```json
"extras": {
  "title": "Additional quantities",
  "subtitle": "guests / visitors",
  "guestNameHeader": "Guest name",
  "guestNameOptional": "optional",
  "mealHeader": "Meal",
  "qtyHeader": "Qty",
  "addRow": "+ Add row",
  "newRowTitle": "New row",
  "dateLabel": "Date",
  "mealLabel": "Meal",
  "mealFilteredHint": "(filtered to {{date}})",
  "qtyLabel": "Qty",
  "guestNamePlaceholder": "e.g. Ana Marković",
  "saveRow": "Save row",
  "hint": "Named guests appear as individual rows in XLSX day sheets. Anonymous extras are counted in summary totals only."
},
"costSummary": {
  "title": "Estimated cost",
  "subtitle": "employee selections + additional quantities",
  "total": "Total",
  "disclaimer": "Items without a price are excluded from this estimate."
}
```

- [ ] **Step 2: Add Serbian strings to `sr/meals.json`**

Inside `windows.detail`, add the same keys in Serbian:

```json
"extras": {
  "title": "Dodatne količine",
  "subtitle": "gosti / posetioci",
  "guestNameHeader": "Ime gosta",
  "guestNameOptional": "opciono",
  "mealHeader": "Obrok",
  "qtyHeader": "Kol.",
  "addRow": "+ Dodaj red",
  "newRowTitle": "Novi red",
  "dateLabel": "Datum",
  "mealLabel": "Obrok",
  "mealFilteredHint": "(filtrirano na {{date}})",
  "qtyLabel": "Kol.",
  "guestNamePlaceholder": "npr. Ana Marković",
  "saveRow": "Sačuvaj red",
  "hint": "Imenovani gosti pojavljuju se kao pojedinačni redovi u dnevnim listovima XLSX-a. Anonimni dodaci broje se samo u zbiru."
},
"costSummary": {
  "title": "Procena troškova",
  "subtitle": "izbori zaposlenih + dodatne količine",
  "total": "Ukupno",
  "disclaimer": "Stavke bez cene nisu uključene u ovu procenu."
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/i18n/en/meals.json apps/web/src/i18n/sr/meals.json
git commit -m "feat(i18n): add extras and costSummary translation keys for extra quantities feature"
```

---

## Task 11: Frontend UI — ExtraQuantitiesSection and CostSummarySection

This task adds two co-located components to `meal-selection-windows.page.tsx` and wires them into `WindowDetails`.

**Files:**
- Modify: `apps/web/src/features/meal-selection-windows/presentation/pages/meal-selection-windows.page.tsx`

- [ ] **Step 1: Add required imports**

Near the top of the file, add imports for `IExtraQuantity`, `IWindowCostSummary`. Also ensure `React` is imported (needed for `React.Fragment` in `CostSummarySection`). Add only what's missing — the file already imports `useState`, `useQuery`, `useMutation`, `useQueryClient`, and `useTranslation`.

```ts
import React from 'react';
import { IExtraQuantity, IWindowCostSummary } from '@food-up/shared';
```

- [ ] **Step 2: Add `ExtraQuantitiesSection` component**

Add this component to the file (co-located, near `WindowReportsPanel`). The component uses `menuItems` (already loaded in the parent `WindowDetails`) and `targetDates` (passed as a prop).

```tsx
interface ExtraQuantitiesSectionProps {
  windowId: string;
  menuItems: IWindowMenuItemResponse[];
  targetDates: string[];
}

function ExtraQuantitiesSection({ windowId, menuItems, targetDates }: ExtraQuantitiesSectionProps) {
  const { t } = useTranslation('meals');
  const { extraQuantityService } = useServices();
  const queryClient = useQueryClient();

  const EXTRAS_KEY = ['extra-quantities', windowId];
  const COST_KEY = ['reports', 'cost-summary', windowId];

  const { data: extras = [] } = useQuery<IExtraQuantity[]>({
    queryKey: EXTRAS_KEY,
    queryFn: () => extraQuantityService.getByWindow(windowId),
  });

  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(targetDates[0] ?? '');
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [qty, setQty] = useState(1);

  const filteredItems = menuItems.filter((i) => i.day === selectedDate);

  function resetForm() {
    setShowForm(false);
    setSelectedDate(targetDates[0] ?? '');
    setSelectedMenuItemId('');
    setGuestName('');
    setQty(1);
  }

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setSelectedMenuItemId('');
  }

  const addMutation = useMutation({
    mutationFn: () =>
      extraQuantityService.add({
        windowId,
        menuItemId: selectedMenuItemId,
        quantity: qty,
        guestName: guestName.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXTRAS_KEY });
      queryClient.invalidateQueries({ queryKey: COST_KEY });
      resetForm();
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => extraQuantityService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXTRAS_KEY });
      queryClient.invalidateQueries({ queryKey: COST_KEY });
    },
  });

  function formatDate(isoDate: string): string {
    return new Date(isoDate + 'T00:00:00').toLocaleDateString();
  }

  function getMenuItemLabel(menuItemId: string): string {
    const item = menuItems.find((i) => i.id === menuItemId);
    if (!item) return menuItemId;
    return `${item.meal.name} — ${item.supplierName} · ${formatDate(item.day)}`;
  }

  return (
    <div className='border rounded-lg overflow-hidden'>
      <div className='bg-muted/40 px-3 py-2 flex items-center justify-between border-b'>
        <span className='text-xs font-semibold'>
          {t('windows.detail.extras.title')}{' '}
          <span className='font-normal text-muted-foreground'>
            ({t('windows.detail.extras.subtitle')})
          </span>
        </span>
        {!showForm && (
          <Button variant='outline' size='sm' className='text-xs h-7' onClick={() => setShowForm(true)}>
            {t('windows.detail.extras.addRow')}
          </Button>
        )}
      </div>

      {extras.length > 0 && (
        <>
          <div className='grid grid-cols-[140px_1fr_50px_32px] gap-2 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground bg-muted/20 border-b'>
            <span>
              {t('windows.detail.extras.guestNameHeader')}{' '}
              <span className='font-normal'>({t('windows.detail.extras.guestNameOptional')})</span>
            </span>
            <span>{t('windows.detail.extras.mealHeader')}</span>
            <span className='text-center'>{t('windows.detail.extras.qtyHeader')}</span>
            <span />
          </div>
          {extras.map((extra) => (
            <div
              key={extra.id}
              className='grid grid-cols-[140px_1fr_50px_32px] gap-2 px-3 py-2 items-center border-b last:border-b-0 text-xs'
            >
              {extra.guestName ? (
                <span className='text-foreground'>{extra.guestName}</span>
              ) : (
                <span className='text-muted-foreground italic'>—</span>
              )}
              <div>
                <div className='font-medium'>{menuItems.find((i) => i.id === extra.menuItemId)?.meal.name ?? '—'}</div>
                <div className='text-[10px] text-muted-foreground'>
                  {menuItems.find((i) => i.id === extra.menuItemId)?.supplierName ?? ''}{' '}
                  · {formatDate(menuItems.find((i) => i.id === extra.menuItemId)?.day ?? '')}
                </div>
              </div>
              <span className='text-center font-semibold'>{extra.quantity}</span>
              <button
                className='text-muted-foreground hover:text-destructive transition-colors text-base leading-none'
                onClick={() => removeMutation.mutate(extra.id)}
                disabled={removeMutation.isPending}
              >
                ×
              </button>
            </div>
          ))}
        </>
      )}

      {showForm && (
        <div className='bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-900 px-3 py-2.5'>
          <div className='text-[10px] font-semibold text-green-800 dark:text-green-300 mb-2'>
            {t('windows.detail.extras.newRowTitle')}
          </div>
          <div className='grid grid-cols-[140px_110px_1fr_60px_32px] gap-2 items-start'>
            <div>
              <div className='text-[9px] text-muted-foreground mb-1'>
                {t('windows.detail.extras.guestNameHeader')} ({t('windows.detail.extras.guestNameOptional')})
              </div>
              <Input
                className='h-7 text-xs'
                placeholder={t('windows.detail.extras.guestNamePlaceholder')}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>
            <div>
              <div className='text-[9px] text-muted-foreground mb-1'>{t('windows.detail.extras.dateLabel')}</div>
              <select
                className='w-full h-7 border border-input rounded-md px-2 text-xs bg-background'
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
              >
                {targetDates.map((d) => (
                  <option key={d} value={d}>
                    {formatDate(d)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className='text-[9px] text-muted-foreground mb-1'>
                {t('windows.detail.extras.mealLabel')}{' '}
                <span className='text-muted-foreground/60'>
                  {t('windows.detail.extras.mealFilteredHint', { date: formatDate(selectedDate) })}
                </span>
              </div>
              <select
                className='w-full h-7 border border-input rounded-md px-2 text-xs bg-background'
                value={selectedMenuItemId}
                onChange={(e) => setSelectedMenuItemId(e.target.value)}
              >
                <option value=''>—</option>
                {filteredItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.meal.name} — {item.supplierName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className='text-[9px] text-muted-foreground mb-1'>{t('windows.detail.extras.qtyLabel')}</div>
              <Input
                type='number'
                min={1}
                className='h-7 text-xs text-center'
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div className='pt-4'>
              <button
                className='text-muted-foreground hover:text-destructive text-base leading-none'
                onClick={resetForm}
              >
                ×
              </button>
            </div>
          </div>
          <div className='flex gap-2 mt-2'>
            <Button
              size='sm'
              className='h-7 text-xs'
              disabled={!selectedMenuItemId || addMutation.isPending}
              onClick={() => addMutation.mutate()}
            >
              {t('windows.detail.extras.saveRow')}
            </Button>
            <Button variant='outline' size='sm' className='h-7 text-xs' onClick={resetForm}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
          </div>
        </div>
      )}

      <div className='px-3 py-2 text-[10px] text-muted-foreground italic'>
        {t('windows.detail.extras.hint')}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add `CostSummarySection` component**

```tsx
function CostSummarySection({ windowId }: { windowId: string }) {
  const { t } = useTranslation('meals');
  const { reportService } = useServices();

  const { data: costSummary = [] } = useQuery<IWindowCostSummary[]>({
    queryKey: ['reports', 'cost-summary', windowId],
    queryFn: () => reportService.getCostSummary(windowId),
  });

  if (costSummary.length === 0) return null;

  const grandTotal = costSummary.reduce((sum, row) => sum + row.totalCost, 0);

  return (
    <div className='border rounded-lg overflow-hidden'>
      <div className='bg-muted/40 px-3 py-2 border-b'>
        <span className='text-xs font-semibold'>{t('windows.detail.costSummary.title')}</span>
        <span className='text-[10px] text-muted-foreground ml-2'>
          ({t('windows.detail.costSummary.subtitle')})
        </span>
      </div>
      <div className='px-3 py-2.5'>
        <div className='grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-xs mb-2'>
          {costSummary.map((row) => (
            <React.Fragment key={row.supplierId}>
              <span className='text-foreground'>{row.supplierName}</span>
              <span className='font-semibold text-right'>
                {row.totalCost.toLocaleString()} RSD
              </span>
            </React.Fragment>
          ))}
        </div>
        <div className='border-t pt-2 grid grid-cols-[1fr_auto] gap-x-6 text-sm font-bold'>
          <span>{t('windows.detail.costSummary.total')}</span>
          <span>{grandTotal.toLocaleString()} RSD</span>
        </div>
        <div className='text-[10px] text-muted-foreground mt-1.5'>
          {t('windows.detail.costSummary.disclaimer')}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire both components into `WindowDetails`**

In `WindowDetails`, inside the `{isExpired && <WindowReportsPanel windowId={windowId} />}` area, add the two new sections BEFORE `WindowReportsPanel`. The section currently looks like:

```tsx
<div className='space-y-3'>
  <div className='flex items-center justify-between'>
    ... order summary header + download button ...
  </div>

  {isExpired && <WindowReportsPanel windowId={windowId} />}
</div>
```

Change it to:

```tsx
<div className='space-y-3'>
  <div className='flex items-center justify-between'>
    ... order summary header + download button ...
  </div>

  {isExpired && (
    <ExtraQuantitiesSection
      windowId={windowId}
      menuItems={menuItems}
      targetDates={targetDates}
    />
  )}

  {isExpired && <CostSummarySection windowId={windowId} />}

  {isExpired && <WindowReportsPanel windowId={windowId} />}
</div>
```

- [ ] **Step 5: Start the full stack and test**

```bash
npm run start:dev
```

Open the app, navigate to an expired window. Verify:
1. "Additional quantities" section appears below the XLSX download button
2. Click "+ Add row" — the inline form appears with a date dropdown and meal dropdown (filtered by date)
3. Add an anonymous extra (no name) — row appears with em-dash in guest name column
4. Add a named guest extra — row appears with the guest name
5. "Estimated cost" section shows per-supplier breakdown and grand total (only when menu items have prices)
6. Removing a row updates both sections
7. Click "+ Add row" → select a date → verify the meal dropdown only shows items for that date
8. Language switch (EN/SR) — verify all labels change correctly

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/meal-selection-windows/presentation/pages/meal-selection-windows.page.tsx
git commit -m "feat(web): add ExtraQuantitiesSection and CostSummarySection to window detail panel"
```

---

## Verification

Run the full verification from the spec:

1. `npm run start:dev`
2. Open an expired window → "Additional quantities" section is visible below the XLSX download button
3. Add an anonymous extra (no name): verify it increases the quantity in the supplier email preview and XLSX summary sheet; verify it does NOT appear in the XLSX day sheet
4. Add a named extra: verify it appears as an individual row in the XLSX day sheet for the correct date; verify the quantity is also reflected in the summary sheet total
5. Check the cost summary: add/remove extras and confirm per-supplier and grand total update correctly
6. Items with no price: verify they're excluded from the cost total with the disclaimer shown
7. Send an email after adding extras: verify the supplier receives the correct merged quantities
