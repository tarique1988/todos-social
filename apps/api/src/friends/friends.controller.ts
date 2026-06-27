import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type AuthenticatedUser } from '../auth/types/authenticated-user';
import { FriendsService } from './friends.service';
import { FriendshipDto } from './dto/friendship-dto';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}
  @Post('/requests/:username')
  async sendRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Param('username') username: string,
  ): Promise<FriendshipDto> {
    return this.friendsService.sendRequest(user, username);
  }

  @Get('/requests/incoming')
  async getRequestsReceived(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipDto[]> {
    return this.friendsService.getRequestsReceived(user);
  }

  @Get('/requests/outgoing')
  async getRequestsSent(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipDto[]> {
    return this.friendsService.getRequestsSent(user);
  }

  @Post('/:id/accept')
  async acceptRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) friendshipId: string,
  ): Promise<FriendshipDto> {
    return this.friendsService.acceptRequest(user.id, friendshipId);
  }

  @Post('/:id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) friendshipId: string,
  ): Promise<void> {
    return this.friendsService.rejectRequest(user.id, friendshipId);
  }
}
