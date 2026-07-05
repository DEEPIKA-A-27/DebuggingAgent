const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { validate } = require('../middleware/validate');
const DebugController = require('../controllers/debugController');
const { authenticate } = require('../middleware/auth');

const analyzeValidation = [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').notEmpty().withMessage('Language is required'),
];

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Analysis rate limit exceeded. Please wait.' },
});

module.exports = (router) => {
  router.get('/languages', DebugController.getLanguages);
  router.post('/analyze', authenticate, analyzeLimiter, analyzeValidation, validate, DebugController.analyze);
  router.post('/pdf', authenticate, DebugController.generatePDF);
  router.post('/translate', authenticate, analyzeLimiter, DebugController.translate);
  router.post('/flowchart', authenticate, analyzeLimiter, DebugController.flowchart);
};
