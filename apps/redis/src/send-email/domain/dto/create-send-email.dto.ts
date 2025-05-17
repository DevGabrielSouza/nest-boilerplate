import { IsEmail, IsString } from 'class-validator';

export class CreateSendEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  subject: string;

  @IsString()
  text: string;
}
