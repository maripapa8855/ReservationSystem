const pool = require('../db');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SESSION_SECRET || 'your-secret-key';

// ✅ ユーザー一覧取得（フィルター対応）
exports.getAllUsers = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: '未認証です' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const myRole = decoded.role;
    const myGroupId = decoded.group_id;

    const { group_id, facility_id, role } = req.query;

    let baseQuery = 'SELECT * FROM users WHERE true';
    const params = [];
    let index = 1;

    // フィルター条件
    if (group_id) {
      baseQuery += ` AND group_id = $${index++}`;
      params.push(group_id);
    }

    if (role) {
      baseQuery += ` AND role = $${index++}`;
      params.push(role);
    }

    // TODO: facility_id での絞り込みは、usersテーブルに facility_id が必要な構成のときのみ

    // 自身のグループ制限（group_admin）
    if (myRole === 'group_admin') {
      baseQuery += ` AND group_id = $${index++}`;
      params.push(myGroupId);
    }

    baseQuery += ' ORDER BY id';

    const result = await pool.query(baseQuery, params);
    res.json(result.rows);
  } catch (err) {
    console.error('ユーザー一覧取得エラー:', err.message);
    res.status(500).json({ message: 'ユーザー情報の取得に失敗しました' });
  }
};
