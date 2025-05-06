const pool = require('../db');

// 一覧取得（JOINで医師名付き）
const getAllSchedules = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ds.*, d.name AS doctor_name
      FROM doctor_schedules ds
      JOIN doctors d ON ds.doctor_id = d.id
      ORDER BY doctor_id, weekday, start_time
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('シフト一覧取得エラー:', err.message);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// 登録
const createSchedule = async (req, res) => {
  const { doctor_id, weekday, start_time, end_time, capacity } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO doctor_schedules (doctor_id, weekday, start_time, end_time, capacity)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [doctor_id, weekday, start_time, end_time, capacity]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('シフト登録エラー:', err.message);
    res.status(500).json({ message: '登録に失敗しました' });
  }
};

// 更新
const updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { doctor_id, weekday, start_time, end_time, capacity } = req.body;

  try {
    const result = await pool.query(`
      UPDATE doctor_schedules
      SET doctor_id = $1, weekday = $2, start_time = $3, end_time = $4, capacity = $5
      WHERE id = $6 RETURNING *
    `, [doctor_id, weekday, start_time, end_time, capacity, id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('シフト更新エラー:', err.message);
    res.status(500).json({ message: '更新に失敗しました' });
  }
};

// 削除
const deleteSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`DELETE FROM doctor_schedules WHERE id = $1`, [id]);
    res.json({ message: '削除完了' });
  } catch (err) {
    console.error('シフト削除エラー:', err.message);
    res.status(500).json({ message: '削除に失敗しました' });
  }
};

module.exports = {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
