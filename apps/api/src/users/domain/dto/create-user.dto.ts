import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'Test' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Test' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Test123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Test123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  confirm_password: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.TENANT })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: '123456789' })
  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsString()
  @IsOptional()
  image?: string;

  @IsDateString()
  @IsOptional()
  emailVerifiedAt?: Date;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isTwoFactorEnabled?: boolean;
}
