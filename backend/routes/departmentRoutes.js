const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

// 診療科一覧取得（所属施設限定 or superadmin）
router.get('/', authenticate, async (req, res) => {
  const { role, group_id } = req.user;
  try {
    let result;
    if (role === 'superadmin') {
      result = await pool.query('SELECT * FROM departments ORDER BY id');
    } else {
      result = await pool.query('SELECT * FROM departments WHERE group_id = $1 ORDER BY id', [group_id]);
    }
    res.json(result.rows);
  } catch (err) {
    console.error('診療科一覧取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 単一診療科取得
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { role, group_id } = req.user;
  try {
    const result = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '診療科が見つかりません' });
    }
    if (role !== 'superadmin' && result.rows[0].group_id !== group_id) {
      return res.status(403).json({ message: '権限がありません' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('診療科取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 診療科登録
router.post('/', authenticate, async (req, res) => {
  const { name, group_id } = req.body;
  const { role } = req.user;

  if (role !== 'superadmin' && role !== 'groupadmin') {
    return res.status(403).json({ message: '権限がありません' });
  }

  if (!name || !group_id) {
    return res.status(400).json({ message: '診療科名と法人IDが必要です' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO departments (name, group_id) VALUES ($1, $2) RETURNING *',
      [name, group_id]
    );
    res.status(201).json({ message: '診療科登録成功', department: result.rows[0] });
  } catch (err) {
    console.error('診療科登録エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 診療科削除
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { role, group_id } = req.user;

  try {
    const result = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: '診療科が見つかりません' });
    }
    if (role !== 'superadmin' && result.rows[0].group_id !== group_id) {
      return res.status(403).json({ message: '権限がありません' });
    }

    await pool.query('DELETE FROM departments WHERE id = $1', [id]);
    res.json({ message: '診療科を削除しました' });
  } catch (err) {
    console.error('診療科削除エラー:', err);
    res.status(500).json({ message: '削除に失敗しました' });
  }
});

module.exports = router;
