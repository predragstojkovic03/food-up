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

import { CreateChangeRequestUseCase } from '../../application/use-cases/create-change-request.use-case';
import { DeleteChangeRequestUseCase } from '../../application/use-cases/delete-change-request.use-case';
import { FindAllChangeRequestsUseCase } from '../../application/use-cases/find-all-change-requests.use-case';
import { FindChangeRequestUseCase } from '../../application/use-cases/find-change-request.use-case';
import { UpdateChangeRequestUseCase } from '../../application/use-cases/update-change-request.use-case';
import { ChangeRequestResponseDto } from './dto/change-request-response.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { UpdateChangeRequestDto } from './dto/update-change-request.dto';

@Controller('change-requests')
export class ChangeRequestsController {
  constructor(
    private readonly createChangeRequest: CreateChangeRequestUseCase,
    private readonly findAllChangeRequests: FindAllChangeRequestsUseCase,
    private readonly findChangeRequest: FindChangeRequestUseCase,
    private readonly updateChangeRequest: UpdateChangeRequestUseCase,
    private readonly deleteChangeRequest: DeleteChangeRequestUseCase,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateChangeRequestDto,
  ): Promise<ChangeRequestResponseDto> {
    const cr = await this.createChangeRequest.execute(dto);
    return plainToInstance(ChangeRequestResponseDto, cr);
  }

  @Get()
  async findAll(): Promise<ChangeRequestResponseDto[]> {
    const crs = await this.findAllChangeRequests.execute();
    return plainToInstance(ChangeRequestResponseDto, crs);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ChangeRequestResponseDto> {
    const cr = await this.findChangeRequest.execute(id);
    return plainToInstance(ChangeRequestResponseDto, cr);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateChangeRequestDto,
  ): Promise<ChangeRequestResponseDto> {
    const cr = await this.updateChangeRequest.execute(id, dto);
    return plainToInstance(ChangeRequestResponseDto, cr);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteChangeRequest.execute(id);
  }
}
