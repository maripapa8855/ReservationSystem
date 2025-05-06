const pool = require('../db');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../utils/auditLogger');
const SECRET_KEY = process.env.SESSION_SECRET || 'your-secret-key';

// 診療科一覧取得（facility_idがあれば絞り込み、なければgroup_id制限）
exports.getAllDepartments = async (req, res) => {
  const { facility_id } = req.query;
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "未認証です" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const groupId = decoded.group_id;
    let result;

    if (facility_id) {
      result = await pool.query(
        `
        SELECT DISTINCT d.*
        FROM departments d
        JOIN doctors doc ON d.id = doc.department_id
        WHERE doc.facility_id = $1
        ORDER BY d.id
        `,
        [facility_id]
      );
    } else if (decoded.role === 'super_admin') {
      result = await pool.query('SELECT * FROM departments ORDER BY id');
    } else {
      result = await pool.query(
        `
        SELECT DISTINCT d.*
        FROM departments d
        JOIN doctors doc ON d.id = doc.department_id
        JOIN facilities f ON doc.facility_id = f.id
        WHERE f.group_id = $1
        ORDER BY d.id
        `,
        [groupId]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error('診療科一覧取得エラー:', err);
    res.status(500).send('サーバーエラー');
  }
};

// 診療科登録（監査ログ付き）
exports.createDepartment = async (req, res) => {
  const { name } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO departments (name) VALUES ($1) RETURNING *',
      [name]
    );

    const token = req.cookies.token;
    const decoded = jwt.verify(token, SECRET_KEY);
    await logAudit(decoded.id, 'CREATE', 'department', result.rows[0].id, { name });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('診療科登録エラー:', err);
    res.status(500).send('登録失敗');
  }
};

// 診療科削除（監査ログ付き）
exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM departments WHERE id = $1 RETURNING *',
      [id]
    );

    const token = req.cookies.token;
    const decoded = jwt.verify(token, SECRET_KEY);
    await logAudit(decoded.id, 'DELETE', 'department', Number(id), {
      deleted_name: result.rows[0]?.name || null
    });

    res.status(204).end();
  } catch (err) {
    console.error('診療科削除エラー:', err);
    res.status(500).send('削除失敗');
  }
};
