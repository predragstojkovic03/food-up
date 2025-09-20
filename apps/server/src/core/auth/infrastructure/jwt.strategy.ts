import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { JwtPayload } from './jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        console.log(req.headers);
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: 'yourSecret',
    });
  }

  async validate(payload: any): Promise<JwtPayload> {
    return this.validatePayload(payload);
  }

  private async validatePayload(payload: any): Promise<JwtPayload> {
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
