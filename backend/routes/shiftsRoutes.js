const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

// シフト一覧取得（施設単位）
router.get('/', authenticate, async (req, res) => {
  const { facility_id } = req.user;
  try {
    const result = await pool.query('SELECT * FROM shifts WHERE facility_id = $1 ORDER BY date, time', [facility_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('シフト一覧取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// シフト1件取得
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { facility_id } = req.user;
  try {
    const result = await pool.query('SELECT * FROM shifts WHERE id = $1 AND facility_id = $2', [id, facility_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'シフトが見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('シフト取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// シフト登録
router.post('/', authenticate, async (req, res) => {
  const { date, time, doctor_id } = req.body;
  const { facility_id } = req.user;

  if (!date || !time || !doctor_id) {
    return res.status(400).json({ message: '日付、時間、医師IDが必要です' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO shifts (facility_id, date, time, doctor_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [facility_id, date, time, doctor_id]
    );
    res.status(201).json({ message: 'シフト登録成功', shift: result.rows[0] });
  } catch (err) {
    console.error('シフト登録エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// シフト更新
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { date, time, doctor_id } = req.body;
  const { facility_id } = req.user;

  if (!date || !time || !doctor_id) {
    return res.status(400).json({ message: '日付、時間、医師IDが必要です' });
  }

  try {
    const result = await pool.query(
      'UPDATE shifts SET date = $1, time = $2, doctor_id = $3 WHERE id = $4 AND facility_id = $5 RETURNING *',
      [date, time, doctor_id, id, facility_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'シフトが見つかりません' });
    }
    res.json({ message: 'シフトを更新しました', shift: result.rows[0] });
  } catch (err) {
    console.error('シフト更新エラー:', err);
    res.status(500).json({ message: '更新に失敗しました' });
  }
});

// シフト削除
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { facility_id } = req.user;
  try {
    const result = await pool.query('DELETE FROM shifts WHERE id = $1 AND facility_id = $2 RETURNING *', [id, facility_id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'シフトが見つかりません' });
    }
    res.json({ message: 'シフトを削除しました', deleted: result.rows[0] });
  } catch (err) {
    console.error('シフト削除エラー:', err);
    res.status(500).json({ message: '削除に失敗しました' });
  }
});

module.exports = router;
