const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const SECRET_KEY = process.env.SESSION_SECRET || 'your-secret-key';

// 登録処理
exports.register = async (req, res) => {
  const { name, email, password, phone, role = 'user', group_id } = req.body;

  if (!name || !email || !password || !phone || !group_id) {
    return res.status(400).json({ message: '全ての項目を入力してください' });
  }

  try {
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'このメールアドレスは既に登録されています' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role, group_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, email, hashedPassword, phone, role, group_id]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
        group_id: user.group_id
      },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(201).json({ message: 'ユーザー登録が完了しました', user });

  } catch (err) {
    console.error('ユーザー登録エラー:', err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// ログイン処理
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'メールアドレスとパスワードが必要です' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: '認証失敗' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '認証失敗' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, group_id: user.group_id },
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

    res.json({ message: 'ログイン成功' });
  } catch (err) {
    console.error('ログインエラー:', err.message);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// ログアウト処理
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.clearCookie('user_id');
  res.json({ message: 'ログアウトしました' });
};

// パスワード変更処理
exports.changePassword = async (req, res) => {
  res.status(501).json({ message: '未実装（仮）' });
};

// 認証チェック
exports.checkAuth = async (req, res) => {
  res.status(501).json({ message: '未実装（仮）' });
};

// 管理者一覧取得（super_admin → 全件、group_admin → group_idフィルタ）
exports.getAdmins = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: '未認証です' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    let result;
    if (decoded.role === 'super_admin') {
      result = await pool.query(
        'SELECT id, name, email, role, group_id FROM users WHERE role IN ($1, $2, $3)',
        ['facility_admin', 'group_admin', 'viewer']
      );
    } else if (decoded.role === 'group_admin') {
      result = await pool.query(
        'SELECT id, name, email, role, group_id FROM users WHERE group_id = $1 AND role IN ($2, $3)',
        [decoded.group_id, 'facility_admin', 'viewer']
      );
    } else {
      return res.status(403).json({ message: '権限がありません' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('管理者一覧取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
