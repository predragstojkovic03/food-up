import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ApiKeyProtected } from 'src/core/auth/infrastructure/api-key-protected.decorator';
import { BusinessOnboardingService } from '../../application/business-onboarding.service';
import { OnboardBusinessRequestDto } from './dto/onboard-business-request.dto';
import { OnboardBusinessResponseDto } from './dto/onboard-business-response.dto';

@ApiTags('Admin')
@Controller('admin/businesses')
export class BusinessOnboardingController {
  constructor(private readonly _onboardingService: BusinessOnboardingService) {}

  @Post()
  @ApiKeyProtected()
  @ApiOperation({ summary: 'Onboard a business together with its first manager (operator only)' })
  @ApiResponse({ status: 201, type: OnboardBusinessResponseDto })
  @ApiResponse({ status: 401, description: 'Missing or invalid API key' })
  @ApiResponse({ status: 404, description: 'Onboarding is disabled (ADMIN_API_KEY not configured)' })
  @ApiResponse({ status: 409, description: 'Business name, contact email or manager email already in use' })
  async onboard(@Body() dto: OnboardBusinessRequestDto): Promise<OnboardBusinessResponseDto> {
    const { business, manager } = await this._onboardingService.onboard(dto);
    return plainToInstance(
      OnboardBusinessResponseDto,
      {
        business,
        manager: { id: manager.id, name: manager.name, email: dto.manager.email },
      },
      { excludeExtraneousValues: true },
    );
  }
}
