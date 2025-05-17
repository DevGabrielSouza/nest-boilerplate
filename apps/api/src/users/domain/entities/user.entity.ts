import { User, UserRole, Session, TwoFactorConfirmation } from '@prisma/client';

export class UserEntity implements User {
  id: string;
  taxId: string;
  name: string;
  lastName: string;
  email: string;
  emailVerifiedAt: Date;
  password: string;
  image: string;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  twoFactorConfirmation?: TwoFactorConfirmation;
  sessions?: Session[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}
