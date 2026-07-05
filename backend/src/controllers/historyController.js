const HistoryService = require('../services/historyService');

const HistoryController = {
  /**
   * POST /api/history/save
   */
  async save(req, res, next) {
    try {
      const result = await HistoryService.save(req.user.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/history
   */
  async getAll(req, res, next) {
    try {
      const { search = '', language = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
      const history = await HistoryService.getAll(req.user.id, search, language, sortBy, sortOrder);
      res.json({ success: true, data: history });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/history/stats - Dashboard statistics
   */
  async getStats(req, res, next) {
    try {
      const stats = await HistoryService.getStats(req.user.id);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/history/:id
   */
  async getById(req, res, next) {
    try {
      const record = await HistoryService.getById(req.params.id, req.user.id);
      res.json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/history/:id
   */
  async delete(req, res, next) {
    try {
      const result = await HistoryService.delete(req.params.id, req.user.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = HistoryController;
