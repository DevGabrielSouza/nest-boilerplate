import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectTenantDto {
  @ApiProperty({
    example: 'clxxx...',
    description: 'ID do tenant que o usuário deseja acessar',
  })
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}
