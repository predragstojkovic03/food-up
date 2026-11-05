import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

export class OnboardBusinessManagerRequestDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'jane@acme.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class OnboardBusinessRequestDto {
  @ApiProperty({ example: 'Acme Corp', description: 'Business name' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'office@acme.com', description: 'Contact email' })
  @IsEmail()
  contactEmail: string;

  @ApiProperty({ example: '+381601234567', required: false })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ type: OnboardBusinessManagerRequestDto, description: 'The first manager of the business' })
  @ValidateNested()
  @Type(() => OnboardBusinessManagerRequestDto)
  manager: OnboardBusinessManagerRequestDto;
}
