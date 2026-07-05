const ChatService = require('../services/chatService');

const ChatController = {
  /**
   * POST /api/chat/message
   * Body: { message, code?, language?, uiLanguage?, mode?, history? }
   */
  async sendMessage(req, res, next) {
    try {
      const { message, code, language, uiLanguage, mode, history } = req.body;
      const response = await ChatService.sendMessage({
        message,
        code,
        language,
        uiLanguage: uiLanguage || 'en',
        mode:       mode       || 'chat',
        history,
      });
      res.json({ success: true, data: response });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/chat/languages — returns supported UI languages
   */
  getLanguages(req, res) {
    res.json({ success: true, data: ChatService.UI_LANGUAGES });
  },
};

module.exports = ChatController;
