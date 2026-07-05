const DebugAgentService = require('../services/debugAgentService');
const AuthService = require('../services/authService');
const { generatePDFReport } = require('../utils/pdfGenerator');
const { generateJSON, generateText } = require('../config/gemini');
const { buildTranslationPrompt, buildFlowchartPrompt, parseGeminiResponse } = require('../utils/promptBuilder');

const DebugController = {
  /**
   * POST /api/debug/analyze - Run AI debugging agent
   */
  async analyze(req, res, next) {
    try {
      const { code, language, saveHistory = true } = req.body;
      const result = await DebugAgentService.analyze({ code, language, userId: req.user.id, saveHistory });
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/debug/languages - Get supported languages
   */
  getLanguages(req, res) {
    res.json({ success: true, data: DebugAgentService.SUPPORTED_LANGUAGES });
  },

  /**
   * POST /api/debug/pdf - Generate PDF report
   */
  async generatePDF(req, res, next) {
    try {
      const { analysis, language, originalCode } = req.body;
      const user = await AuthService.getProfile(req.user.id);
      const pdfBuffer = await generatePDFReport({
        userName: user.name,
        analysis,
        language,
        originalCode,
        date: new Date().toLocaleString(),
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=debug-report.pdf');
      res.send(pdfBuffer);
    } catch (error) { next(error); }
  },

  /**
   * POST /api/debug/translate - Translate code to another language
   */
  async translate(req, res, next) {
    try {
      const { code, sourceLanguage, targetLanguage } = req.body;
      if (!code || !sourceLanguage || !targetLanguage) {
        return res.status(400).json({ success: false, message: 'code, sourceLanguage, and targetLanguage are required' });
      }
      const prompt = buildTranslationPrompt(sourceLanguage, targetLanguage, code);
      const result = await generateJSON(prompt);
      const data = parseGeminiResponse(result.response.text());
      res.json({ success: true, data });
    } catch (error) { next(error); }
  },

  /**
   * POST /api/debug/flowchart - Generate flowchart from code
   */
  async flowchart(req, res, next) {
    try {
      const { code, language } = req.body;
      if (!code || !language) {
        return res.status(400).json({ success: false, message: 'code and language are required' });
      }
      const prompt = buildFlowchartPrompt(language, code);
      const result = await generateJSON(prompt);
      const data = parseGeminiResponse(result.response.text());
      res.json({ success: true, data });
    } catch (error) { next(error); }
  },
};

module.exports = DebugController;
