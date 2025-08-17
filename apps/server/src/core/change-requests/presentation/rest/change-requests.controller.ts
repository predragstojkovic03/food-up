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

import { ChangeRequestsService } from '../../application/change-requests.service';
import { ChangeRequestResponseDto } from './dto/change-request-response.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { UpdateChangeRequestDto } from './dto/update-change-request.dto';

@ApiTags('ChangeRequests')
@Controller('change-requests')
export class ChangeRequestsController {
  constructor(private readonly _changeRequestsService: ChangeRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new change request' })
  @ApiResponse({ status: 201, type: ChangeRequestResponseDto })
  async create(
    @Body() dto: CreateChangeRequestDto,
  ): Promise<ChangeRequestResponseDto> {
    const cr = await this._changeRequestsService.create(dto);
    return plainToInstance(ChangeRequestResponseDto, cr);
  }

  @Get()
  @ApiOperation({ summary: 'Get all change requests' })
  @ApiResponse({ status: 200, type: [ChangeRequestResponseDto] })
  async findAll(): Promise<ChangeRequestResponseDto[]> {
    const crs = await this._changeRequestsService.findAll();
    return plainToInstance(ChangeRequestResponseDto, crs);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ChangeRequestResponseDto> {
    const cr = await this._changeRequestsService.findOne(id);
    return plainToInstance(ChangeRequestResponseDto, cr);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateChangeRequestDto,
  ): Promise<ChangeRequestResponseDto> {
    const cr = await this._changeRequestsService.update(id, dto);
    return plainToInstance(ChangeRequestResponseDto, cr);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this._changeRequestsService.delete(id);
  }
}
