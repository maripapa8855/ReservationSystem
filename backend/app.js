const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// ミドルウェア設定
app.use(cors({
  origin: 'http://localhost:3000', // フロントエンドのURL
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ルートの読み込み
const reservationRoutes = require('./routes/reservationRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const authRoutes = require('./routes/authRoutes');       // ユーザー用
const adminRoutes = require('./routes/adminRoutes');     // 管理者用
const facilityRoutes = require('./routes/facilityRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const shiftsRoutes = require('./routes/shiftsRoutes');
const groupRoutes = require('./routes/groupRoutes');

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// ルートの登録
app.use('/reservations', reservationRoutes);
app.use('/holidays', holidayRoutes);
app.use('/auth', authRoutes);       // ✅ /auth/*
app.use('/admin', adminRoutes);     // ✅ /admin/*
app.use('/facilities', facilityRoutes);
app.use('/departments', departmentRoutes);
app.use('/doctors', doctorRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/shifts', shiftsRoutes);
app.use('/groups', groupRoutes);

// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 サーバー起動中: http://localhost:${PORT}`);
});

