import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  tenantId: string;

  @Expose()
  image: string | null;

  @Expose()
  emailVerifiedAt: Date | null;

  @Expose()
  isTwoFactorEnabled: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  password?: string;

  @Exclude()
  taxId?: string;
}
