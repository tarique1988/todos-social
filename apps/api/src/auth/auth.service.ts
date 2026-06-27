import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  Logger,
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
    private readonly logger: Logger = new Logger(AuthService.name),
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
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    return user;
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

  async logout(token: string) {
    try {
      const refreshToken = await this.validateRefreshToken(token);

      await this.prisma.refreshToken.update({
        where: {
          id: refreshToken.id,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } catch {
      // throw new UnauthorizedException('Invalid Credentials');
      this.logger.warn(`Logout requested with an invalid refresh token!`);
    }
  }

  async refresh(token: string) {
    try {
      const refreshToken = await this.validateRefreshToken(token);
      const newRefreshToken = await this.tokenService.generateRefreshToken(
        refreshToken.userId,
      );

      await this.prisma.$transaction([
        this.prisma.refreshToken.update({
          where: {
            id: refreshToken.id,
          },
          data: {
            revokedAt: new Date(),
          },
        }),

        this.prisma.refreshToken.create({
          data: {
            id: newRefreshToken.jti,
            expiresAt: newRefreshToken.expiresAt,
            tokenHash: newRefreshToken.hash,
            userId: refreshToken.userId,
          },
        }),
      ]);
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

  private async validateRefreshToken(token: string) {
    const { sub, jti } = await this.tokenService.verifyRefreshToken(token);

    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { id: jti },
      include: { user: true },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokenHash = this.tokenService.hashRefreshToken(token);

    if (
      refreshToken.userId !== sub ||
      refreshToken.tokenHash !== tokenHash ||
      refreshToken.revokedAt !== null ||
      refreshToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return refreshToken;
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
