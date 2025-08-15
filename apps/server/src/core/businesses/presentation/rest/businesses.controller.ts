import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreateBusinessUseCase } from '../../application/use-cases/create-business.use-case';
import { FindAllBusinessesUseCase } from '../../application/use-cases/find-all-businesses.use-case';
import { BusinessResponseDto } from './dto/business-response.dto';
import { CreateBusinessRequestDto } from './dto/create-business.dto';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(
    private readonly _createBusinessUseCase: CreateBusinessUseCase,
    private readonly _findAllBusinessesUseCase: FindAllBusinessesUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new business' })
  @ApiResponse({ status: 201, type: BusinessResponseDto })
  async create(
    @Body() createBusinessDto: CreateBusinessRequestDto,
  ): Promise<BusinessResponseDto> {
    const business =
      await this._createBusinessUseCase.execute(createBusinessDto);

    return plainToInstance(BusinessResponseDto, business);
  }

  @Get()
  @ApiOperation({ summary: 'Get all businesses' })
  @ApiResponse({ status: 200, type: [BusinessResponseDto] })
  async findAll(): Promise<BusinessResponseDto[]> {
    const businesses = await this._findAllBusinessesUseCase.execute();

    return plainToInstance(BusinessResponseDto, businesses);
  }
}
