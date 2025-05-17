import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 587,
  auth: {
    user: '63a771d7b7b61d',
    pass: 'ae1b71f714a8cd',
  },
});

export const NodemailerProvider = {
  provide: 'NODEMAILER_PROVIDER',
  useValue: transporter,
};
