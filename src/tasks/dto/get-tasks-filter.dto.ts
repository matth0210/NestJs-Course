import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TaskStatus } from '../task-status.enuml';

export class GetTasksFilterDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'search must not be empty when provided' })
  search?: string;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message: `status must be one of: ${Object.values(TaskStatus).join(', ')}`,
  })
  status?: TaskStatus;
}
