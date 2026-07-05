const { pool } = require('../config/database');

const UserSettings = {
  async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM user_settings WHERE user_id = ?', [userId]
    );
    return rows[0] || null;
  },

  async upsert(userId, settings) {
    const { theme, editorTheme, fontSize, language, autosave } = settings;
    await pool.execute(
      `INSERT INTO user_settings (user_id, theme, editor_theme, font_size, language, autosave)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         theme = VALUES(theme),
         editor_theme = VALUES(editor_theme),
         font_size = VALUES(font_size),
         language = VALUES(language),
         autosave = VALUES(autosave),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, theme || 'light', editorTheme || 'vs-dark', fontSize || 14, language || 'en', autosave ?? 1]
    );
    return this.findByUserId(userId);
  },
};

module.exports = UserSettings;
