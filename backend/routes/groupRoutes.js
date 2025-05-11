const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

// グループ一覧取得（superadmin のみ）
router.get('/', authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== 'superadmin') {
    return res.status(403).json({ message: '権限がありません' });
  }
  try {
    const result = await pool.query('SELECT * FROM groups ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('グループ一覧取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 単一グループ取得
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { role, group_id } = req.user;
  if (role !== 'superadmin' && Number(group_id) !== Number(id)) {
    return res.status(403).json({ message: '権限がありません' });
  }
  try {
    const result = await pool.query('SELECT * FROM groups WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'グループが見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('グループ取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// グループ登録（superadmin のみ）
router.post('/', authenticate, async (req, res) => {
  const { role } = req.user;
  const { name } = req.body;

  if (role !== 'superadmin') {
    return res.status(403).json({ message: '権限がありません' });
  }

  if (!name) {
    return res.status(400).json({ message: 'グループ名を入力してください' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO groups (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json({ message: 'グループ登録成功', group: result.rows[0] });
  } catch (err) {
    console.error('グループ登録エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// グループ削除（superadmin のみ）
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;

  if (role !== 'superadmin') {
    return res.status(403).json({ message: '権限がありません' });
  }

  try {
    const result = await pool.query('DELETE FROM groups WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'グループが見つかりません' });
    }
    res.json({ message: 'グループを削除しました', deleted: result.rows[0] });
  } catch (err) {
    console.error('グループ削除エラー:', err);
    res.status(500).json({ message: '削除に失敗しました' });
  }
});

module.exports = router;
