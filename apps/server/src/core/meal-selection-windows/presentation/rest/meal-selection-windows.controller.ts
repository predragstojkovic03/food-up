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
import { EmployeeRole, IdentityType } from '@food-up/shared';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import {
  CurrentMealSelectionWindowResult,
  MealSelectionWindowsService,
  RelevantMealSelectionWindowResult,
} from '../../application/meal-selection-windows.service';
import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { CreateMealSelectionWindowDto } from './dto/create-meal-selection-window.dto';
import { GetCurrentMealSelectionWindowResponseDto } from './dto/get-current-meal-selection-window-response.dto';
import { MealSelectionWindowResponseDto } from './dto/meal-selection-window-response.dto';
import { UpdateMealSelectionWindowDto } from './dto/update-meal-selection-window.dto';
import { RelevantMealSelectionWindowResponseDto } from './dto/relevant-meal-selection-window-response.dto';
import { WindowMenuItemResponseDto } from './dto/window-menu-item-response.dto';

@ApiTags('MealSelectionWindows')
@Controller('meal-selection-windows')
export class MealSelectionWindowsController {
  constructor(
    private readonly _mealSelectionWindowService: MealSelectionWindowsService,
  ) {}

  @ApiOperation({ summary: 'Create a new meal selection window' })
  @ApiResponse({
    status: 201,
    description: 'Meal selection window created',
    type: MealSelectionWindowResponseDto,
  })
  // ...removed global guard...
  @RequiredIdentityType(IdentityType.Employee)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @ApiBearerAuth()
  @Post()
  async create(
    @Body() dto: CreateMealSelectionWindowDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MealSelectionWindowResponseDto> {
    const result = await this._mealSelectionWindowService.create(sub, dto);
    return this.toResponseDto(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal selection windows' })
  @ApiResponse({
    status: 200,
    description: 'List of meal selection windows',
    type: [MealSelectionWindowResponseDto],
  })
  @ApiBearerAuth()
  async findAll(): Promise<MealSelectionWindowResponseDto[]> {
    const result = await this._mealSelectionWindowService.findAll();
    return result.map((e) => this.toResponseDto(e));
  }

  @RequiredIdentityType(IdentityType.Employee)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @ApiBearerAuth()
  @Get('business')
  @ApiOperation({ summary: 'Get all meal selection windows for the manager\'s business' })
  @ApiResponse({
    status: 200,
    description: 'List of meal selection windows for this business',
    type: [MealSelectionWindowResponseDto],
  })
  async findByMyBusiness(
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MealSelectionWindowResponseDto[]> {
    const result = await this._mealSelectionWindowService.findByMyBusiness(sub);
    return result.map((e) => this.toResponseDto(e));
  }

  @RequiredIdentityType(IdentityType.Employee)
  @ApiBearerAuth()
  @Get('current')
  async getCurrent(
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<GetCurrentMealSelectionWindowResponseDto> {
    const result = await this._mealSelectionWindowService.findCurrent(sub);
    return this.toCurrentResponseDto(result);
  }

  @RequiredIdentityType(IdentityType.Employee)
  @ApiBearerAuth()
  @Get('my-relevant')
  @ApiOperation({ summary: 'Get the latest published window for the employee (active or past deadline)' })
  @ApiResponse({ status: 200, type: RelevantMealSelectionWindowResponseDto })
  async getMyRelevant(
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<RelevantMealSelectionWindowResponseDto | null> {
    const result = await this._mealSelectionWindowService.findRelevant(sub);
    if (!result) return null;
    return this.toRelevantResponseDto(result);
  }

  @RequiredIdentityType(IdentityType.Employee)
  @ApiBearerAuth()
  @Get(':id/menu-items')
  @ApiOperation({ summary: 'Get enriched menu items for a meal selection window' })
  @ApiResponse({ status: 200, type: [WindowMenuItemResponseDto] })
  async getMenuItems(
    @Param('id') id: string,
  ): Promise<WindowMenuItemResponseDto[]> {
    const menuItems = await this._mealSelectionWindowService.findMenuItemsForWindow(id);
    return plainToInstance(WindowMenuItemResponseDto, menuItems);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meal selection window by ID' })
  @ApiResponse({
    status: 200,
    description: 'Meal selection window found',
    type: MealSelectionWindowResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Meal selection window not found' })
  @ApiBearerAuth()
  async findOne(
    @Param('id') id: string,
  ): Promise<MealSelectionWindowResponseDto> {
    const result = await this._mealSelectionWindowService.findOne(id);
    return this.toResponseDto(result);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a meal selection window' })
  @ApiResponse({
    status: 200,
    description: 'Meal selection window updated',
    type: MealSelectionWindowResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Meal selection window not found' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMealSelectionWindowDto,
  ): Promise<MealSelectionWindowResponseDto> {
    const result = await this._mealSelectionWindowService.update(id, dto);
    return this.toResponseDto(result);
  }

  @ApiOperation({ summary: 'Delete a meal selection window' })
  @ApiResponse({ status: 200, description: 'Meal selection window deleted' })
  @ApiResponse({ status: 404, description: 'Meal selection window not found' })
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this._mealSelectionWindowService.delete(id);
  }

  private toRelevantResponseDto(
    result: RelevantMealSelectionWindowResult,
  ): RelevantMealSelectionWindowResponseDto {
    return plainToInstance(
      RelevantMealSelectionWindowResponseDto,
      {
        id: result.id,
        startTime: result.startTime.toISOString(),
        endTime: result.endTime.toISOString(),
        targetDates: result.targetDates,
        isActive: result.isActive,
      },
      { strategy: 'excludeAll' },
    );
  }

  private toCurrentResponseDto(
    result: CurrentMealSelectionWindowResult,
  ): GetCurrentMealSelectionWindowResponseDto {
    return plainToInstance(
      GetCurrentMealSelectionWindowResponseDto,
      {
        id: result.id,
        startTime: result.startTime.toISOString(),
        endTime: result.endTime.toISOString(),
        targetDates: result.targetDates,
        menuItems: result.menuItems,
      },
      { strategy: 'excludeAll' },
    );
  }

  private toResponseDto(
    entity: MealSelectionWindow,
  ): MealSelectionWindowResponseDto {
    const dto: MealSelectionWindowResponseDto = {
      id: entity.id,
      startTime: entity.startTime.toISOString(),
      endTime: entity.endTime.toISOString(),
      menuPeriodIds: entity.menuPeriodIds,
      targetDates: Array.from(entity.targetDates),
      isLocked: entity.isLocked,
    };
    return plainToInstance(MealSelectionWindowResponseDto, dto, {
      strategy: 'excludeAll',
    });
  }
}
