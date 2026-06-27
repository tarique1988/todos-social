import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type AuthenticatedUser } from '../auth/types/authenticated-user';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UserProfileDto } from './dto/user-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserProfileDto> {
    const userInfo = await this.usersService.getUserById(user.id);

    return {
      avatarUrl: userInfo.avatarUrl ?? '',
      displayName: userInfo.displayName ?? '',
      bio: userInfo.bio ?? '',
      username: userInfo.username,
      id: userInfo.id,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/me')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateUserDto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    const userInfo = await this.usersService.updateUser(user.id, updateUserDto);

    return {
      id: userInfo.id,
      username: userInfo.username,
      avatarUrl: userInfo.avatarUrl ?? '',
      displayName: userInfo.displayName ?? '',
      bio: userInfo.bio ?? '',
    };
  }

  @Get('/:username')
  async get(@Param('username') username: string): Promise<UserProfileDto> {
    const userInfo = await this.usersService.getUserByUsername(username);
    return {
      id: userInfo.id,
      username: userInfo.username,
      avatarUrl: userInfo.avatarUrl ?? '',
      displayName: userInfo.displayName ?? '',
      bio: userInfo.bio ?? '',
    };
  }
}
