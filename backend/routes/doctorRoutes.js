const express = require('express');
const router = express.Router();
const pool = require('../db');
const {
  getDoctors,
  getDoctorsByFilter,
  createDoctor
} = require('../controllers/doctorController');

// 医師一覧取得（管理画面用 全件 or group_id フィルター）
router.get('/', getDoctors);

// 医師フィルター検索（診療科 + 施設）フロントエンド用
router.get('/search', getDoctorsByFilter);

// 医師登録
router.post('/', createDoctor);

// 診療科一覧取得
router.get('/departments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('診療科取得エラー:', err);
    res.status(500).json({ message: '診療科の取得に失敗しました' });
  }
});

// 施設一覧取得
router.get('/facilities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM facilities ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('施設取得エラー:', err);
    res.status(500).json({ message: '施設の取得に失敗しました' });
  }
});

// 医師1件取得（編集用）
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM doctors WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '医師が見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('医師取得エラー:', err);
    res.status(500).json({ message: '医師の取得に失敗しました' });
  }
});

// 医師情報の更新
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, department_id, facility_id } = req.body;

  if (!name || !department_id || !facility_id) {
    return res.status(400).json({ message: '全ての項目を入力してください' });
  }

  try {
    const result = await pool.query(
      'UPDATE doctors SET name = $1, department_id = $2, facility_id = $3 WHERE id = $4 RETURNING *',
      [name, department_id, facility_id, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: '医師が見つかりません' });
    }
    res.json({ message: '医師情報を更新しました', doctor: result.rows[0] });
  } catch (err) {
    console.error('医師更新エラー:', err);
    res.status(500).json({ message: '更新に失敗しました' });
  }
});

// 医師削除
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM doctors WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: '医師が見つかりません' });
    }
    res.json({ message: '医師を削除しました', deleted: result.rows[0] });
  } catch (err) {
    console.error('医師削除エラー:', err);
    res.status(500).json({ message: '削除に失敗しました' });
  }
});

module.exports = router;
