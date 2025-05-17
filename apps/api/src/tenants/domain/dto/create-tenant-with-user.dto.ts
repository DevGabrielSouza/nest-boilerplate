import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateUserDto } from 'apps/api/src/users/domain/dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantWithUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Test' })
  name: string;

  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({ type: CreateUserDto })
  @Type(() => CreateUserDto)
  user: CreateUserDto;
}
