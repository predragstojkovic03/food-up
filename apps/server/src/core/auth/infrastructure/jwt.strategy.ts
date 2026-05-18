import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvironmentVariables } from 'src/env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from 'src/shared/application/config-service.interface';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { JwtPayload } from './jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(I_CONFIG_SERVICE)
    config: IConfigService<EnvironmentVariables, true>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<JwtPayload> {
    return this._validatePayload(payload);
  }

  private async _validatePayload(payload: any): Promise<JwtPayload> {
    const instance = plainToInstance(JwtPayload, payload);
    const errors = await validate(instance);
    if (errors.length > 0) {
      throw new InvalidInputDataException(
        `Invalid JWT payload: ${errors.toString()}`,
      );
    }
    return instance;
  }
}
