import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateBusinessSupplierUseCase } from '../../application/use-cases/create-business-supplier.use-case';
import { DeleteBusinessSupplierUseCase } from '../../application/use-cases/delete-business-supplier.use-case';
import { FindAllBusinessSuppliersUseCase } from '../../application/use-cases/find-all-business-suppliers.use-case';
import { FindBusinessSupplierUseCase } from '../../application/use-cases/find-business-supplier.use-case';
import { UpdateBusinessSupplierUseCase } from '../../application/use-cases/update-business-supplier.use-case';

@Controller('business-suppliers')
export class BusinessSuppliersController {
  constructor(
    private readonly createBusinessSupplier: CreateBusinessSupplierUseCase,
    private readonly findAllBusinessSuppliers: FindAllBusinessSuppliersUseCase,
    private readonly findBusinessSupplier: FindBusinessSupplierUseCase,
    private readonly updateBusinessSupplier: UpdateBusinessSupplierUseCase,
    private readonly deleteBusinessSupplier: DeleteBusinessSupplierUseCase,
  ) {}

  @Post()
  async create(@Body() dto: any) {
    return this.createBusinessSupplier.execute(dto);
  }

  @Get()
  async findAll() {
    return this.findAllBusinessSuppliers.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.findBusinessSupplier.execute(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.updateBusinessSupplier.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.deleteBusinessSupplier.execute(id);
  }
}
