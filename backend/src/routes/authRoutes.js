const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = (router) => {
  router.post('/register', registerValidation, validate, AuthController.register);
  router.post('/login', loginValidation, validate, AuthController.login);
  router.get('/profile', authenticate, AuthController.getProfile);
  router.put('/profile', authenticate, AuthController.updateProfile);
};
