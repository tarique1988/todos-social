import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { FriendshipDto } from './dto/friendship-dto';
import { Prisma, FriendshipStatus } from '@prisma/client';
import { UserProfileDto } from '../users/dto/user-profile.dto';
import { FriendDto } from './dto/friend-dto';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async sendRequest(
    sender: AuthenticatedUser,
    receiverUsername: string,
  ): Promise<FriendshipDto> {
    if (sender.username == receiverUsername) {
      throw new BadRequestException(
        'You cannot send yourself a friend request',
      );
    }
    const receiver = await this.prisma.user.findUnique({
      where: { username: receiverUsername },
      select: {
        id: true,
        username: true,
      },
    });

    if (!receiver) {
      throw new NotFoundException(`User: ${receiverUsername} not found`);
    }

    const existing = await this.findFriendshipBetween(sender.id, receiver.id);
    if (existing) {
      throw new ConflictException(
        `A friendship or friend request already exists`,
      );
    }

    try {
      const friendship = await this.prisma.friendship.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      });

      return {
        id: friendship.id,
        status: friendship.status,
        createdAt: friendship.createdAt,
        sender: { username: sender.username },
        receiver: { username: receiver.username },
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A friendship or friend request already exists',
        );
      }

      throw error;
    }
  }

  async getRequestsReceived(user: AuthenticatedUser): Promise<FriendshipDto[]> {
    return this.prisma.friendship.findMany({
      where: { receiverId: user.id, status: FriendshipStatus.PENDING },
      select: {
        id: true,
        status: true,
        createdAt: true,
        sender: { select: { username: true } },
        receiver: { select: { username: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getRequestsSent(user: AuthenticatedUser): Promise<FriendshipDto[]> {
    return this.prisma.friendship.findMany({
      where: { senderId: user.id, status: FriendshipStatus.PENDING },
      select: {
        id: true,
        status: true,
        createdAt: true,
        sender: { select: { username: true } },
        receiver: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async findFriendshipBetween(userA: string, userB: string) {
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA },
        ],
      },
    });

    return existing;
  }

  async acceptRequest(
    userId: string,
    friendshipId: string,
  ): Promise<FriendshipDto> {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (!friendship || friendship.status !== FriendshipStatus.PENDING) {
      throw new NotFoundException(`Friend request not found!`);
    }

    if (friendship.receiverId !== userId) {
      throw new ForbiddenException(
        `You cannot accept friend requests unless you're the receiver`,
      );
    }

    return this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.ACCEPTED, acceptedAt: new Date() },
      select: {
        id: true,
        status: true,
        createdAt: true,
        sender: { select: { username: true } },
        receiver: { select: { username: true } },
      },
    });
  }

  async rejectRequest(userId: string, friendshipId: string): Promise<void> {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (!friendship || friendship.status !== FriendshipStatus.PENDING) {
      throw new NotFoundException(`Friend request not found!`);
    }

    if (friendship.receiverId !== userId) {
      throw new ForbiddenException(
        `You cannot accept friend requests unless you're the receiver`,
      );
    }

    await this.prisma.friendship.delete({
      where: { id: friendshipId },
    });
  }

  async getFriends(user: AuthenticatedUser): Promise<FriendDto[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
        status: FriendshipStatus.ACCEPTED,
      },
      select: {
        sender: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return friendships
      .map((f) => {
        return f.receiver.id == user.id ? f.sender : f.receiver;
      })
      .map((f) => ({
        id: f.id,
        username: f.username,
        displayName: f.displayName ?? '',
        avatarUrl: f.avatarUrl ?? '',
      }));
  }
}
