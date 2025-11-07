import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNodeDto {
  @ApiProperty({
    description: 'Label for the tree node',
    example: 'dog',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty({ message: 'Label is required' })
  @MinLength(1, { message: 'Label cannot be empty' })
  label: string;

  @ApiPropertyOptional({
    description:
      'ID of the parent node. Omit or set to null to create a root node',
    example: 1,
    nullable: true,
  })
  @IsInt()
  @IsOptional()
  parentId?: number;
}
