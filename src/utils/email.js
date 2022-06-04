import path from 'path';
import nodemailer from 'nodemailer';
import config from 'config';
import { convert } from 'html-to-text';
import { renderFile } from 'pug';
import logger from './logger';

const smtp = config.get('smtp');

export default class Email {
  constructor(user, url) {
    this.url = url;
    this.firstName = user.name.split(' ')[0];
    this.email = user.email;
  }

  newTransport() {
    // if(process.env.NODE_ENV === 'production') {}

    return nodemailer.createTransport({
      ...smtp,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });
  }

  async sendEmail(subject, template) {
    // Generate the html template
    const html = renderFile(path.join(__dirname, `../views/${template}.pug`), {
      firstName: this.firstName,
      url: this.url,
      subject,
      email: this.email,
    });

    // Define the email options
    const mailOptions = {
      from: 'contact@codevoweb.com',
      to: this.email,
      subject,
      html,
      text: convert(html),
    };

    // Send the Email
    const info = await this.newTransport().sendMail(mailOptions);
    logger.info(nodemailer.getTestMessageUrl(info));
  }

  async sendVerificationCode() {
    await this.sendEmail('Your email verification token', 'verificationCode');
  }

  async sendPasswordResetToken() {
    await this.sendEmail(
      'Your password reset token, valid for 10min',
      'resetPassword'
    );
  }
}
