import { Logger, Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';

@Module({
  providers: [FriendsService, Logger],
  controllers: [FriendsController],
})
export class FriendsModule {}
