import { User, Session, TwoFactorConfirmation } from '@prisma/client';

export class UserEntity implements User {
  id: string;
  taxId: string | null;
  name: string;
  lastName: string;
  email: string;
  emailVerifiedAt: Date | null;
  password: string;
  image: string | null;
  isTwoFactorEnabled: boolean;
  twoFactorConfirmation?: TwoFactorConfirmation;
  sessions?: Session[];
  createdAt: Date;
  updatedAt: Date;
}
