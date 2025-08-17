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
import { BusinessSuppliersService } from '../../application/business-suppliers.service';

@ApiTags('BusinessSuppliers')
@Controller('business-suppliers')
export class BusinessSuppliersController {
  constructor(
    private readonly _businessSuppliersService: BusinessSuppliersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new business supplier' })
  @ApiResponse({ status: 201, description: 'Business supplier created' })
  async create(@Body() dto: any) {
    return this._businessSuppliersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all business suppliers' })
  @ApiResponse({ status: 200, description: 'List of business suppliers' })
  async findAll() {
    return this._businessSuppliersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a business supplier by ID' })
  @ApiResponse({ status: 200, description: 'Business supplier found' })
  @ApiResponse({ status: 404, description: 'Business supplier not found' })
  async findOne(@Param('id') id: string) {
    return this._businessSuppliersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this._businessSuppliersService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this._businessSuppliersService.delete(id);
  }
}
