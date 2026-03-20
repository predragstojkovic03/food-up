import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
}

export class EnvironmentVariables {
  @IsString()
  DB_HOST: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ORM_SYNC: boolean;

  @IsString()
  REDIS_HOST: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  REDIS_PORT: number;

  @IsString()
  WEB_APP_URL: string;

  @IsString()
  MAIL_FROM: string;
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
