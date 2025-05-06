const pool = require("../db");

// グループ一覧取得
exports.getGroups = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM groups ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "取得失敗" });
  }
};

// グループ新規登録
exports.createGroup = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO groups (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "登録失敗" });
  }
};

// グループ削除
exports.deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM groups WHERE id = $1", [id]);
    res.status(204).send(); // No Content
  } catch (err) {
    res.status(500).json({ error: "削除失敗" });
  }
};

// グループ取得（ID指定）
exports.getGroupById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM groups WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "見つかりません" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "取得失敗" });
  }
};

// グループ名更新
exports.updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      "UPDATE groups SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "更新失敗" });
  }
};
