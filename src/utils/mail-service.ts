import { injectable } from 'inversify';
import nodemailer from 'nodemailer';
import { db_service_email_str, db_service_pass_str } from '../connect-db';

@injectable()
export class MailService {
  async sendEmail(email: string, code: string) {
    const clientPort = '7000';
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: db_service_email_str,
        pass: db_service_pass_str,
      },
    });

    const clientSrc = `http://localhost:${clientPort}/client-confirm?code=${code}`;
    const mailOptions = {
      from: '"lismgmk 👻" <lismgmk2@gmail.com>',
      to: email,
      subject: 'Hello',
      html: `<h1>this is a test mail.<a href=${clientSrc}>Confirm here</a></h1>`,
    };
    let responseEmail: { error: boolean; data: string };
    try {
      const isSend = await transporter.sendMail(mailOptions);
      responseEmail = { data: isSend.response, error: false };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      responseEmail = { data: error.response, error: true };
    }
    return responseEmail;
  }
}
