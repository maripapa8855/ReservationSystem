const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const SECRET_KEY = process.env.SESSION_SECRET || 'your-secret-key';
console.log('SECRET_KEY loaded:', SECRET_KEY);

// 管理者登録
const registerAdmin = async (req, res) => {
  const { name, email, phone, password, role, group_id, facility_id } = req.body;
  const requester = req.user; // ログイン中の管理者情報（認証ミドルウェアでセット済み前提）

  // 入力チェック
  if (!name || !email || !phone || !password || !role || !group_id) {
    return res.status(400).json({ message: '全ての項目が必要です' });
  }

  // 権限による制御
  if (requester.role === 'facilityadmin' || requester.role === 'viewer') {
    return res.status(403).json({ message: 'この権限では管理者登録はできません' });
  }

  if (requester.role === 'groupadmin') {
    if (requester.group_id !== group_id) {
      return res.status(403).json({ message: '他法人の管理者は登録できません' });
    }
    if (role === 'superadmin' || role === 'groupadmin') {
      return res.status(403).json({ message: '上位権限の管理者は登録できません' });
    }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO admins (name, email, phone, password, role, group_id, facility_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, email, phone, hashedPassword, role, group_id, facility_id || null]
    );

    console.log('✅ 管理者登録成功:', result.rows[0]);
    res.status(201).json({ message: '管理者登録成功' });
  } catch (err) {
    console.error('管理者登録エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// 管理者認証チェック
const checkAdmin = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: '未認証' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({
      message: '認証済み',
      admin_id: decoded.user_id,
      group_id: decoded.group_id,
      role: decoded.role,
    });
  } catch (err) {
    console.error('認証チェックエラー:', err);
    res.status(401).json({ message: '無効なトークン' });
  }
};

// 管理者一覧取得
const getAdmins = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.name, a.email, a.phone, a.role, g.name AS group_name
       FROM admins a
       LEFT JOIN groups g ON a.group_id = g.id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('管理者一覧取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// 管理者詳細取得
const getAdminById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, group_id FROM admins WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '管理者が見つかりません' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('管理者詳細取得エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// 管理者情報更新
const updateAdminById = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role } = req.body;

  if (!name || !email || !phone || !role) {
    return res.status(400).json({ message: '全ての項目が必要です' });
  }

  try {
    const result = await pool.query(
      `UPDATE admins
       SET name = $1, email = $2, phone = $3, role = $4
       WHERE id = $5 AND deleted_at IS NULL
       RETURNING id, name, email, phone, role, group_id`,
      [name, email, phone, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '管理者が見つかりません' });
    }

    res.json({ message: '管理者情報を更新しました', admin: result.rows[0] });
  } catch (err) {
    console.error('管理者更新エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// 管理者削除（論理削除）
const deleteAdminById = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'UPDATE admins SET deleted_at = NOW() WHERE id = $1',
      [id]
    );

    console.log(`管理者ID ${id} を論理削除しました`);
    res.json({ message: '管理者を削除しました' });
  } catch (err) {
    console.error('管理者削除エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// パスワード更新
const updateAdminPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: '新しいパスワードを入力してください' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE admins SET password = $1 WHERE id = $2',
      [hashedPassword, id]
    );

    console.log(`管理者ID ${id} のパスワードを更新しました`);
    res.json({ message: 'パスワードを更新しました' });
  } catch (err) {
    console.error('パスワード更新エラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log('管理者ログイン試行:', email);

  try {
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      console.log('ユーザーが存在しません');
      return res.status(401).json({ message: 'ユーザーが存在しません' });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      console.log('パスワードが一致しません');
      return res.status(401).json({ message: 'パスワードが一致しません' });
    }

    console.log('ログイン成功');
    res.json({ message: 'ログイン成功', adminId: admin.id });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

module.exports = {
  registerAdmin,
  checkAdmin,
  getAdmins,
  getAdminById,
  updateAdminById,
  deleteAdminById,
  updateAdminPassword,
  adminLogin,
};
