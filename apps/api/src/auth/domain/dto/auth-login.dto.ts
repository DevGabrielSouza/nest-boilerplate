import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({ example: 'teste@example.com' })
  @IsEmail({}, { message: 'Email inválido' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'Email deve ter um formato válido',
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
