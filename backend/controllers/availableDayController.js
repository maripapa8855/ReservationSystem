// backend/controllers/availableDayController.js
exports.getAvailableDays = async (req, res) => {
  const { doctor_id } = req.query;
  if (!doctor_id) return res.status(400).json({ message: 'doctor_id 必須' });

  try {
    const result = await pool.query(
      'SELECT weekday FROM available_days WHERE doctor_id = $1',
      [doctor_id]
    );
    res.json(result.rows.map(r => r.weekday));
  } catch (err) {
    console.error('診療可能曜日取得エラー:', err);
    res.status(500).json({ message: '取得失敗' });
  }
};
