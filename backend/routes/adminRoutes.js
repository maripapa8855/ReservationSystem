const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// ✅ 管理者登録
router.post('/register', adminController.registerAdmin);

// ✅ 管理者ログイン
router.post('/login', adminController.adminLogin);

// ✅ 管理者認証チェック
router.get('/check', adminController.checkAdmin);

// ✅ 管理者一覧取得
router.get('/admins', adminController.getAdmins);

// ✅ 管理者詳細取得
router.get('/admins/:id', adminController.getAdminById);

// ✅ 管理者情報更新
router.put('/admins/:id', adminController.updateAdminById);

// ✅ 管理者論理削除
router.delete('/admins/:id', adminController.deleteAdminById);

// ✅ 管理者パスワード更新
router.post('/admins/:id/change-password', adminController.updateAdminPassword);

// ✅ 管理者復元（論理削除キャンセル）
router.post('/admins/:id/restore', adminController.restoreAdminById);

module.exports = router;
