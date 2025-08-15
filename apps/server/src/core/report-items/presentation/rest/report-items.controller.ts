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

import { CreateReportItemUseCase } from '../../application/use-cases/create-report-item.use-case';
import { DeleteReportItemUseCase } from '../../application/use-cases/delete-report-item.use-case';
import { FindAllReportItemsUseCase } from '../../application/use-cases/find-all-report-items.use-case';
import { FindReportItemUseCase } from '../../application/use-cases/find-report-item.use-case';
import { UpdateReportItemUseCase } from '../../application/use-cases/update-report-item.use-case';
import { CreateReportItemDto } from './dto/create-report-item.dto';
import { ReportItemResponseDto } from './dto/report-item-response.dto';
import { UpdateReportItemDto } from './dto/update-report-item.dto';

@ApiTags('ReportItems')
@Controller('report-items')
export class ReportItemsController {
  constructor(
    private readonly createReportItem: CreateReportItemUseCase,
    private readonly findAllReportItems: FindAllReportItemsUseCase,
    private readonly findReportItem: FindReportItemUseCase,
    private readonly updateReportItem: UpdateReportItemUseCase,
    private readonly deleteReportItem: DeleteReportItemUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report item' })
  @ApiResponse({ status: 201, type: ReportItemResponseDto })
  async create(
    @Body() dto: CreateReportItemDto,
  ): Promise<ReportItemResponseDto> {
    const item = await this.createReportItem.execute(dto);
    return plainToInstance(ReportItemResponseDto, item);
  }

  @Get()
  @ApiOperation({ summary: 'Get all report items' })
  @ApiResponse({ status: 200, type: [ReportItemResponseDto] })
  async findAll(): Promise<ReportItemResponseDto[]> {
    const items = await this.findAllReportItems.execute();
    return plainToInstance(ReportItemResponseDto, items);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReportItemResponseDto> {
    const item = await this.findReportItem.execute(id);
    return plainToInstance(ReportItemResponseDto, item);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReportItemDto,
  ): Promise<ReportItemResponseDto> {
    const item = await this.updateReportItem.execute(id, dto);
    return plainToInstance(ReportItemResponseDto, item);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteReportItem.execute(id);
  }
}
