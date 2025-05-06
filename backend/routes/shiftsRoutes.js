const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const pool = require('../db');

// ✅ 診療時間登録
router.post('/', shiftController.createShift);

// ✅ 診療時間一覧取得（全件 or doctor_id 絞り込み）
router.get('/', async (req, res) => {
  const { doctor_id } = req.query;

  try {
    if (doctor_id) {
      const result = await pool.query(
        'SELECT * FROM shifts WHERE doctor_id = $1',
        [doctor_id]
      );
      return res.json(result.rows);
    } else {
      // 全件取得（旧仕様のまま）
      const result = await pool.query('SELECT * FROM shifts');
      return res.json(result.rows);
    }
  } catch (err) {
    console.error('診療時間取得エラー:', err.message);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ✅ 診療枠存在チェック（予約・編集前のバリデーション用）
router.get('/check', shiftController.checkShiftAvailability);

// ✅ 個別シフト取得（編集画面などで使用）
router.get('/:id', shiftController.getShiftById);  // ⭐ 追加

// ✅ シフト削除（一覧の削除ボタンで使用）
router.delete('/:id', shiftController.deleteShift);  // ⭐ 追加

module.exports = router;
