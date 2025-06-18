import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSupplierUseCase } from '../../application/use-cases/create-supplier.use-case';
import { DeleteSupplierUseCase } from '../../application/use-cases/delete-supplier.use-case';
import { FindAllSuppliersUseCase } from '../../application/use-cases/find-all-suppliers.use-case';
import { FindSupplierUseCase } from '../../application/use-cases/find-supplier.use-case';
import { UpdateSupplierUseCase } from '../../application/use-cases/update-supplier.use-case';

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
  async create(@Body() dto: any) {
    return this.createSupplier.execute(dto);
  }

  @Get()
  async findAll() {
    return this.findAllSuppliers.execute();
  }

  @Get(':id')
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
