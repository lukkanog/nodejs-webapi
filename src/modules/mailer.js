const nodemailer = require("nodemailer");
const path = require("path");
const handlebars = require("nodemailer-express-handlebars");
const { host, port, user, pass } = require("../config/mail.json");

const transport = nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass
    }
});

transport.use('compile', handlebars({
    viewEngine: {
      defaultLayout: undefined,
      partialsDir: path.resolve('./src/resources/mail/')
    },
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html',
  }));

module.exports = transport;