const pool = require('../db');

// 全休診日一覧取得（オプション：facility_id, department_id 絞り込み）
exports.getClosedDays = async (req, res) => {
  const { facility_id, department_id } = req.query;
  const params = [];
  const conditions = [];

  let query = `
    SELECT cd.*, f.name AS facility_name, d.name AS department_name
    FROM closed_days cd
    LEFT JOIN facilities f ON cd.facility_id = f.id
    LEFT JOIN departments d ON cd.department_id = d.id
  `;

  if (facility_id) {
    params.push(facility_id);
    conditions.push(`cd.facility_id = $${params.length}`);
  }
  if (department_id) {
    params.push(department_id);
    conditions.push(`cd.department_id = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY cd.closed_date DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('休診日取得エラー:', err);
    res.status(500).json({ message: '休診日の取得に失敗しました' });
  }
};

// 休診日登録
exports.createClosedDay = async (req, res) => {
  const { facility_id, department_id, closed_date, reason } = req.body;
  if (!facility_id || !department_id || !closed_date) {
    return res.status(400).json({ message: '必須項目が不足しています' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO closed_days (facility_id, department_id, closed_date, reason)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [facility_id, department_id, closed_date, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('休診日登録エラー:', err);
    res.status(500).json({ message: '休診日の登録に失敗しました' });
  }
};

// 休診日削除
exports.deleteClosedDay = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM closed_days WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: '指定された休診日が見つかりません' });
    }
    res.json({ message: '削除成功', deleted: result.rows[0] });
  } catch (err) {
    console.error('休診日削除エラー:', err);
    res.status(500).json({ message: '削除に失敗しました' });
  }
};
