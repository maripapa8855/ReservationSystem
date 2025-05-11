const pool = require('../db');
const bcrypt = require('bcryptjs');
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

// ユーザー登録（＋メール通知）
const register = async (req, res) => {
  const { name, email, password, phone, role = 'user', group_id, facility_id } = req.body;

  if (!name || !email || !password || !phone || !group_id || !facility_id) {
    return res.status(400).json({ message: '全ての項目が必要です' });
  }

  try {
    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // DB登録
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role, group_id, facility_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, email, hashedPassword, phone, role, group_id, facility_id]
    );

    console.log('✅ ユーザー登録成功:', result.rows[0]);

    // ✅ 登録成功時にメール送信（ログインURLを含む）
    const loginUrl = `http://localhost:3000/login?group_id=${group_id}&facility_id=${facility_id}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: '【予約システム】ご登録ありがとうございます',
      text:
        `${name} 様\n\n` +
        `予約システムへのご登録が完了しました。\n\n` +
        `以下のURLよりログインをお願いいたします：\n\n` +
        `${loginUrl}\n\n` +
        `このメールに心当たりがない場合は、破棄してください。`,
    });

    console.log('📧 登録確認メール送信:', email);

    // 成功レスポンス（リダイレクトしない）
    res.status(201).json({ message: '登録成功。メールを確認してください。' });
  } catch (err) {
    console.error('ユーザー登録エラー:', err);
    if (err.code === '23505') {
      return res.status(409).json({ message: 'このメールアドレスは既に登録されています' });
    }
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// ログイン
const login = async (req, res) => {
  const { email, password, group_id, facility_id } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'メールアドレスとパスワードが必要です' });
  }

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: '認証失敗' });
    }

    if (group_id && Number(group_id) !== user.group_id) {
      return res.status(403).json({ message: '不正な法人情報です' });
    }

    if (facility_id && Number(facility_id) !== user.facility_id) {
      return res.status(403).json({ message: '不正な施設情報です' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        group_id: user.group_id,
        facility_id: user.facility_id,
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

    console.log('✅ ログイン成功:', user.email);
    res.json({
      message: 'ログイン成功',
      id: user.id,
      group_id: user.group_id,
      facility_id: user.facility_id,
      role: user.role,
      email: user.email,
    });
  } catch (err) {
    console.error('ログインエラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// ログアウト
const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'ログアウトしました' });
};

// ログイン状態確認
const check = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: '未認証', loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    const userRes = await pool.query(
      'SELECT id, name, email, role, group_id, facility_id FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'ユーザーが見つかりません', loggedIn: false });
    }

    const user = userRes.rows[0];

    res.json({
      loggedIn: true,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      group_id: user.group_id,
      facility_id: user.facility_id,
    });
  } catch (err) {
    console.error('認証確認エラー:', err);
    res.status(401).json({ message: '無効なトークン', loggedIn: false });
  }
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
      'SELECT id, name, email, role, group_id, facility_id FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    res.json(userRes.rows[0]);
  } catch (err) {
    console.error('getCurrentUser エラー:', err);
    res.status(401).json({ message: '無効なトークンです' });
  }
};

// パスワードリセットメール送信
const forgotPassword = async (req, res) => {
  const { email, facility_id } = req.body;

  if (!email || !facility_id) {
    return res.status(400).json({ message: 'メールアドレスと施設IDが必要です' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name FROM users WHERE email = $1 AND facility_id = $2',
      [email, facility_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: '該当ユーザーが見つかりません' });
    }

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '15m' });
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'パスワードリセットのご案内',
      text:
        `${user.name}様\n\nパスワードリセットをご希望されました。\n` +
        `以下のURLから新しいパスワードを設定してください（有効期限15分）：\n\n` +
        `${resetUrl}\n\n` +
        `このメールに心当たりがない場合は破棄してください。`,
    });

    console.log('📧 パスワードリセットメール送信:', email);
    res.json({ message: 'パスワードリセット用メールを送信しました' });
  } catch (err) {
    console.error('パスワードリセットメール送信エラー:', err);
    res.status(500).json({ message: 'メール送信に失敗しました' });
  }
};

// パスワード更新処理
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'トークンと新しいパスワードが必要です' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [
      hashedPassword,
      decoded.id,
    ]);

    res.json({ message: 'パスワードを更新しました' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'このリンクは期限切れです。再度お試しください。' });
    }
    console.error('パスワード更新エラー:', err);
    res.status(401).json({ message: '無効なトークンです' });
  }
};

module.exports = {
  register,
  login,
  logout,
  check,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};
