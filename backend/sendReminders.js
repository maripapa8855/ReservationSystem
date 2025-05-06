// sendReminders.js
const pool = require('./db'); // PostgreSQL接続モジュール（例：pg.pool）
const nodemailer = require('nodemailer');
require('dotenv').config(); // .envから設定を読み込む

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendReminders() {
  console.log("🔔 リマインダー処理開始");

  try {
    const result = await pool.query(
      `SELECT r.id, r.date, r.time, u.name, u.email
       FROM reservations r
       JOIN users u ON r.user_id = u.id
       WHERE r.date = CURRENT_DATE + INTERVAL '1 day'
         AND u.email IS NOT NULL`
    );

    if (result.rows.length === 0) {
      console.log("✅ 明日の予約はありません。");
      return;
    }

    for (const row of result.rows) {
      const message = {
        from: process.env.SMTP_USER,
        to: row.email,
        subject: '【リマインダー】明日のご予約について',
        text: `${row.name} 様\n\n以下のご予約があります。\n\n日時：${row.date} ${row.time}\n\nご確認のうえご来院ください。\n\n（このメールは自動送信されています）`,
      };

      try {
        await transporter.sendMail(message);
        console.log(`📧 ${row.email} に送信完了`);
      } catch (err) {
        console.error(`❌ ${row.email} 宛メール送信失敗:`, err.message);
      }
    }
  } catch (err) {
    console.error("❗ データベースエラー:", err.message);
  }

  console.log("🔚 リマインダー処理終了");
}

sendReminders();
