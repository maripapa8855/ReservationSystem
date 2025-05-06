// /backend/routes/facilityRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const facilityController = require('../controllers/facilityController');

// 管理者ごとの施設取得（先に書くことで :id との衝突を防ぐ）
router.get('/by-admin', facilityController.getFacilityByAdmin);

// 全施設取得（こちらも固定パスなので優先）
router.get('/', facilityController.getAllFacilities);

// 施設IDで施設を取得（パラメータ付きルートは最後に書くのが安全）
router.get('/:id', async (req, res) => {
  const facilityId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT id, name FROM facilities WHERE id = $1',
      [facilityId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '施設が見つかりません' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('施設取得エラー:', error.message);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

module.exports = router;
