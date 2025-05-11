const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

// 休診日一覧取得
router.get('/', authenticate, async (req, res) => {
  const { facility_id } = req.user;
  try {
    const result = await pool.query(
      'SELECT * FROM holidays WHERE facility_id = $1 ORDER BY date',
      [facility_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('休診日一覧取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 単一休診日取得
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { facility_id } = req.user;
  try {
    const result = await pool.query(
      'SELECT * FROM holidays WHERE id = $1 AND facility_id = $2',
      [id, facility_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '休診日が見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('休診日取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 休診日登録
router.post('/', authenticate, async (req, res) => {
  const { date, reason } = req.body;
  const { facility_id } = req.user;

  if (!date || !reason) {
    return res.status(400).json({ message: '日付と理由が必要です' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO holidays (facility_id, date, reason) VALUES ($1, $2, $3) RETURNING *',
      [facility_id, date, reason]
    );
    res.status(201).json({ message: '休診日登録成功', holiday: result.rows[0] });
  } catch (err) {
    console.error('休診日登録エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 休診日更新
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { date, reason } = req.body;
  const { facility_id } = req.user;

  if (!date || !reason) {
    return res.status(400).json({ message: '日付と理由が必要です' });
  }

  try {
    const result = await pool.query(
      'UPDATE holidays SET date = $1, reason = $2 WHERE id = $3 AND facility_id = $4 RETURNING *',
      [date, reason, id, facility_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: '休診日が見つかりません' });
    }
    res.json({ message: '休診日を更新しました', holiday: result.rows[0] });
  } catch (err) {
    console.error('休診日更新エラー:', err);
    res.status(500).json({ message: '更新に失敗しました' });
  }
});

// 休診日削除
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { facility_id } = req.user;
  try {
    const result = await pool.query(
      'DELETE FROM holidays WHERE id = $1 AND facility_id = $2 RETURNING *',
      [id, facility_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: '休診日が見つかりません' });
    }
    res.json({ message: '休診日を削除しました', deleted: result.rows[0] });
  } catch (err) {
    console.error('休診日削除エラー:', err);
    res.status(500).json({ message: '削除に失敗しました' });
  }
});

module.exports = router;
