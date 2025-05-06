const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// 通知設定一覧取得（GET）
router.get('/', notificationController.getNotificationSettings);

// 通知設定の更新（PUT /:id）
router.put('/:id', notificationController.updateNotificationSettings);

module.exports = router;
