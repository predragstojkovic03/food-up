import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { CreateReportUseCase } from '../../application/use-cases/create-report.use-case';
import { DeleteReportUseCase } from '../../application/use-cases/delete-report.use-case';
import { FindAllReportsUseCase } from '../../application/use-cases/find-all-reports.use-case';
import { FindReportUseCase } from '../../application/use-cases/find-report.use-case';
import { UpdateReportUseCase } from '../../application/use-cases/update-report.use-case';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly createReport: CreateReportUseCase,
    private readonly findAllReports: FindAllReportsUseCase,
    private readonly findReport: FindReportUseCase,
    private readonly updateReport: UpdateReportUseCase,
    private readonly deleteReport: DeleteReportUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateReportDto): Promise<ReportResponseDto> {
    const report = await this.createReport.execute(dto);
    return plainToInstance(ReportResponseDto, report);
  }

  @Get()
  async findAll(): Promise<ReportResponseDto[]> {
    const reports = await this.findAllReports.execute();
    return plainToInstance(ReportResponseDto, reports);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReportResponseDto> {
    const report = await this.findReport.execute(id);
    return plainToInstance(ReportResponseDto, report);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
  ): Promise<ReportResponseDto> {
    const report = await this.updateReport.execute(id, dto);
    return plainToInstance(ReportResponseDto, report);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteReport.execute(id);
  }
}
