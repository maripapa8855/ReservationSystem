const express = require('express');
const router = express.Router();

const {
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservationController');

// 🔍 予約一覧取得（ログイン中のユーザーのみ）
router.get('/', getReservations);

// 🆕 予約登録（Cookieのuser_idを使用）
router.post('/', createReservation);

// ✏️ 予約更新（予約変更）
router.put('/:id', updateReservation);

// ❌ 予約キャンセル（削除）
router.delete('/:id', deleteReservation);

module.exports = router;
