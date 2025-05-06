const pool = require('../db');

// ✅ シフト登録
exports.createShift = async (req, res) => {
  const { doctor_id, department_id, facility_id, group_id, start_time, end_time, max_patients_per_slot } = req.body;

  if (!doctor_id || !department_id || !facility_id || !start_time || !end_time || !max_patients_per_slot) {
    return res.status(400).json({ message: 'すべての項目を入力してください' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO shifts (doctor_id, department_id, facility_id, group_id, start_time, end_time, max_patients_per_slot)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [doctor_id, department_id, facility_id, group_id, start_time, end_time, max_patients_per_slot]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('シフト登録エラー:', err);
    res.status(500).json({ message: '登録に失敗しました' });
  }
};

// ✅ シフト一覧取得（doctor_id指定あり or 全件）
exports.getShifts = async (req, res) => {
  const { doctor_id } = req.query;

  try {
    let result;

    if (doctor_id) {
      result = await pool.query(
        'SELECT * FROM shifts WHERE doctor_id = $1 ORDER BY start_time',
        [doctor_id]
      );
    } else {
      result = await pool.query(
        'SELECT * FROM shifts ORDER BY doctor_id, start_time'
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error('シフト取得エラー:', err);
    res.status(500).json({ message: '取得に失敗しました' });
  }
};

// ✅ シフト存在チェックAPI
exports.checkShiftAvailability = async (req, res) => {
  const { doctor_id, department_id, time } = req.query;

  if (!doctor_id || !department_id || !time) {
    return res.status(400).json({ message: '必要なパラメータが不足しています' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM shifts 
       WHERE doctor_id = $1 AND department_id = $2 AND $3::time BETWEEN start_time AND end_time`,
      [doctor_id, department_id, time]
    );

    res.json({ ok: result.rowCount > 0 });
  } catch (err) {
    console.error('シフトチェックエラー:', err);
    res.status(500).json({ message: 'チェックに失敗しました' });
  }
};

// ✅ 単体取得（GET /shifts/:id）
exports.getShiftById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM shifts WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: '該当シフトが見つかりません' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('シフト単体取得エラー:', err);
    res.status(500).json({ message: '取得に失敗しました' });
  }
};

// ✅ シフト削除（DELETE /shifts/:id）
exports.deleteShift = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM shifts WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: '削除対象が見つかりません' });
    }

    res.json({ message: '削除しました', deleted: result.rows[0] });
  } catch (err) {
    console.error('削除エラー:', err);
    res.status(500).json({ message: '削除に失敗しました' });
  }
};
