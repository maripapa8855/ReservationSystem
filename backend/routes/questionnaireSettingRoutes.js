// backend/routes/questionnaireSettingRoutes.js

const express = require('express');
const router = express.Router();
const questionnaireSettingController = require('../controllers/questionnaireSettingController');

// 問診設定確認
router.get('/check', questionnaireSettingController.checkQuestionnaireSetting);

module.exports = router;
