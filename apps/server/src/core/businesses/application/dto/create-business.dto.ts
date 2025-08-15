import { ApiProperty } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Acme Corp', description: 'Business name' })
  name: string;

  @ApiProperty({ example: 'contact@acme.com', description: 'Contact email' })
  contactEmail: string;

  @ApiProperty({
    example: '+123456789',
    description: 'Contact phone',
    required: false,
  })
  contactPhone?: string;
}
