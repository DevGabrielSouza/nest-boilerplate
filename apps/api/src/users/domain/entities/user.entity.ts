import { User, Session, TwoFactorConfirmation } from '@prisma/client';

export class UserEntity implements User {
  id: string;
  taxId: string;
  name: string;
  lastName: string;
  email: string;
  emailVerifiedAt: Date;
  password: string;
  image: string;
  isTwoFactorEnabled: boolean;
  twoFactorConfirmation?: TwoFactorConfirmation;
  sessions?: Session[];
  createdAt: Date;
  updatedAt: Date;
}
