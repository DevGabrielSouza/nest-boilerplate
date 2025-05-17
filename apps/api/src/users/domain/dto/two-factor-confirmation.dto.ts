import { IsNumber } from 'class-validator';

export class TwoFactorConfirmationDto {
  @IsNumber()
  userId: string;
}
