import {
  ConflictException,
  Injectable,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { hash, verify } from 'argon2';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim();
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

    const payload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
    };
  }

  private async findUserByEmailOrUsername(email: string, username: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }
  private async findUserByLogin(login: string) {
    const normalized = login.trim();

    return normalized.includes('@')
      ? this.prisma.user.findUnique({
          where: { email: normalized.toLowerCase() },
        })
      : this.prisma.user.findUnique({
          where: { username: normalized },
        });
  }
}
