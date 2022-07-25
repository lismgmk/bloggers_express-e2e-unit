import nodemailer from 'nodemailer';

export const mailService = {
  async sendEmail(email: string, password: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password,
      },
    });

    const clientPort = process.env.CLIENT_PORT || '';
    const clientSrc = `http://localhost:${clientPort}/client-confirm?code=${code}`;
    const mailOptions = {
      from: '"lismgmk 👻" <lismgmk2@gmail.com>', // sender address
      to: email, // list of receivers
      subject: 'Hello', // Subject line
      html: `<h1>this is a test mail.<a href=${clientSrc}>Confirm here</a></h1>`, // plain text body
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
  },
};
