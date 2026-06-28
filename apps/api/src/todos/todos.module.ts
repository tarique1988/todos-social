import { Logger, Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { FriendsService } from '../friends/friends.service';

@Module({
  imports: [],
  providers: [TodosService, FriendsService, Logger],
  controllers: [TodosController],
})
export class TodosModule {}
