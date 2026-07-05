const UserSettings = require('../models/UserSettings');

const SettingsController = {
  async get(req, res, next) {
    try {
      const settings = await UserSettings.findByUserId(req.user.id);
      res.json({
        success: true,
        data: settings || {
          theme: 'light', editor_theme: 'vs-dark',
          font_size: 14, language: 'en', autosave: 1,
        },
      });
    } catch (error) { next(error); }
  },

  async update(req, res, next) {
    try {
      const settings = await UserSettings.upsert(req.user.id, req.body);
      res.json({ success: true, data: settings });
    } catch (error) { next(error); }
  },
};

module.exports = SettingsController;
