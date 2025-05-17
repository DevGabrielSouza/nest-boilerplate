import { IsEmail, IsNotEmpty, MinLength, IsJWT } from 'class-validator';

export class AuthResetDto {
  @IsEmail()
  @MinLength(6)
  password: string;

  @IsJWT()
  @IsNotEmpty()
  token: string;
}
