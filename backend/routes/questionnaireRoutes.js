const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');

// 問診取得
router.get('/:reservation_id', questionnaireController.getQuestionnaire);

// 問診保存（新規or更新）
router.post('/:reservation_id', questionnaireController.upsertQuestionnaire);

module.exports = router;
