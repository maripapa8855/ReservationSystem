const pool = require('../db');

// 一覧取得（管理画面用）
exports.getQuestionnaireTemplates = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT qt.id, g.name AS group_name, f.name AS facility_name, d.name AS department_name, qt.template_content
      FROM questionnaire_templates qt
      JOIN groups g ON qt.group_id = g.id
      JOIN facilities f ON qt.facility_id = f.id
      JOIN departments d ON qt.department_id = d.id
      ORDER BY qt.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('テンプレート一覧取得エラー:', err.message);
    res.status(500).json({ message: 'テンプレート一覧取得に失敗しました' });
  }
};

// 個別取得（編集用）
exports.getQuestionnaireTemplate = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM questionnaire_templates WHERE id = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'テンプレートが見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('テンプレート取得エラー:', err.message);
    res.status(500).json({ message: 'テンプレート取得に失敗しました' });
  }
};

// 新規登録
exports.createQuestionnaireTemplate = async (req, res) => {
  const { group_id, facility_id, department_id, template_content } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO questionnaire_templates (group_id, facility_id, department_id, template_content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [group_id, facility_id, department_id, JSON.stringify(template_content)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('テンプレート登録エラー:', err.message);
    res.status(500).json({ message: 'テンプレート登録に失敗しました' });
  }
};

// 更新
exports.updateQuestionnaireTemplate = async (req, res) => {
  const { id } = req.params;
  const { group_id, facility_id, department_id, template_content } = req.body;
  try {
    const result = await pool.query(
      `UPDATE questionnaire_templates
       SET group_id = $1, facility_id = $2, department_id = $3, template_content = $4
       WHERE id = $5
       RETURNING *`,
      [group_id, facility_id, department_id, JSON.stringify(template_content), id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'テンプレートが見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('テンプレート更新エラー:', err.message);
    res.status(500).json({ message: 'テンプレート更新に失敗しました' });
  }
};

// 削除
exports.deleteQuestionnaireTemplate = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM questionnaire_templates WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'テンプレートが見つかりません' });
    }
    res.json({ message: 'テンプレートを削除しました' });
  } catch (err) {
    console.error('テンプレート削除エラー:', err.message);
    res.status(500).json({ message: 'テンプレート削除に失敗しました' });
  }
};

// 🔥 追加：存在チェック（問診有無確認 + 内容取得）
exports.getQuestionnaireTemplateByGroupFacilityDepartment = async (req, res) => {
  const { group_id, facility_id, department_id } = req.query;

  if (!group_id || !facility_id || !department_id) {
    return res.status(400).json({ message: 'パラメータ不足です' });
  }

  try {
    const result = await pool.query(
      `SELECT template_content FROM questionnaire_templates
       WHERE group_id = $1 AND facility_id = $2 AND department_id = $3
       LIMIT 1`,
      [group_id, facility_id, department_id]
    );

    if (result.rowCount === 0) {
      return res.json({ enabled: false });
    }

    res.json({
      enabled: true,
      template_json: result.rows[0].template_content
    });
  } catch (err) {
    console.error('問診テンプレート存在チェックエラー:', err.message);
    res.status(500).json({ message: 'テンプレート存在チェックに失敗しました' });
  }
};
