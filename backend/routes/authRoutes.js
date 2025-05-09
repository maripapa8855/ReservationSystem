const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ✅ ユーザー登録
router.post('/register', (req, res) => {
  console.log('📩 POST /auth/register');
  authController.register(req, res);
});

// ✅ ログイン
router.post('/login', (req, res) => {
  console.log('🔐 POST /auth/login');
  authController.login(req, res);
});

// ✅ ログアウト
router.post('/logout', (req, res) => {
  console.log('🚪 POST /auth/logout');
  authController.logout(req, res);
});

// ✅ ログイン状態チェック
router.get('/check', (req, res) => {
  console.log('🧪 GET /auth/check');
  authController.check(req, res);
});

// ✅ 現在のユーザー情報取得
router.get('/me', (req, res) => {
  console.log('🙋‍♂️ GET /auth/me');
  authController.getCurrentUser(req, res);
});

// ✅ パスワードリセットメール送信
router.post('/forgot-password', (req, res) => {
  console.log('📧 POST /auth/forgot-password');
  authController.forgotPassword(req, res);
});

// ✅ パスワードリセット実行
router.post('/reset-password', (req, res) => {
  console.log('🔑 POST /auth/reset-password');
  authController.resetPassword(req, res);
});

module.exports = router;
