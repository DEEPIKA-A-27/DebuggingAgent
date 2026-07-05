const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Validate request using express-validator rules
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join(', ');
    return next(new ApiError(400, messages));
  }
  next();
}

module.exports = { validate };
