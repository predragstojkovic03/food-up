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
import { Public } from 'src/core/auth/infrastructure/public.decorator';
import { RequiredEmployeeRole } from 'src/core/employees/presentation/rest/employee-role.decorator';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { EmployeeRole } from 'src/shared/domain/role.enum';
import { SuppliersService } from '../../application/suppliers.service';
import { Supplier } from '../../domain/supplier.entity';
import { CreateManagedSupplierDto } from './dto/create-managed-supplier.dto';
import { RegisterSupplierDto } from './dto/register-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly _suppliersService: SuppliersService) {}

  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({
    status: 201,
    description: 'Supplier created',
    type: SupplierResponseDto,
  })
  @Public
  @Post('register')
  async register(
    @Body() dto: RegisterSupplierDto,
  ): Promise<SupplierResponseDto> {
    const result = await this._suppliersService.register(dto);
    return this.toResponseDto(result);
  }

  @ApiOperation({ summary: 'Create a new managed supplier' })
  @ApiResponse({
    status: 201,
    description: 'Managed supplier created',
    type: SupplierResponseDto,
  })
  @RequiredIdentityType(IdentityType.Employee)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @ApiBearerAuth()
  @Post('managed')
  async createManagedSupplier(
    @Body() { contactInfo, name }: CreateManagedSupplierDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<SupplierResponseDto> {
    const result = await this._suppliersService.createManagedSupplier(sub, {
      contactInfo,
      name,
    });

    return this.toResponseDto(result);
  }

  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({
    status: 200,
    description: 'List of suppliers',
    type: [SupplierResponseDto],
  })
  @ApiBearerAuth()
  @Get()
  async findAll(): Promise<SupplierResponseDto[]> {
    const result = await this._suppliersService.findAll();
    return result.map(this.toResponseDto);
  }

  @ApiOperation({ summary: 'Get a supplier by ID' })
  @ApiResponse({
    status: 200,
    description: 'Supplier found',
    type: SupplierResponseDto,
  })
  @ApiBearerAuth()
  @Get(':id')
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findOne(@Param('id') id: string): Promise<SupplierResponseDto> {
    const result = await this._suppliersService.findOne(id);
    return this.toResponseDto(result);
  }

  @ApiOperation({ summary: 'Update a supplier' })
  @ApiResponse({
    status: 200,
    description: 'Supplier updated',
    type: SupplierResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<SupplierResponseDto> {
    const result = await this._suppliersService.update(id, sub, dto);
    return this.toResponseDto(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deleted' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiBearerAuth()
  async delete(@Param('id') id: string): Promise<void> {
    return this._suppliersService.delete(id);
  }

  private toResponseDto(entity: Supplier): SupplierResponseDto {
    const response: SupplierResponseDto = {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      contactInfo: entity.contactInfo,
      businessIds: entity.businessIds ?? [],
      managingBusinessId: entity.managingBusinessId,
    };

    return plainToInstance(SupplierResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }
}
