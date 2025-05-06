const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 管理者登録
router.post('/register', adminController.register);

// 管理者ログイン・ログアウト・パスワード変更
router.post('/login', adminController.login);
router.post('/logout', adminController.logout);
router.post('/change-password', adminController.changePassword);

// 認証チェック
router.get('/check', adminController.checkAdminAuth);

// ✅ 管理者一覧取得（新規追加）
router.get('/admins', adminController.getAdmins);

module.exports = router;
