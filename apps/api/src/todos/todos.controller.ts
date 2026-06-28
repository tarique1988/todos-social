import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type AuthenticatedUser } from '../auth/types/authenticated-user';
import { CreateTodoDto } from './dto/create-todo-dto';
import { TodoResponseDto } from './dto/todo-response-dto';
import { TodosService } from './todos.service';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post('/')
  async createTodo(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createTodoDto: CreateTodoDto,
  ): Promise<TodoResponseDto> {
    return this.todosService.createTodo(user.id, createTodoDto);
  }

  @Get('/')
  async getTodos(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TodoResponseDto[]> {
    return this.todosService.getTodos(user.id);
  }
}
