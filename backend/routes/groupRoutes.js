const pool = require("../db");

// グループ一覧取得
exports.getGroups = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM groups ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "グループの取得に失敗しました。" });
  }
};

// グループ登録
exports.createGroup = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO groups (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "グループの登録に失敗しました。" });
  }
};

// グループ削除
exports.deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM groups WHERE id = $1", [id]);
    res.status(204).send(); // No Content
  } catch (err) {
    res.status(500).json({ error: "グループの削除に失敗しました。" });
  }
};
