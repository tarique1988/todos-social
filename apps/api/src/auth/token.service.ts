import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
import { type ConfigType } from '@nestjs/config';
import { GeneratedRefreshToken } from './types/generated-refresh-token';
import jwtConfig from '../env/jwt.config';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  async generateAccessToken(userId: string, username: string) {
    const expiresIn = this.config.accessTtl;

    const accessToken = await this.jwtService.signAsync(
      { sub: userId, username },
      {
        expiresIn,
        secret: this.config.accessSecret,
      },
    );

    return accessToken;
  }

  async generateRefreshToken(userId: string): Promise<GeneratedRefreshToken> {
    const refreshTokenId = randomUUID();
    const expiresIn = this.config.refreshTtl;
    const maxAge = this.config.refreshMaxAgeMs;
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        jti: refreshTokenId,
      },
      {
        expiresIn,
        secret: this.config.refreshSecret,
      },
    );

    return {
      token: refreshToken,
      jti: refreshTokenId,
      hash: this.hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + maxAge),
      maxAge,
    };
  }

  async verifyAccessToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.config.accessSecret,
    });
  }

  async verifyRefreshToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.config.refreshSecret,
    });
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
