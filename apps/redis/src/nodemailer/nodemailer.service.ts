import { Inject, Injectable } from '@nestjs/common';
import nodemailer, { SentMessageInfo } from 'nodemailer';
import { NodemailerProvider } from './nodemailer.provider';

type sendEmailHandler = {
  name: string;
  email: string;
  subject: string;
  text: string;
  html?: string;
};

@Injectable()
export class NodemailerService {
  constructor(
    @Inject(NodemailerProvider.provide)
    private readonly nodemailerProvider: nodemailer.Transporter<SentMessageInfo>
  ) {}

  async sendEmail(sendEmailHandler: sendEmailHandler) {
    const messageInfo = {
      from: `${sendEmailHandler.name} <${sendEmailHandler.email}>`,
      to: sendEmailHandler.email,
      subject: sendEmailHandler.subject,
      text: sendEmailHandler.text,
      html: sendEmailHandler.html ?? sendEmailHandler.text,
    };
    return this.nodemailerProvider.sendMail(messageInfo);
  }
}
