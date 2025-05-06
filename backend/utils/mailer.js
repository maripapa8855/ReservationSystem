// backend/utils/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // 他のSMTPサービスを使う場合はここを変更
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// メール送信関数
exports.sendMail = async ({ to, subject, text }) => {
  const mailOptions = {
    from: `"予約システム" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ メール送信成功:', info.response);
    return info;
  } catch (err) {
    console.error('❌ メール送信エラー:', err);
    throw err;
  }
};
