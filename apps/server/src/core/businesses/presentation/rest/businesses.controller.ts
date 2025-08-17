import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { BusinessesService } from '../../application/businesses.service';
import { BusinessResponseDto } from './dto/business-response.dto';
import { CreateBusinessRequestDto } from './dto/create-business.dto';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly _businessesService: BusinessesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new business' })
  @ApiResponse({ status: 201, type: BusinessResponseDto })
  async create(
    @Body() createBusinessDto: CreateBusinessRequestDto,
  ): Promise<BusinessResponseDto> {
    const business = await this._businessesService.create(createBusinessDto);
    return plainToInstance(BusinessResponseDto, business);
  }

  @Get()
  @ApiOperation({ summary: 'Get all businesses' })
  @ApiResponse({ status: 200, type: [BusinessResponseDto] })
  async findAll(): Promise<BusinessResponseDto[]> {
    const businesses = await this._businessesService.findAll();
    return plainToInstance(BusinessResponseDto, businesses);
  }
}
