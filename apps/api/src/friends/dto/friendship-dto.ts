export class FriendshipDto {
  id!: string;
  status!: string;
  sender!: {
    username: string;
  };
  receiver!: {
    username: string;
  };
  createdAt!: Date;
}
