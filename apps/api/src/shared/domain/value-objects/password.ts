import * as bcrypt from 'bcrypt';
import { ConflictError } from 'apps/api/src/common/errors/types/ConflictError';
import { AppConfigService } from '@env-config/config.service';

type PasswordProps = {
  value: string;
  confirmValue?: string;
};

export class Password {
  readonly value: string;
  private static configService: AppConfigService;

  constructor({ value, confirmValue }: PasswordProps) {
    this.ensureMinLength(value);
    if (confirmValue) {
      this.ensureMatch(value, confirmValue);
    }
    this.value = value;
  }

  static setConfigService(configService: AppConfigService): void {
    Password.configService = configService;
  }

  async toHashed(): Promise<string> {
    const saltRounds = Password.configService?.bcryptSaltRounds ?? 12;
    return bcrypt.hash(this.value, saltRounds);
  }

  async matches(hashedValue: string): Promise<boolean> {
    return bcrypt.compare(this.value, hashedValue);
  }

  private ensureMinLength(value: string, minLength = 6): void {
    if (value.length < minLength) {
      throw new Error(
        `Password must be at least ${minLength} characters long.`
      );
    }
  }

  private ensureMatch(value: string, confirmValue: string): void {
    if (value !== confirmValue) {
      throw new ConflictError('Passwords do not match.');
    }
  }

  static secureFormat(value: string): string {
    return value.replace(/./g, '*');
  }
}
