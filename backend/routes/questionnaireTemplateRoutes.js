const express = require('express');
const router = express.Router();
const questionnaireTemplateController = require('../controllers/questionnaireTemplateController');

// 管理者向け：問診テンプレート一覧取得
router.get('/', questionnaireTemplateController.getQuestionnaireTemplates);

// 管理者向け：問診テンプレート新規登録
router.post('/', questionnaireTemplateController.createQuestionnaireTemplate);

// 管理者向け：問診テンプレート個別取得
router.get('/:id', questionnaireTemplateController.getQuestionnaireTemplate);

// 管理者向け：問診テンプレート更新
router.put('/:id', questionnaireTemplateController.updateQuestionnaireTemplate);

// 管理者向け：問診テンプレート削除
router.delete('/:id', questionnaireTemplateController.deleteQuestionnaireTemplate);

// 🔥 追加：患者用・予約用：問診テンプレート存在チェック＋取得
router.get('/check', questionnaireTemplateController.getQuestionnaireTemplateByGroupFacilityDepartment);

module.exports = router;
