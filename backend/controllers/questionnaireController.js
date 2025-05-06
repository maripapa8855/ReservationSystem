const pool = require('../db');

// 🔄 問診 登録（新規 or 更新）
exports.upsertQuestionnaire = async (req, res) => {
  const { reservation_id } = req.params;
  const { answers } = req.body;

  if (!reservation_id || !answers) {
    return res.status(400).json({ message: '予約IDと回答内容が必要です' });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM questionnaires WHERE reservation_id = $1',
      [reservation_id]
    );

    let result;
    if (existing.rowCount > 0) {
      // 更新処理
      result = await pool.query(
        `UPDATE questionnaires
         SET answers = $1, updated_at = CURRENT_TIMESTAMP
         WHERE reservation_id = $2
         RETURNING *`,
        [answers, reservation_id]
      );
    } else {
      // 新規登録処理
      result = await pool.query(
        `INSERT INTO questionnaires (reservation_id, answers)
         VALUES ($1, $2)
         RETURNING *`,
        [reservation_id, answers]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('問診保存エラー:', err.message);
    res.status(500).json({ message: '問診の保存に失敗しました' });
  }
};

// 📥 問診 取得
exports.getQuestionnaire = async (req, res) => {
  const { reservation_id } = req.params;

  if (!reservation_id) {
    return res.status(400).json({ message: '予約IDが必要です' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM questionnaires WHERE reservation_id = $1',
      [reservation_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: '問診が見つかりません' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('問診取得エラー:', err.message);
    res.status(500).json({ message: '問診の取得に失敗しました' });
  }
};
