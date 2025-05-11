const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

// スケジュール一覧取得（施設単位）
router.get('/', authenticate, async (req, res) => {
  const { facility_id } = req.user;
  try {
    const result = await pool.query('SELECT * FROM schedules WHERE facility_id = $1 ORDER BY date, time', [facility_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('スケジュール一覧取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// スケジュール1件取得
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { facility_id } = req.user;
  try {
    const result = await pool.query('SELECT * FROM schedules WHERE id = $1 AND facility_id = $2', [id, facility_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'スケジュールが見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('スケジュール取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// スケジュール登録
router.post('/', authenticate, async (req, res) => {
  const { date, time, description } = req.body;
  const { facility_id } = req.user;

  if (!date || !time || !description) {
    return res.status(400).json({ message: '日付、時間、説明が必要です' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO schedules (facility_id, date, time, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [facility_id, date, time, description]
    );
    res.status(201).json({ message: 'スケジュール登録成功', schedule: result.rows[0] });
  } catch (err) {
    console.error('スケジュール登録エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// スケジュール更新
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { date, time, description } = req.body;
  const { facility_id } = req.user;

  if (!date || !time || !description) {
    return res.status(400).json({ message: '日付、時間、説明が必要です' });
  }

  try {
    const result = await pool.query(
      'UPDATE schedules SET date = $1, time = $2, description = $3 WHERE id = $4 AND facility_id = $5 RETURNING *',
      [date, time, description, id, facility_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'スケジュールが見つかりません' });
    }
    res.json({ message: 'スケジュールを更新しました', schedule: result.rows[0] });
  } catch (err) {
    console.error('スケジュール更新エラー:', err);
    res.status(500).json({ message: '更新に失敗しました' });
  }
});

// スケジュール削除
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { facility_id } = req.user;
  try {
    const result = await pool.query('DELETE FROM schedules WHERE id = $1 AND facility_id = $2 RETURNING *', [id, facility_id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'スケジュールが見つかりません' });
    }
    res.json({ message: 'スケジュールを削除しました', deleted: result.rows[0] });
  } catch (err) {
    console.error('スケジュール削除エラー:', err);
    res.status(500).json({ message: '削除に失敗しました' });
  }
});

module.exports = router;
