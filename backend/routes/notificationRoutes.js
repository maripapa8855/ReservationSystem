const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

// 通知設定一覧取得
router.get('/', authenticate, async (req, res) => {
  const { facility_id } = req.user;
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE facility_id = $1 ORDER BY id',
      [facility_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('通知設定一覧取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 単一通知設定取得
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { facility_id } = req.user;
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE id = $1 AND facility_id = $2',
      [id, facility_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '通知設定が見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('通知設定取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 通知設定登録
router.post('/', authenticate, async (req, res) => {
  const { notify_email, notify_line, notify_sms } = req.body;
  const { facility_id } = req.user;

  try {
    const result = await pool.query(
      'INSERT INTO notifications (facility_id, notify_email, notify_line, notify_sms) VALUES ($1, $2, $3, $4) RETURNING *',
      [facility_id, notify_email, notify_line, notify_sms]
    );
    res.status(201).json({ message: '通知設定登録成功', notification: result.rows[0] });
  } catch (err) {
    console.error('通知設定登録エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 通知設定更新
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { notify_email, notify_line, notify_sms } = req.body;
  const { facility_id } = req.user;

  try {
    const result = await pool.query(
      'UPDATE notifications SET notify_email = $1, notify_line = $2, notify_sms = $3 WHERE id = $4 AND facility_id = $5 RETURNING *',
      [notify_email, notify_line, notify_sms, id, facility_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: '通知設定が見つかりません' });
    }
    res.json({ message: '通知設定を更新しました', notification: result.rows[0] });
  } catch (err) {
    console.error('通知設定更新エラー:', err);
    res.status(500).json({ message: '更新に失敗しました' });
  }
});

// 通知設定削除
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { facility_id } = req.user;

  try {
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND facility_id = $2 RETURNING *',
      [id, facility_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: '通知設定が見つかりません' });
    }
    res.json({ message: '通知設定を削除しました', deleted: result.rows[0] });
  } catch (err) {
    console.error('通知設定削除エラー:', err);
    res.status(500).json({ message: '削除に失敗しました' });
  }
});

module.exports = router;
