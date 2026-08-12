const nodemailer = require('nodemailer');

// Crea un transporter de pruebas con Ethereal.
// En producción reemplazarías esto con SMTP real.
let transporterPromise = null;

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = nodemailer.createTestAccount().then(account => {
      const transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass }
      });
      console.log('Ethereal email account:', account.user);
      return transporter;
    });
  }
  return transporterPromise;
}

async function enviarCorreo(to, subject, text) {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: '"FreshCut" <noreply@freshcut.com>',
      to,
      subject,
      text
    });
    console.log('Email preview:', nodemailer.getTestMessageUrl(info));
  } catch (err) {
    // No queremos que un fallo de email rompa el flujo principal
    console.error('Error enviando email:', err.message);
  }
}

module.exports = { enviarCorreo };

// modified

// modified
