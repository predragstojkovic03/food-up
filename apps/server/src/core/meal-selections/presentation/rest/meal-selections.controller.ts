import { EmployeeRole, IdentityType } from '@food-up/shared';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CurrentIdentity } from 'src/core/auth/presentation/rest/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/application/jwt-payload';
import { RequiredEmployeeRole } from 'src/core/employees/presentation/rest/employee-role.decorator';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { MealSelectionsService } from '../../application/meal-selections.service';
import { MealSelectionOverviewQueryService } from '../../application/queries/meal-selection-overview-query.service';
import { MealSelection } from '../../domain/meal-selection.entity';
import { CreateMealSelectionDto } from './dto/create-meal-selection.dto';
import { MealSelectionResponseDto } from './dto/meal-selection-response.dto';
import { MyMealSelectionResponseDto } from './dto/my-meal-selection-response.dto';
import { UpdateMealSelectionDto } from './dto/update-meal-selection.dto';
import { WindowDailyOverviewResponseDto } from './dto/window-daily-overview-response.dto';

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
  @ApiResponse({
    status: 404,
    description: "Window not found in the caller's business",
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

  @RequiredIdentityType(IdentityType.Employee)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @ApiBearerAuth()
  @Get('window/:windowId')
  @ApiOperation({
    summary: 'Get all meal selections for a window (manager view)',
  })
  @ApiResponse({ status: 200, type: [MealSelectionResponseDto] })
  @ApiResponse({
    status: 404,
    description: "Window not found in the caller's business",
  })
  async findByWindow(
    @Param('windowId') windowId: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MealSelectionResponseDto[]> {
    const result = await this._mealSelectionsService.findByWindowInMyBusiness(
      windowId,
      sub,
    );
    return result.map((e) => this.toResponseDto(e));
  }

  @RequiredIdentityType(IdentityType.Employee)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @ApiBearerAuth()
  @Get('window/:windowId/daily-overview')
  @ApiOperation({
    summary:
      'Get per-employee daily order overview for a window (manager view)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of per-employee per-day overview items',
    type: [WindowDailyOverviewResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: "Window not found in the caller's business",
  })
  async getDailyOverview(
    @Param('windowId') windowId: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<WindowDailyOverviewResponseDto[]> {
    const items = await this._overviewQueryService.getDailyOverview(
      windowId,
      sub,
    );
    return plainToInstance(WindowDailyOverviewResponseDto, items, {
      excludeExtraneousValues: true,
    });
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
      await this._mealSelectionsService.findMySelectionsForWindow(
        sub,
        windowId,
      ),
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
