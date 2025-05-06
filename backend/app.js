const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const shiftsRoutes = require('./routes/shiftsRoutes');

// 各ルートの読み込み
const reservationRoutes = require('./routes/reservationRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const authRoutes = require('./routes/authRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes'); // ✅ 追加

const app = express();

// ミドルウェア設定
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ルート設定
app.use('/reservations', reservationRoutes);
app.use('/holidays', holidayRoutes);
app.use('/auth', authRoutes);
app.use('/facilities', facilityRoutes);
app.use('/departments', departmentRoutes);
app.use('/doctors', doctorRoutes); // ✅ 追加

// その他ルート...
app.use('/shifts', shiftsRoutes);

// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`サーバー起動中: http://localhost:${PORT}`);
});

const scheduleRoutes = require('./routes/scheduleRoutes');
app.use('/schedules', scheduleRoutes);
