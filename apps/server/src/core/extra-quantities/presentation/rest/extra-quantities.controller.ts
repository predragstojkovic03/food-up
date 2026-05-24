import { EmployeeRole, IdentityType } from '@food-up/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
  constructor(private readonly _extraQuantitiesService: ExtraQuantitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Add an extra quantity for a guest' })
  @ApiResponse({ status: 201, type: ExtraQuantityResponseDto })
  async add(@Body() dto: CreateExtraQuantityDto): Promise<ExtraQuantityResponseDto> {
    const entity = await this._extraQuantitiesService.add(
      dto.windowId,
      dto.menuItemId,
      dto.quantity,
      dto.guestName ?? null,
    );
    return plainToInstance(ExtraQuantityResponseDto, entity, { strategy: 'excludeAll' });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an extra quantity row' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string): Promise<void> {
    return this._extraQuantitiesService.remove(id);
  }

  @Get()
  @ApiOperation({ summary: 'List extra quantities for a window' })
  @ApiQuery({ name: 'windowId', required: true, type: String })
  @ApiResponse({ status: 200, type: [ExtraQuantityResponseDto] })
  async findByWindow(@Query('windowId') windowId: string): Promise<ExtraQuantityResponseDto[]> {
    const entities = await this._extraQuantitiesService.findByWindow(windowId);
    return plainToInstance(ExtraQuantityResponseDto, entities, { strategy: 'excludeAll' });
  }
}
