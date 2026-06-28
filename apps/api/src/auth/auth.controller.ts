import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { type Response, type Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type AuthenticatedUser } from './types/authenticated-user';
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS } from './auth.constants';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { MeResponseDto } from './dto/me-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  @Post('/login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { refreshToken, accessToken } = await this.authService.login(dto);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken.token, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: refreshToken.maxAge,
    });

    return { accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  me(@CurrentUser() user: AuthenticatedUser): MeResponseDto {
    return user;
  }

  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const token: string = req.cookies[REFRESH_COOKIE_NAME];
    const { refreshToken, accessToken } = await this.authService.refresh(token);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken.token, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: refreshToken.maxAge,
    });

    return {
      accessToken,
    };
  }

  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = req.cookies[REFRESH_COOKIE_NAME];
    await this.authService.logout(token);
    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
  }
}
