import { TodoVisibility } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator';

export class UpdateTodoDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  description?: string;

  @IsOptional()
  @IsString()
  @IsEnum(TodoVisibility)
  visibility?: TodoVisibility;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
