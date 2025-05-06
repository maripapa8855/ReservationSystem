const pool = require('../db');

/**
 * 操作ログ（監査ログ）を記録する共通関数
 *
 * @param {number} userId - 操作を行ったユーザーのID
 * @param {string} action - 操作種別（例: CREATE, UPDATE, DELETE）
 * @param {string} entity - 操作対象（例: 'facility', 'doctor'）
 * @param {number|null} entityId - 操作対象ID（null可）
 * @param {object} detail - 任意の追加情報（JSON形式）
 */
exports.logAudit = async (userId, action, entity, entityId = null, detail = {}) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity, entity_id, detail) VALUES ($1, $2, $3, $4, $5)',
      [userId, action, entity, entityId, detail]
    );
  } catch (err) {
    console.error('監査ログ記録エラー:', err);
  }
};
