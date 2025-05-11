const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

// 予約一覧取得（ログインユーザーの施設のみ）
router.get('/', authenticate, async (req, res) => {
  const { facility_id } = req.user;
  try {
    const result = await pool.query(
      'SELECT * FROM reservations WHERE facility_id = $1 ORDER BY date, time',
      [facility_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('予約一覧取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 単一予約取得
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { facility_id } = req.user;
  try {
    const result = await pool.query(
      'SELECT * FROM reservations WHERE id = $1 AND facility_id = $2',
      [id, facility_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '予約が見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('予約取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 予約登録
router.post('/', authenticate, async (req, res) => {
  const { user_id, doctor_id, date, time } = req.body;
  const { facility_id } = req.user;

  if (!user_id || !doctor_id || !date || !time) {
    return res.status(400).json({ message: '全ての項目を入力してください' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO reservations (user_id, doctor_id, facility_id, date, time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, doctor_id, facility_id, date, time]
    );
    res.status(201).json({ message: '予約登録成功', reservation: result.rows[0] });
  } catch (err) {
    console.error('予約登録エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 予約削除
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { facility_id } = req.user;
  try {
    const result = await pool.query(
      'DELETE FROM reservations WHERE id = $1 AND facility_id = $2 RETURNING *',
      [id, facility_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: '予約が見つかりません' });
    }
    res.json({ message: '予約を削除しました', deleted: result.rows[0] });
  } catch (err) {
    console.error('予約削除エラー:', err);
    res.status(500).json({ message: '削除に失敗しました' });
  }
});

module.exports = router;
