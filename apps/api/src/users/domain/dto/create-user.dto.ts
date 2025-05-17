import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  confirm_password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsNumber()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsDateString()
  @IsOptional()
  emailVerifiedAt?: Date;

  @IsBoolean()
  @IsOptional()
  isTwoFactorEnabled?: boolean;
}
