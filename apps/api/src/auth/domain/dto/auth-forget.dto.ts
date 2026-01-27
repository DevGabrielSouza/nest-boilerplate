import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthForgetDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email inválido' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'Email deve ter um formato válido',
  })
  @IsNotEmpty()
  email: string;
}
