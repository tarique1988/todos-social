import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { hash, verify } from 'argon2';
import { LoginDto } from './dto/login.dto';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim().toLowerCase();
    const password = dto.password;

    const existing = await this.findUserByEmailOrUsername(email, username);

    if (existing?.email == email) {
      throw new ConflictException('Email already exists');
    }

    if (existing?.username == username) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await hash(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
      },
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.findUserByLogin(dto.login);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const valid = await verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const accessToken = await this.tokenService.generateAccessToken(
      user.id,
      user.username,
    );
    const refresh = await this.tokenService.generateRefreshToken(user.id);

    await this.prisma.refreshToken.create({
      data: {
        id: refresh.jti,
        tokenHash: refresh.hash,
        userId: user.id,
        expiresAt: refresh.expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refresh,
    };
  }

  async refresh(token: string) {
    try {
      let { sub, jti } = await this.tokenService.verifyRefreshToken(token);
      const refreshToken = await this.prisma.refreshToken.findFirst({
        where: { id: jti, userId: sub },
        include: { user: true },
      });

      if (!refreshToken) {
        throw new UnauthorizedException('Invalid Credentials');
      }

      let hash = this.tokenService.hashRefreshToken(token);
      if (
        refreshToken.tokenHash !== hash ||
        refreshToken.revokedAt != null ||
        refreshToken.expiresAt < new Date()
      ) {
        throw new UnauthorizedException('Invalid Credentials');
      }

      await this.prisma.refreshToken.update({
        where: {
          id: jti,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      const newRefreshToken = await this.tokenService.generateRefreshToken(
        refreshToken.userId,
      );

      await this.prisma.refreshToken.create({
        data: {
          id: newRefreshToken.jti,
          expiresAt: newRefreshToken.expiresAt,
          tokenHash: newRefreshToken.hash,
          userId: refreshToken.userId,
        },
      });
      const newAccessToken = await this.tokenService.generateAccessToken(
        refreshToken.userId,
        refreshToken.user.username,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid Credentials');
    }
  }

  private async findUserByEmailOrUsername(email: string, username: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
      },
    });
  }
  private async findUserByLogin(login: string) {
    const normalized = login.trim().toLowerCase();

    return normalized.includes('@')
      ? this.prisma.user.findUnique({
          where: { email: normalized },
        })
      : this.prisma.user.findUnique({
          where: { username: normalized },
        });
  }
}
