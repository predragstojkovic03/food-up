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
import { plainToInstance } from 'class-transformer';

import { ReportItemsService } from '../../application/report-items.service';
import { CreateReportItemDto } from './dto/create-report-item.dto';
import { ReportItemResponseDto } from './dto/report-item-response.dto';
import { UpdateReportItemDto } from './dto/update-report-item.dto';

@ApiTags('ReportItems')
@Controller('report-items')
export class ReportItemsController {
  constructor(private readonly _reportItemsService: ReportItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report item' })
  @ApiResponse({ status: 201, type: ReportItemResponseDto })
  async create(
    @Body() dto: CreateReportItemDto,
  ): Promise<ReportItemResponseDto> {
    const item = await this._reportItemsService.create(dto);
    return plainToInstance(ReportItemResponseDto, item);
  }

  @Get()
  @ApiOperation({ summary: 'Get all report items' })
  @ApiResponse({ status: 200, type: [ReportItemResponseDto] })
  async findAll(): Promise<ReportItemResponseDto[]> {
    const items = await this._reportItemsService.findAll();
    return plainToInstance(ReportItemResponseDto, items);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReportItemResponseDto> {
    const item = await this._reportItemsService.findOne(id);
    return plainToInstance(ReportItemResponseDto, item);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReportItemDto,
  ): Promise<ReportItemResponseDto> {
    const item = await this._reportItemsService.update(id, dto);
    return plainToInstance(ReportItemResponseDto, item);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this._reportItemsService.delete(id);
  }
}
