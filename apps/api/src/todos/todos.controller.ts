import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type AuthenticatedUser } from '../auth/types/authenticated-user';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodoResponseDto } from './dto/todo-response.dto';
import { TodosService } from './todos.service';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Todos')
@ApiBearerAuth()
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

  @Patch('/:id')
  async updateTodo(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) todoId: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<TodoResponseDto> {
    return this.todosService.updateTodo(user.id, todoId, updateTodoDto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTodo(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) todoId: string,
  ): Promise<void> {
    return this.todosService.deleteTodo(user.id, todoId);
  }

  @Get('/users/:username')
  async getUserTodos(
    @CurrentUser() user: AuthenticatedUser,
    @Param('username') profileUsername: string,
  ): Promise<TodoResponseDto[]> {
    return this.todosService.getUserTodos(
      user.username,
      user.id,
      profileUsername,
    );
  }
}
