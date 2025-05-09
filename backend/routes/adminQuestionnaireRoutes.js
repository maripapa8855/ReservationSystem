const express = require('express');
const router = express.Router();
const adminQuestionnaireController = require('../controllers/adminQuestionnaireController');

// 問診一覧取得
router.get('/', adminQuestionnaireController.getAllQuestionnaires);

// 問診詳細取得
router.get('/:id', adminQuestionnaireController.getQuestionnaireById);

router.post('/register', adminController.registerAdmin);

module.exports = router;
