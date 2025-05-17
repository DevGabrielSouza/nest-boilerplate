import { PartialType } from '@nestjs/mapped-types';
import { CreateSendEmailDto } from './create-send-email.dto';

export class UpdateSendEmailDto extends PartialType(CreateSendEmailDto) {
  id: number;
}
