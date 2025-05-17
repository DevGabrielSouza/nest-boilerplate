import { Inject, Injectable } from '@nestjs/common';
import nodemailer, { setMessageInfo } from 'nodemailer';
import { NodemailerProvider } from './nodemailer.provider';

type sendEmailHandler = {
  name: string;
  email: string;
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class NodemailerService {
  constructor(
    @Inject(NodemailerProvider.provide)
    private readonly nodemailerProvider: nodemailer.Transporter<sendEmailHandler>
  ) {}

  async sendEmail(sendEmailHandler: sendEmailHandler) {
    const messageInfo: setMessageInfo = {
      from: `${sendEmailHandler.name} <${sendEmailHandler.email}>`,
      to: sendEmailHandler.email,
      subject: sendEmailHandler.subject,
      text: sendEmailHandler.text,
      html: sendEmailHandler.html,
    };
    return this.nodemailerProvider.sendMail(messageInfo);
  }
}
