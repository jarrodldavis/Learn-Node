const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const { promisify } = require('util');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
});

transport.sendMail = promisify(transport.sendMail);

exports.send = async(options) => {
  const html = juice(pug.renderFile(`${__dirname}/../views/email/${options.filename}.pug`, options))

  const mailOptions = {
    from: 'Jarrod Davis <no-reply@jarrodldavis.com>',
    to: options.user.email,
    subject: options.subject,
    html,
    text: htmlToText.fromString(html)
  };

  return transport.sendMail(mailOptions);
}
