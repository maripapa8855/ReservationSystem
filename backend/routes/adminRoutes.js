const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

// 管理者一覧取得
router.get('/', authenticate, async (req, res) => {
  const { group_id } = req.user;
  try {
    const result = await pool.query(
      'SELECT * FROM admins WHERE group_id = $1 ORDER BY id',
      [group_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('管理者一覧取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 単一管理者取得
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { group_id } = req.user;
  try {
    const result = await pool.query(
      'SELECT * FROM admins WHERE id = $1 AND group_id = $2',
      [id, group_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '管理者が見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('管理者取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 管理者登録
router.post('/', authenticate, async (req, res) => {
  const { name, email, phone, password, role, facility_id } = req.body;
  const { group_id } = req.user;

  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({ message: '全ての項目を入力してください' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO admins (name, email, phone, password, role, group_id, facility_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, email, phone, password, role, group_id, facility_id || null]
    );
    res.status(201).json({ message: '管理者登録成功', admin: result.rows[0] });
  } catch (err) {
    console.error('管理者登録エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 管理者削除
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { group_id } = req.user;
  try {
    const result = await pool.query(
      'DELETE FROM admins WHERE id = $1 AND group_id = $2 RETURNING *',
      [id, group_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: '管理者が見つかりません' });
    }
    res.json({ message: '管理者を削除しました', deleted: result.rows[0] });
  } catch (err) {
    console.error('管理者削除エラー:', err);
    res.status(500).json({ message: '削除に失敗しました' });
  }
});

module.exports = router;
