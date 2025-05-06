const express = require('express');
const router = express.Router();
const controller = require('../controllers/closedDayController');

// GET: 一覧取得（絞り込みあり）
router.get('/', controller.getClosedDays);

// POST: 登録
router.post('/', controller.createClosedDay);

// DELETE: 削除
router.delete('/:id', controller.deleteClosedDay);

module.exports = router;
