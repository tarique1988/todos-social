import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FriendsModule } from './friends/friends.module';
import { TodosModule } from './todos/todos.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { CommonModule } from './common/common.module';
import { EnvModule } from './env/env.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    AuthModule,
    EnvModule,
    UsersModule,
    FriendsModule,
    TodosModule,
    NotificationsModule,
    SearchModule,
    HealthModule,
    CommonModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
