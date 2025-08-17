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

import { ReportsService } from '../../application/reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly _reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiResponse({ status: 201, type: ReportResponseDto })
  async create(@Body() dto: CreateReportDto): Promise<ReportResponseDto> {
    const report = await this._reportsService.create(dto);
    return plainToInstance(ReportResponseDto, report);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({ status: 200, type: [ReportResponseDto] })
  async findAll(): Promise<ReportResponseDto[]> {
    const reports = await this._reportsService.findAll();
    return plainToInstance(ReportResponseDto, reports);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReportResponseDto> {
    const report = await this._reportsService.findOne(id);
    return plainToInstance(ReportResponseDto, report);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
  ): Promise<ReportResponseDto> {
    const report = await this._reportsService.update(id, dto);
    return plainToInstance(ReportResponseDto, report);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this._reportsService.delete(id);
  }
}
