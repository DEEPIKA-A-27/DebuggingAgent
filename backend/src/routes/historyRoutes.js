const HistoryController = require('../controllers/historyController');
const { authenticate } = require('../middleware/auth');

module.exports = (router) => {
  router.post('/save', authenticate, HistoryController.save);
  router.get('/stats', authenticate, HistoryController.getStats);
  router.get('/', authenticate, HistoryController.getAll);
  router.get('/:id', authenticate, HistoryController.getById);
  router.delete('/:id', authenticate, HistoryController.delete);
};
