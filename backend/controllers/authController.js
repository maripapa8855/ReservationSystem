const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const SECRET_KEY = process.env.SESSION_SECRET || 'your-secret-key';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ユーザー登録
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'user', group_id } = req.body;

    if (!name || !email || !password || !phone || !group_id) {
      return res.status(400).json({ message: '全ての項目が必要です。' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role, group_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, email, hashedPassword, phone, role, group_id]
    );

    console.log('✅ 登録完了:', result.rows[0]);
    return res.status(201).json({ message: '登録成功' });
  } catch (error) {
    console.error('❗ 登録エラー:', error);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

// ログイン
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'メールアドレスとパスワードが必要です' });
  }

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

    if (!user) {
      return res.status(401).json({ message: '認証失敗' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '認証失敗' });
    }

    const token = jwt.sign(
      {
        user_id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        group_id: user.group_id,
      },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('user_id', user.id, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log('✅ ログイン成功:', user.email);
    return res.json({ message: 'ログイン成功', user_id: user.id });
  } catch (err) {
    console.error('❗ ログイン中のエラー:', err);
    return res.status(500).json({ message: 'ログインに失敗しました' });
  }
};

// ログアウト
const logout = (req, res) => {
  res.clearCookie('token');
  res.clearCookie('user_id');
  res.json({ message: 'ログアウトしました' });
};

// ログイン状態チェック
const check = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ loggedIn: false });
  }
  res.json({ loggedIn: true });
};

// 現在のユーザー情報取得
const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: '未認証です' });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const userRes = await pool.query(
      'SELECT id, name, email, role, group_id FROM users WHERE id = $1',
      [decoded.user_id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    const user = userRes.rows[0];
    res.json(user);
  } catch (err) {
    console.error('getCurrentUser エラー:', err);
    res.status(401).json({ message: '無効なトークンです' });
  }
};

// パスワードリセットメール送信
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'メールアドレスが必要です' });
  }

  try {
    const result = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: '該当するユーザーが見つかりません' });
    }

    const user = result.rows[0];
    const token = jwt.sign({ user_id: user.id }, SECRET_KEY, { expiresIn: '15m' });
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'パスワードリセットのご案内',
      text:
        `${user.name}様\n\nパスワードリセットをご希望されました。\n` +
        `以下のURLから新しいパスワードを設定してください（有効期限15分）：\n\n` +
        `${resetUrl}\n\n` +
        `このメールに心当たりがない場合は破棄してください。`,
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 パスワードリセットメール送信:', email);

    res.json({ message: 'パスワードリセット用メールを送信しました。' });
  } catch (err) {
    console.error('パスワードリセットメール送信エラー:', err.message);
    res.status(500).json({ message: 'メール送信に失敗しました' });
  }
};

// ✅ パスワード更新処理
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'トークンと新しいパスワードが必要です' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.user_id;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'パスワードを更新しました。' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'このリンクは期限切れです。再度お試しください。' });
    }
    return res.status(401).json({ message: '無効なトークンです' });
  }
};

module.exports = {
  register,
  login,
  logout,
  check,
  getCurrentUser,
  forgotPassword,
  resetPassword
};
