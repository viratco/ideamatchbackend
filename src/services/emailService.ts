import nodemailer from 'nodemailer';

// For development: use Ethereal (https://ethereal.email/) for testing emails
export async function sendVerificationEmail(to: string, token: string) {
  // Create a test account if needed
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const verificationUrl = `http://localhost:3001/api/user/verify?token=${token}`;

  const info = await transporter.sendMail({
    from: 'noreply@example.com',
    to,
    subject: 'Verify your email',
    text: `Click the following link to verify your email: ${verificationUrl}`,
    html: `<a href="${verificationUrl}">Verify your email</a>`
  });

  // Preview URL for dev
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
