import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Test' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'test' })
  slug: string;
}
