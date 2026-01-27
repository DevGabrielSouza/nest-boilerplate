import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'OldPassword123' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ example: 'NewPassword123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  confirmPassword: string;
}
