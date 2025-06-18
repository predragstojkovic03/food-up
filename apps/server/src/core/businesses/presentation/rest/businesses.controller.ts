import { Body, Controller, Get, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateBusinessUseCase } from '../../application/use-cases/create-business.use-case';
import { FindAllBusinessesUseCase } from '../../application/use-cases/find-all-businesses.use-case';
import { BusinessResponseDto } from './dto/business-response.dto';
import { CreateBusinessRequestDto } from './dto/create-business.dto';

@Controller('businesses')
export class BusinessesController {
  constructor(
    private readonly _createBusinessUseCase: CreateBusinessUseCase,
    private readonly _findAllBusinessesUseCase: FindAllBusinessesUseCase,
  ) {}

  @Post()
  async create(
    @Body() createBusinessDto: CreateBusinessRequestDto,
  ): Promise<BusinessResponseDto> {
    const business =
      await this._createBusinessUseCase.execute(createBusinessDto);

    return plainToInstance(BusinessResponseDto, business);
  }

  @Get()
  async findAll(): Promise<BusinessResponseDto[]> {
    const businesses = await this._findAllBusinessesUseCase.execute();

    return plainToInstance(BusinessResponseDto, businesses);
  }
}
