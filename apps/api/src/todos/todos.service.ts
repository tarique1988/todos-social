import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodoResponseDto } from './dto/todo-response.dto';
import { Prisma, Todo, TodoVisibility } from '@prisma/client';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { FriendsService } from '../friends/friends.service';
import { RelationshipStatus } from '../friends/enums/relationship-status';

@Injectable()
export class TodosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly friendsService: FriendsService,
  ) {}

  async createTodo(
    ownerId: string,
    todo: CreateTodoDto,
  ): Promise<TodoResponseDto> {
    const data: Prisma.TodoCreateInput = {
      title: todo.title,
      owner: {
        connect: {
          id: ownerId,
        },
      },
    };
    if (todo.description !== undefined) {
      data.description = todo.description;
    }
    if (todo.visibility !== undefined) {
      data.visibility = todo.visibility;
    }
    const newTodo = await this.prisma.todo.create({
      data,
    });

    return this.toResponseDto(newTodo);
  }

  async getTodos(ownerId: string): Promise<TodoResponseDto[]> {
    return (
      await this.prisma.todo.findMany({
        where: { ownerId },
        orderBy: { updatedAt: 'desc' },
      })
    ).map((todo) => this.toResponseDto(todo));
  }

  async getUserTodos(
    viewerUsername: string,
    viewerId: string,
    todoOwnerUsername: string,
  ): Promise<TodoResponseDto[]> {
    const relationship = await this.friendsService.getFriendshipStatus(
      viewerUsername,
      viewerId,
      todoOwnerUsername,
    );

    let visibility: Prisma.TodoWhereInput['visibility'];

    switch (relationship.status) {
      case RelationshipStatus.FRIENDS: {
        visibility = { in: [TodoVisibility.PUBLIC, TodoVisibility.FRIENDS] };
        break;
      }
      case RelationshipStatus.SELF: {
        break;
      }
      default: {
        visibility = TodoVisibility.PUBLIC;
      }
    }
    return (
      await this.prisma.todo.findMany({
        where: {
          ...(visibility !== undefined && { visibility }),
          owner: { username: todoOwnerUsername },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })
    ).map((todo) => this.toResponseDto(todo));
  }

  async updateTodo(
    ownerId: string,
    todoId: string,
    todo: UpdateTodoDto,
  ): Promise<TodoResponseDto> {
    const existingTodo = await this.findOwnedTodoOrThrow(ownerId, todoId);
    const data: Prisma.TodoUpdateInput = {};
    if (todo.title !== undefined) {
      data.title = todo.title;
    }
    if (todo.description !== undefined) {
      data.description = todo.description;
    }
    if (todo.visibility !== undefined) {
      data.visibility = todo.visibility;
    }
    if (todo.completed !== undefined) {
      data.completed = todo.completed;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(`At least one field must be provided.`);
    }

    const updatedTodo = await this.prisma.todo.update({
      where: { id: existingTodo.id },
      data,
    });

    return this.toResponseDto(updatedTodo);
  }

  async deleteTodo(ownerId: string, todoId: string): Promise<void> {
    const existingTodo = await this.findOwnedTodoOrThrow(ownerId, todoId);
    await this.prisma.todo.delete({ where: { id: existingTodo.id } });
  }

  private async findOwnedTodoOrThrow(
    ownerId: string,
    todoId: string,
  ): Promise<Todo> {
    const todo = await this.prisma.todo.findFirst({
      where: { id: todoId, ownerId },
    });

    if (!todo) {
      throw new NotFoundException(`Todo: ${todoId} was not found`);
    }

    return todo;
  }

  private toResponseDto(todo: Todo): TodoResponseDto {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description ?? '',
      completed: todo.completed,
      visibility: todo.visibility,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };
  }
}
