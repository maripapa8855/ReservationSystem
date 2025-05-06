const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  check,
  getCurrentUser,
} = require('../controllers/authController');
const adminController = require('../controllers/adminController');

// 🔐 認証系エンドポイント

// ユーザー登録
router.post('/register', (req, res) => {
  console.log('📩 POST /auth/register');
  register(req, res);
});

// ログイン
router.post('/login', (req, res) => {
  console.log('🔐 POST /auth/login');
  login(req, res);
});

// ログアウト
router.post('/logout', (req, res) => {
  console.log('🚪 POST /auth/logout');
  logout(req, res);
});

// ログイン状態チェック
router.get('/check', (req, res) => {
  console.log('🧪 GET /auth/check');
  check(req, res);
});

// 現在のユーザー情報取得（/auth/me）
router.get('/me', (req, res) => {
  console.log('🙋‍♂️ GET /auth/me');
  getCurrentUser(req, res);
});

// ...すでにあるルートに加えて
router.post('/forgot-password', adminController.forgotPassword);       // 既存
router.post('/reset-password', adminController.resetPassword);         // ✅ 新規追加

module.exports = router;
