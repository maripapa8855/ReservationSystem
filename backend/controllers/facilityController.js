// /backend/controllers/facilityController.js

const pool = require('../db');

// 全施設取得
const getAllFacilities = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM facilities ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('施設一覧取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// 管理者がアクセスできる施設のみ取得
const getFacilityByAdmin = async (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) return res.status(401).json({ message: '未ログインです' });

  try {
    const userRes = await pool.query('SELECT role, group_id FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    let result;
    if (user.role === 'superadmin') {
      result = await pool.query('SELECT * FROM facilities ORDER BY id');
    } else if (user.role === 'group_admin') {
      result = await pool.query('SELECT * FROM facilities WHERE group_id = $1 ORDER BY id', [user.group_id]);
    } else if (user.role === 'facility_admin') {
      result = await pool.query(
        `SELECT f.*
         FROM facilities f
         JOIN admins a ON f.id = a.facility_id
         WHERE a.user_id = $1
         ORDER BY f.id`,
        [userId]
      );
    } else {
      return res.status(403).json({ message: 'アクセス権がありません' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('施設取得エラー:', err.message);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// group_id + facility_id で単一施設取得
const getFacilityById = async (req, res) => {
  const { id } = req.params;
  const { group_id } = req.query;

  if (!group_id) {
    return res.status(400).json({ message: 'group_idが指定されていません' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM facilities WHERE id = $1 AND group_id = $2',
      [id, group_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '施設が見つかりません' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('施設取得エラー:', err.message);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

module.exports = {
  getAllFacilities,
  getFacilityByAdmin,
  getFacilityById,
};
