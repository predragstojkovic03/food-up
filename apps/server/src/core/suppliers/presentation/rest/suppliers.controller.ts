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
import { CreateSupplierUseCase } from '../../application/use-cases/create-supplier.use-case';
import { DeleteSupplierUseCase } from '../../application/use-cases/delete-supplier.use-case';
import { FindAllSuppliersUseCase } from '../../application/use-cases/find-all-suppliers.use-case';
import { FindSupplierUseCase } from '../../application/use-cases/find-supplier.use-case';
import { UpdateSupplierUseCase } from '../../application/use-cases/update-supplier.use-case';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(
    private readonly createSupplier: CreateSupplierUseCase,
    private readonly findAllSuppliers: FindAllSuppliersUseCase,
    private readonly findSupplier: FindSupplierUseCase,
    private readonly updateSupplier: UpdateSupplierUseCase,
    private readonly deleteSupplier: DeleteSupplierUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created' })
  async create(@Body() dto: any) {
    return this.createSupplier.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'List of suppliers' })
  async findAll() {
    return this.findAllSuppliers.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier found' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findOne(@Param('id') id: string) {
    return this.findSupplier.execute(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.updateSupplier.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.deleteSupplier.execute(id);
  }
}
