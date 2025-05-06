// /backend/server.js

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const reservationRoutes = require('./routes/reservationRoutes'); // 予約ルート
const holidayRoutes = require('./routes/holidayRoutes'); // 休診日ルート（これから作る）
const app = express();

// ミドルウェア設定
app.use(cors({
  origin: 'http://localhost:3000', // フロントエンドURL
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ルーティング
app.use('/reservations', reservationRoutes);
app.use('/holidays', holidayRoutes);

// 起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`サーバー起動中: http://localhost:${PORT}`);
});
