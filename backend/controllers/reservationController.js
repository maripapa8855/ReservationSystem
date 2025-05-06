// backend/controllers/reservationController.js
const pool = require('../db');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { logAudit } = require('../utils/auditLogger');

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const getReservations = async (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) return res.status(401).send('未ログインです');

  try {
    const result = await pool.query(
      `SELECT
         r.id,
         r.date,
         r.time,
         r.status,
         r.visit_type,
         f.name AS facility_name,
         d.name AS department_name,
         doc.name AS doctor_name
       FROM reservations r
       JOIN facilities f ON r.facility_id = f.id
       JOIN departments d ON r.department_id = d.id
       JOIN doctors doc ON r.doctor_id = doc.id
       WHERE r.user_id = $1
       ORDER BY r.date, r.time`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('予約一覧取得エラー:', err.message);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
};

const createReservation = async (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) return res.status(401).send('未ログインです');

  const { doctor_id, department_id, facility_id, date, time, status, visit_type = '新患' } = req.body;

  if (!facility_id || !department_id || !doctor_id || !date || !time) {
    return res.status(400).json({ message: '必須項目が不足しています' });
  }

  try {
    const closedRes = await pool.query(
      `SELECT * FROM closed_days WHERE facility_id = $1 AND department_id = $2 AND closed_date = $3`,
      [facility_id, department_id, date]
    );
    if (closedRes.rowCount > 0) {
      return res.status(400).json({ message: 'この日は休診日のため予約できません。' });
    }

    const shiftRes = await pool.query(
      `SELECT max_patients_per_slot FROM shifts WHERE doctor_id = $1 AND department_id = $2 AND $3::time BETWEEN start_time AND end_time`,
      [doctor_id, department_id, time]
    );
    if (shiftRes.rowCount === 0) {
      return res.status(400).json({ message: 'この時間帯には診療枠が存在しません。' });
    }

    const maxCount = shiftRes.rows[0].max_patients_per_slot;

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM reservations WHERE doctor_id = $1 AND department_id = $2 AND facility_id = $3 AND date = $4 AND time = $5`,
      [doctor_id, department_id, facility_id, date, time]
    );
    if (parseInt(countRes.rows[0].count, 10) >= maxCount) {
      return res.status(400).json({ message: 'この時間は定員に達しています' });
    }

    const result = await pool.query(
      `INSERT INTO reservations (user_id, doctor_id, department_id, facility_id, date, time, status, visit_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, doctor_id, department_id, facility_id, date, time, status, visit_type]
    );

    const newReservation = result.rows[0];

    await logAudit(userId, 'CREATE', 'reservation', newReservation.id, {
      doctor_id, department_id, facility_id, date, time, status, visit_type
    });

    const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (user?.email) {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: '予約完了のお知らせ',
        text:
          `${user.name}様\n\n以下の内容で予約を受け付けました。\n\n` +
          `区分：${visit_type}\n日時：${date} ${time}\n施設ID：${facility_id}\n診療科ID：${department_id}\n医師ID：${doctor_id}\nステータス：${status}\n\n` +
          `ご来院をお待ちしております。`,
      };
      await transporter.sendMail(mailOptions);
      console.log('📧 メール送信完了:', user.email);
    }

    res.status(201).json(newReservation);
  } catch (err) {
    console.error('予約登録エラー:', err.message);
    res.status(500).json({ message: '予約登録に失敗しました' });
  }
};

const deleteReservation = async (req, res) => {
  const userId = req.cookies.user_id;
  const { id } = req.params;
  if (!userId) return res.status(401).send('未ログインです');

  try {
    const result = await pool.query('DELETE FROM reservations WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);

    if (result.rowCount === 0) {
      return res.status(404).send('該当する予約が見つかりません');
    }

    const deleted = result.rows[0];
    await logAudit(userId, 'DELETE', 'reservation', deleted.id, {
      canceled_date: deleted.date,
      canceled_time: deleted.time,
      facility_id: deleted.facility_id,
      department_id: deleted.department_id,
      doctor_id: deleted.doctor_id,
    });

    res.json({ message: '予約を削除しました', deleted });
  } catch (err) {
    console.error('予約削除エラー:', err.message);
    res.status(500).json({ message: '削除に失敗しました' });
  }
};

// 他エンドポイント（getMyReservations, getShiftsByDoctor, getReservationCounts など）は必要に応じて保持・整理

module.exports = {
  getReservations,
  createReservation,
  deleteReservation,
  // 以下の関数も必要に応じてエクスポート
  getShiftsByDoctor: async (req, res) => { /* 略 */ },
  getReservationCountForSlot: async (req, res) => { /* 略 */ },
  getAllReservationsForAdmin: async (req, res) => { /* 略 */ },
  getReservationById: async (req, res) => { /* 略 */ },
  getReservationCounts: async (req, res) => { /* 略 */ },
};
