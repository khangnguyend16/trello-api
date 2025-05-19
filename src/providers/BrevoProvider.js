const brevo = require("@getbrevo/brevo");
import { env } from "~/config/environment";

let apiInstance = new brevo.TransactionalEmailsApi();

let apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = env.BREVO_API_KEY;

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  try {
    // Khởi tạo 1 cái sendSmtpEmail với những thông tin cần thiết
    let sendSmtpEmail = new brevo.SendSmtpEmail();

    // Tài khoản gửi mail (địa chỉ admin email phải là email dùng để tạo tài khoản trên Brevo)
    sendSmtpEmail.sender = { name: env.ADMIN_EMAIL_NAME, email: env.ADMIN_EMAIL_ADDRESS };

    // Những tài khoản nhận email
    // 'to' phải là 1 array để sau này có thể tùy biến gửi 1 email tới nhiều user tùy tính năng dự án
    sendSmtpEmail.to = [{ email: recipientEmail }];

    // Tiêu đề email
    sendSmtpEmail.subject = customSubject;

    // Nội dung email dạng HTML
    sendSmtpEmail.htmlContent = htmlContent;

    // Gọi hành động gửi mail
    // sendTransacEmail sẽ return 1 Promise
    return apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error("Brevo Error:", {
      status: error.status,
      message: error.response?.data?.message,
      details: error.response?.data,
    });
    throw error;
  }
};

export const BrevoProvider = {
  sendEmail,
};
