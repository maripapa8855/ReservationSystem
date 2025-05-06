// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers // ← GET /users 対応
} = require('../controllers/userController');

// 新規登録
router.post('/register', registerUser);

// ログイン
router.post('/login', loginUser);

// ログアウト
router.post('/logout', logoutUser);

// ユーザー一覧（クエリで group_id / facility_id / role フィルタ）
router.get('/', getAllUsers);

module.exports = router;
