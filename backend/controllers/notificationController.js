const pool = require('../db');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SESSION_SECRET || 'your-secret-key';

// 通知設定一覧取得（group_id による制限）
exports.getNotificationSettings = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "未認証です" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const groupId = decoded.group_id;

    let result;
    if (decoded.role === 'super_admin') {
      result = await pool.query(`
        SELECT ns.id, u.name AS user_name, ns.notify_email, ns.notify_line, ns.notify_sms
        FROM notification_settings ns
        JOIN users u ON ns.user_id = u.id
        ORDER BY ns.id
      `);
    } else {
      result = await pool.query(`
        SELECT ns.id, u.name AS user_name, ns.notify_email, ns.notify_line, ns.notify_sms
        FROM notification_settings ns
        JOIN users u ON ns.user_id = u.id
        WHERE u.group_id = $1
        ORDER BY ns.id
      `, [groupId]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error('通知設定取得エラー:', err.message);
    res.status(500).json({ message: '通知設定の取得に失敗しました' });
  }
};

// 通知設定更新（ID指定）
exports.updateNotificationSettings = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) {
    return res.status(400).json({ message: '更新内容がありません' });
  }

  try {
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ') + `, updated_at = NOW()`;
    const query = `UPDATE notification_settings SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '指定された設定が見つかりませんでした' });
    }

    res.json({ message: '通知設定を更新しました', updated: result.rows[0] });
  } catch (err) {
    console.error('通知設定更新エラー:', err.message);
    res.status(500).json({ message: '通知設定の更新に失敗しました' });
  }
};
