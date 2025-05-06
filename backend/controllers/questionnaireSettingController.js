// backend/controllers/questionnaireSettingController.js

const pool = require('../db');

// 問診設定確認
exports.checkQuestionnaireSetting = async (req, res) => {
  const { group_id, facility_id, department_id } = req.query;

  if (!group_id || !facility_id || !department_id) {
    return res.status(400).json({ message: 'パラメータ不足です' });
  }

  try {
    const result = await pool.query(
      `SELECT enabled FROM questionnaire_settings
       WHERE group_id = $1 AND facility_id = $2 AND department_id = $3
       LIMIT 1`,
      [group_id, facility_id, department_id]
    );

    if (result.rowCount === 0) {
      // 設定が無い場合はデフォルトで enabled = true とする
      return res.json({ enabled: true });
    }

    res.json({ enabled: result.rows[0].enabled });
  } catch (err) {
    console.error('問診設定取得エラー:', err.message);
    res.status(500).json({ message: '問診設定取得に失敗しました' });
  }
};
