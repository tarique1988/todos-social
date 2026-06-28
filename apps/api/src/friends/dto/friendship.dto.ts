import { FriendshipStatus } from '@prisma/client';

export class FriendshipDto {
  id!: string;
  status!: FriendshipStatus;
  sender!: {
    username: string;
  };
  receiver!: {
    username: string;
  };
  createdAt!: Date;
}
