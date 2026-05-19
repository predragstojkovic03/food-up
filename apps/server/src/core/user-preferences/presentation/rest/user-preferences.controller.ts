import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CurrentIdentity } from 'src/core/auth/infrastructure/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { UserPreferencesService } from '../../application/user-preferences.service';
import { UpdateUserPreferencesRequestDto } from './dto/update-user-preferences-request.dto';
import { UserPreferencesResponseDto } from './dto/user-preferences-response.dto';

@ApiTags('User Preferences')
@Controller('me/preferences')
export class UserPreferencesController {
  constructor(private readonly _service: UserPreferencesService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user preferences' })
  @ApiResponse({ status: 200, type: UserPreferencesResponseDto })
  async getPreferences(@CurrentIdentity() identity: JwtPayload): Promise<UserPreferencesResponseDto> {
    const prefs = await this._service.getOrCreate(identity.sub);
    return plainToInstance(UserPreferencesResponseDto, { theme: prefs.theme }, { excludeExtraneousValues: true });
  }

  @Patch()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user preferences' })
  @ApiResponse({ status: 200, type: UserPreferencesResponseDto })
  async updatePreferences(
    @CurrentIdentity() identity: JwtPayload,
    @Body() dto: UpdateUserPreferencesRequestDto,
  ): Promise<UserPreferencesResponseDto> {
    const prefs = await this._service.update(identity.sub, dto.theme);
    return plainToInstance(UserPreferencesResponseDto, { theme: prefs.theme }, { excludeExtraneousValues: true });
  }
}
