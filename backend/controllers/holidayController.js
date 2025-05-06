const pool = require('../db');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SESSION_SECRET || 'your-secret-key';

// 休診日一覧取得（グループ単位で制限）
exports.getHolidays = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "未認証です" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const groupId = decoded.group_id;

    let result;
    if (decoded.role === 'super_admin') {
      result = await pool.query(`
        SELECT h.id, f.name AS facility_name, h.date, h.reason
        FROM holidays h
        JOIN facilities f ON h.facility_id = f.id
        ORDER BY h.date DESC
      `);
    } else {
      result = await pool.query(`
        SELECT h.id, f.name AS facility_name, h.date, h.reason
        FROM holidays h
        JOIN facilities f ON h.facility_id = f.id
        WHERE f.group_id = $1
        ORDER BY h.date DESC
      `, [groupId]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error('休診日取得エラー:', err);
    res.status(500).json({ message: '取得失敗' });
  }
};

// 休診日登録（修正版：group_idも登録）
exports.createHoliday = async (req, res) => {
  const { group_id, facility_id, date, reason } = req.body;

  if (!group_id || !facility_id || !date) {
    return res.status(400).json({ message: 'グループ、施設、日付は必須です。' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO holidays (group_id, facility_id, date, reason) VALUES ($1, $2, $3, $4) RETURNING *',
      [group_id, facility_id, date, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('休診日登録エラー:', err);
    res.status(500).json({ message: '登録失敗' });
  }
};

// 休診日削除
exports.deleteHoliday = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM holidays WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: '休診日が見つかりません。' });
    }

    res.json({ message: '休診日を削除しました', deleted: result.rows[0] });
  } catch (err) {
    console.error('休診日削除エラー:', err);
    res.status(500).json({ message: '削除失敗' });
  }
};
