import * as bcrypt from 'bcrypt';
import { ConflictError } from 'apps/api/src/common/errors/types/ConflictError';

type PasswordProps = {
  value: string;
  confirmValue?: string;
};

export class Password {
  readonly value: string;

  constructor({ value, confirmValue }: PasswordProps) {
    this.ensureMinLength(value);
    if (confirmValue) {
      this.ensureMatch(value, confirmValue);
    }
    this.value = value;
  }

  /**
   * Gera o hash da senha.
   */
  async toHashed(): Promise<string> {
    return bcrypt.hash(this.value, 10);
  }

  /**
   * Verifica se a senha corresponde ao hash.
   */
  async matches(hashedValue: string): Promise<boolean> {
    return bcrypt.compare(this.value, hashedValue);
  }

  /**
   * Garante que a senha tenha o comprimento mínimo.
   */
  private ensureMinLength(value: string, minLength = 6): void {
    if (value.length < minLength) {
      throw new Error(
        `Password must be at least ${minLength} characters long.`
      );
    }
  }

  /**
   * Garante que a senha e a confirmação sejam iguais.
   */
  private ensureMatch(value: string, confirmValue: string): void {
    if (value !== confirmValue) {
      throw new ConflictError('Passwords do not match.');
    }
  }

  /**
   * Retorna a senha formatada para envio seguro (exemplo fictício).
   */
  static secureFormat(value: string): string {
    return value.replace(/./g, '*');
  }
}
