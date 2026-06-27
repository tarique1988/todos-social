import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-payload';
import { type ConfigType } from '@nestjs/config';
import jwtConfig from '../../env/jwt.config';
import { Inject } from '@nestjs/common';
import { AuthenticatedUser } from '../types/authenticated-user';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    config: ConfigType<typeof jwtConfig>,
  ) {
    super({
      secretOrKey: config.accessSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }
  override validate(payload: JwtPayload): AuthenticatedUser {
    return { id: payload.sub, username: payload.username };
  }
}
