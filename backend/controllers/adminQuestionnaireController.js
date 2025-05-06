const pool = require('../db');

// 問診一覧取得
exports.getAllQuestionnaires = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.id, q.reservation_id, u.name AS user_name, f.name AS facility_name, d.name AS department_name
      FROM questionnaires q
      JOIN reservations r ON q.reservation_id = r.id
      JOIN users u ON r.user_id = u.id
      JOIN facilities f ON r.facility_id = f.id
      JOIN departments d ON r.department_id = d.id
      ORDER BY q.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('問診一覧取得エラー:', err.message);
    res.status(500).json({ message: '問診一覧取得に失敗しました' });
  }
};

// 問診詳細取得
exports.getQuestionnaireById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT q.*, u.name AS user_name, f.name AS facility_name, d.name AS department_name
      FROM questionnaires q
      JOIN reservations r ON q.reservation_id = r.id
      JOIN users u ON r.user_id = u.id
      JOIN facilities f ON r.facility_id = f.id
      JOIN departments d ON r.department_id = d.id
      WHERE q.id = $1
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: '問診が見つかりません' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('問診詳細取得エラー:', err.message);
    res.status(500).json({ message: '問診詳細取得に失敗しました' });
  }
};
