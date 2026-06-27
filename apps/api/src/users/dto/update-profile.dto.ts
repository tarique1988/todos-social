import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../common/decorators/trim-decorator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Trim()
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Trim()
  bio?: string;
}
