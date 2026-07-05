const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { validate } = require('../middleware/validate');
const ChatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Chat rate limit exceeded. Please wait.' },
});

const chatValidation = [
  body('message').notEmpty().withMessage('Message is required').isLength({ max: 5000 }),
  body('code').optional().isString(),
  body('language').optional().isString(),
  body('uiLanguage').optional().isString().isLength({ max: 10 }),
  body('mode').optional().isIn(['chat','explain','testcases','optimize','complexity','bugpredict','interview']),
  body('history').optional().isArray(),
];

module.exports = (router) => {
  router.get('/languages', authenticate, ChatController.getLanguages);
  router.post('/message', authenticate, chatLimiter, chatValidation, validate, ChatController.sendMessage);
};
