import nodemailer from "nodemailer";

export async function getMailClient() {
  const acount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: acount.user,
      pass: acount.pass,
    },
  });
  return transporter;
}
