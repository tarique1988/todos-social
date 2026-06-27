import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async getUserById(userId: string) {
    let user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`user with id ${userId} does not exist!`);
    }

    return user;
  }

  async getUserByUsername(username: string) {
    let user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new NotFoundException(
        `user with username ${username} does not exist!`,
      );
    }

    return user;
  }

  async updateUser(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
    });

    if (!user) {
      if (!user) {
        throw new NotFoundException(
          `user with id ${userId} does not exist - SHOULD NEVER HAPPEN!`,
        );
      }
    }

    return user;
  }
}
