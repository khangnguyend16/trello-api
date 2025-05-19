const nodemailer = require("nodemailer");
import { env } from "~/config/environment";

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  try {
    // Tạo transport cho Mailjet
    const transporter = nodemailer.createTransport({
      host: "in-v3.mailjet.com",
      port: 587,
      secure: false,
      auth: {
        user: env.MJ_APIKEY_PUBLIC,
        pass: env.MJ_APIKEY_PRIVATE,
      },
    });

    // Thiết lập mail options
    const mailOptions = {
      from: `Khang <${env.ADMIN_EMAIL_ADDRESS}>`,
      to: recipientEmail,
      subject: customSubject,
      html: htmlContent,
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw new Error("Failed to send email");
  }
};

export const MailjetProvider = {
  sendEmail,
};
