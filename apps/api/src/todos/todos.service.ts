import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo-dto';
import { TodoResponseDto } from './dto/todo-response-dto';
import { Prisma, Todo } from '@prisma/client';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async createTodo(
    userId: string,
    todo: CreateTodoDto,
  ): Promise<TodoResponseDto> {
    const data: Prisma.TodoCreateInput = {
      title: todo.title,
      owner: {
        connect: {
          id: userId,
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
    return (await this.prisma.todo.findMany({ where: { ownerId } })).map(
      this.toResponseDto,
    );
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
