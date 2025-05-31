import { Body, Controller, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateBusinessUseCase } from '../../application/use-cases/create-business.use-case';
import {
  CreateBusinessRequestDto,
  CreateBusinessResponseDto,
} from './dto/create-business.dto';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly _createBusinessUseCase: CreateBusinessUseCase) {}

  @Post()
  async create(
    @Body() createBusinessDto: CreateBusinessRequestDto,
  ): Promise<CreateBusinessResponseDto> {
    const business =
      await this._createBusinessUseCase.execute(createBusinessDto);

    return plainToInstance(CreateBusinessResponseDto, business);
  }
}
