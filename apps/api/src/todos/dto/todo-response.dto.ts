import { TodoVisibility } from '@prisma/client';

export class TodoResponseDto {
  id!: string;
  title!: string;
  description!: string;
  completed!: boolean;
  visibility!: TodoVisibility;
  createdAt!: Date;
  updatedAt!: Date;
}
