import { plainToInstance, Transform } from 'class-transformer';
import { IsBoolean, IsString, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  DB_HOST: string;

  @IsString()
  DB_PORT: string;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  NODE_ENV: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ORM_SYNC: boolean;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config);
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
