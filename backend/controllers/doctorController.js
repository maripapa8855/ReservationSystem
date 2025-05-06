const pool = require('../db');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../utils/auditLogger');
const SECRET_KEY = process.env.SESSION_SECRET || 'your-secret-key';

// 医師一覧取得（group_id フィルター + クエリ対応）
exports.getDoctors = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "未認証です" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const groupId = decoded.group_id;
    const { department_id, facility_id } = req.query;

    // クエリ指定があればフィルター取得（診療予約画面用）
    if (department_id && facility_id) {
      const result = await pool.query(
        `SELECT id, name FROM doctors WHERE department_id = $1 AND facility_id = $2`,
        [department_id, facility_id]
      );
      return res.json(result.rows);
    }

    // 一覧取得（管理画面用）
    let result;
    if (decoded.role === 'super_admin') {
      result = await pool.query(`
        SELECT d.id, d.name, dp.name AS department_name, f.name AS facility_name, d.available_days
        FROM doctors d
        JOIN departments dp ON d.department_id = dp.id
        JOIN facilities f ON d.facility_id = f.id
        ORDER BY d.id
      `);
    } else {
      result = await pool.query(`
        SELECT d.id, d.name, dp.name AS department_name, f.name AS facility_name, d.available_days
        FROM doctors d
        JOIN departments dp ON d.department_id = dp.id
        JOIN facilities f ON d.facility_id = f.id
        WHERE f.group_id = $1
        ORDER BY d.id
      `, [groupId]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error('医師一覧取得エラー:', err);
    res.status(500).json({ message: '取得失敗' });
  }
};

// 医師フィルター検索（facility_id + department_id）
exports.getDoctorsByFilter = async (req, res) => {
  const { department_id, facility_id } = req.query;

  if (!department_id || !facility_id) {
    return res.status(400).json({ message: '診療科と施設を指定してください' });
  }

  try {
    const result = await pool.query(`
      SELECT doctors.*, departments.name AS department_name, facilities.name AS facility_name
      FROM doctors
      JOIN departments ON doctors.department_id = departments.id
      JOIN facilities ON doctors.facility_id = facilities.id
      WHERE doctors.department_id = $1 AND doctors.facility_id = $2
      ORDER BY doctors.id
    `, [department_id, facility_id]);

    res.json(result.rows);
  } catch (err) {
    console.error('医師検索エラー:', err);
    res.status(500).json({ message: '医師検索に失敗しました' });
  }
};

// 医師登録（available_days 対応 + 監査ログ）
exports.createDoctor = async (req, res) => {
  const { name, department_id, facility_id, available_days = [] } = req.body;

  if (!name || !department_id || !facility_id) {
    return res.status(400).json({ message: "全ての項目を入力してください。" });
  }

  try {
    const result = await pool.query(`
      INSERT INTO doctors (name, department_id, facility_id, available_days)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [name, department_id, facility_id, JSON.stringify(available_days)]
    );
    const newDoctor = result.rows[0];

    const token = req.cookies.token;
    const decoded = jwt.verify(token, SECRET_KEY);

    await logAudit(decoded.id, 'CREATE', 'doctor', newDoctor.id, {
      name, department_id, facility_id, available_days
    });

    res.status(201).json(newDoctor);
  } catch (err) {
    console.error('医師登録エラー:', err);
    res.status(500).json({ message: '医師の登録に失敗しました' });
  }
};
