import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthForgetDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
