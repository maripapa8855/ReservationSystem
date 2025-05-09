const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// グループ一覧取得
router.get('/', groupController.getGroups);

// グループ登録
router.post('/', groupController.createGroup);

// グループ削除
router.delete('/:id', groupController.deleteGroup);

module.exports = router;
