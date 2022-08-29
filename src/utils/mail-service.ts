import nodemailer from 'nodemailer';

export const mailService = {
  async sendEmail(email: string, code: string) {
    const clientPort = '7000';
    const serviceEmail = 'lismgmk2@gmail.com';
    const servicePass = 'gexdmwmdxditrmou';
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: serviceEmail,
        pass: servicePass,
      },
    });

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
