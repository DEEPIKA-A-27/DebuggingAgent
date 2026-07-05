const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 12;

const AuthService = {
  /**
   * Register a new user with hashed password
   */
  async register({ name, email, password, phone, role, collegeCompany, experienceLevel, preferredLanguage, bio, githubUrl }) {
    const exists = await User.emailExists(email);
    if (exists) throw new ApiError(409, 'Email already registered');

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name, email, password: hashedPassword,
      phone, role, collegeCompany, experienceLevel, preferredLanguage, bio, githubUrl,
    });
    const token = generateToken(user);
    return { user: { id: user.id, name: user.name, email: user.email }, token };
  },

  /**
   * Authenticate user and return JWT
   */
  async login({ email, password }) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user);
    return {
      user: { id: user.id, name: user.name, email: user.email },
      token,
    };
  },

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  },

  async updateProfile(userId, data) {
    const user = await User.updateProfile(userId, {
      phone:             data.phone,
      role:              data.role,
      collegeCompany:    data.college_company,
      experienceLevel:   data.experience_level,
      preferredLanguage: data.preferred_language,
      bio:               data.bio,
      githubUrl:         data.github_url,
    });
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  },
};

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = AuthService;
