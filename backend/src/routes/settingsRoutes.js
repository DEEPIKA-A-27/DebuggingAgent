const { authenticate } = require('../middleware/auth');
const SettingsController = require('../controllers/settingsController');

module.exports = (router) => {
  router.get('/', authenticate, SettingsController.get);
  router.put('/', authenticate, SettingsController.update);
};
