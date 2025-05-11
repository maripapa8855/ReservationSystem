const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SESSION_SECRET || 'your-secret-key';

// 認証ミドルウェア
const authenticate = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: '認証情報が不足しています。ログインし直してください。' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // ロール・ユーザーIDなどをリクエストにセット
    next();
  } catch (err) {
    console.error('認証ミドルウェアエラー:', err);
    return res.status(401).json({ message: 'トークンが無効または期限切れです。再ログインしてください。' });
  }
};

module.exports = { authenticate };
