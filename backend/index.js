const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');

const app = express();
const port = 4000;

// ミドルウェア
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // ← Cookieを許可
}));
app.use(express.json());
app.use(cookieParser());

// PostgreSQL接続設定
const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'reservations',
  password: 'postgres',
  port: 5432,
});

// 動作確認用
app.get('/', (req, res) => {
  res.send('🚀 API Server is running (with Cookie Auth)');
});

// ログインAPI（ログイン成功でCookieにuser_idを保存）
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    const user = result.rows[0];

    // Cookieにuser_idを保存（有効期限1日）
    res.cookie('user_id', user.id, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'ログイン成功', user });
  } catch (err) {
    console.error('ログインエラー:', err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
});

// 予約登録API（Cookieからuser_idを取得）
app.post('/reservations', async (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) return res.status(401).send('未ログインです');

  const {
    doctor_id,
    department_id,
    facility_id,
    date,
    time,
    status
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO reservations (user_id, doctor_id, department_id, facility_id, date, time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, doctor_id, department_id, facility_id, date, time, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('予約登録エラー:', err);
    res.status(500).send('予約登録に失敗しました');
  }
});

// 予約一覧API（Cookieのuser_idに基づいて取得）
app.get('/reservations', async (req, res) => {
  const userId = req.cookies.user_id;
  console.log('🔍 user_id =', userId); // ← これがないとログに出ません！
  if (!userId) return res.status(401).send('未ログインです');

  try {
    const result = await pool.query(
      'SELECT * FROM reservations WHERE user_id = $1',
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('予約一覧取得エラー:', err);
    res.status(500).send('データ取得に失敗しました');
  }
});

// 予約削除API（Cookie認証付き）
app.delete('/reservations/:id', async (req, res) => {
  const userId = req.cookies.user_id;
  const { id } = req.params;

  if (!userId) return res.status(401).send('未ログインです');

  try {
    const result = await pool.query(
      'DELETE FROM reservations WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('該当する予約が見つかりません');
    }

    res.json({ message: '予約を削除しました', deleted: result.rows[0] });
  } catch (err) {
    console.error('予約削除エラー:', err);
    res.status(500).send('削除に失敗しました');
  }
});

// サーバー起動
app.listen(port, () => {
  console.log(`🚀 API Server running at http://localhost:${port}`);
});
