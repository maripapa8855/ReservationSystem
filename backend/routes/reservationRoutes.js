const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// 管理者用 予約一覧取得（早めにマッチさせる）
router.get('/admin', reservationController.getAllReservationsForAdmin);

// 自分の予約一覧（施設名付き）
router.get('/mypage', reservationController.getMyReservations);

// 時間帯ごとの予約数取得（新機能）
router.get('/counts', reservationController.getReservationCounts);

// 1スロットの予約数チェック
router.get('/slot-count', reservationController.getReservationCountForSlot);

// 医師のシフト取得（shiftsテーブル）
router.get('/shifts', reservationController.getShiftsByDoctor);

// 予約一覧取得（ログイン中ユーザー用）
router.get('/', reservationController.getReservations);

// 予約詳細取得（1件）← 🔍 編集画面で使用
router.get('/:id', reservationController.getReservationById);

// 予約登録
router.post('/', reservationController.createReservation);

// 予約更新
router.put('/:id', reservationController.updateReservation);

// 予約削除
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;
