import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: import.meta.env.EMAIL_SERVER_HOST,
  port: Number(import.meta.env.EMAIL_SERVER_PORT),
  secure: Number(import.meta.env.EMAIL_SERVER_PORT) === 465, // true pour le port 465, false pour les autres
  auth: {
    user: import.meta.env.EMAIL_SERVER_USER,
    pass: import.meta.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html, text }: { to: string, subject: string, html?: string, text?: string }) {
  await transporter.sendMail({
    from: import.meta.env.AUTH_FROM,
    to,
    subject,
    text,
    html,
  });
}
