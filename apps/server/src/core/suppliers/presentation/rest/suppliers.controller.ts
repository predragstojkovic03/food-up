import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from '../../application/suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly _suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({
    status: 201,
    description: 'Supplier created',
    type: SupplierResponseDto,
  })
  async create(@Body() dto: CreateSupplierDto): Promise<SupplierResponseDto> {
    const result = await this._suppliersService.create(dto);
    return this.toResponseDto(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({
    status: 200,
    description: 'List of suppliers',
    type: [SupplierResponseDto],
  })
  async findAll(): Promise<SupplierResponseDto[]> {
    const result = await this._suppliersService.findAll();
    return result.map(this.toResponseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by ID' })
  @ApiResponse({
    status: 200,
    description: 'Supplier found',
    type: SupplierResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findOne(@Param('id') id: string): Promise<SupplierResponseDto> {
    const result = await this._suppliersService.findOne(id);
    return this.toResponseDto(result);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiResponse({
    status: 200,
    description: 'Supplier updated',
    type: SupplierResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    const result = await this._suppliersService.update(id, dto);
    return this.toResponseDto(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deleted' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this._suppliersService.delete(id);
  }

  private toResponseDto(entity: any): SupplierResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      contactInfo: entity.contactInfo,
      businessIds: entity.businessIds ?? [],
    };
  }
}
