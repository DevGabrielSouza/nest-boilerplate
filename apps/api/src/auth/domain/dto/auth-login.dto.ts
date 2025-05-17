import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'teste@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
