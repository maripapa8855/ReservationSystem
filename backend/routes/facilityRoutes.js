const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

// ✅ 全施設一覧取得（例: GET /facilities）
router.get('/', authenticate, async (req, res) => {
  const { group_id } = req.user;
  try {
    const result = await pool.query('SELECT * FROM facilities WHERE group_id = $1', [group_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('全施設取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// ✅ 単一施設取得（例: GET /facilities/:id）
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { group_id } = req.user;
  try {
    const result = await pool.query('SELECT * FROM facilities WHERE id = $1 AND group_id = $2', [id, group_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '施設が見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('施設取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// ✅ 施設登録（例: POST /facilities）
router.post('/', authenticate, async (req, res) => {
  const { name } = req.body;
  const { group_id } = req.user;

  if (!name) {
    return res.status(400).json({ message: '施設名が必要です' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO facilities (name, group_id) VALUES ($1, $2) RETURNING *',
      [name, group_id]
    );
    res.status(201).json({ message: '施設登録成功', facility: result.rows[0] });
  } catch (err) {
    console.error('施設登録エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// ✅ 施設削除（例: DELETE /facilities/:id）
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { group_id } = req.user;
  try {
    const result = await pool.query(
      'DELETE FROM facilities WHERE id = $1 AND group_id = $2 RETURNING *',
      [id, group_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: '対象の施設が見つかりません' });
    }
    res.json({ message: '施設を削除しました' });
  } catch (err) {
    console.error('施設削除エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

module.exports = router;
