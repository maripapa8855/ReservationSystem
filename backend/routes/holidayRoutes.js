// /backend/routes/holidayRoutes.js

const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');

// 休診日登録
router.post('/', holidayController.createHoliday);

// 休診日一覧取得
router.get('/', holidayController.getHolidays);

// 休診日削除
router.delete('/:id', holidayController.deleteHoliday);

module.exports = router;
