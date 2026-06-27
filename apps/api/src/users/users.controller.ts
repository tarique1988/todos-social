import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type AuthenticatedUser } from '../auth/types/authenticated-user';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  me(@CurrentUser() user: AuthenticatedUser) {
    console.log(user);

    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/me')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateUserDto: UpdateProfileDto,
  ) {
    return { user, updateUserDto };
  }

  @Get('/:username')
  get(@Param('username') username: string) {
    return { username };
  }
}
