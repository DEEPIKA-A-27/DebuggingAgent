const AuthService = require('../services/authService');

const AuthController = {
  async register(req, res, next) {
    try {
      const { name, email, password, phone, role, collegeCompany, experienceLevel, preferredLanguage, bio, githubUrl } = req.body;
      const result = await AuthService.register({ name, email, password, phone, role, collegeCompany, experienceLevel, preferredLanguage, bio, githubUrl });
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  },

  async updateProfile(req, res, next) {
    try {
      const user = await AuthService.updateProfile(req.user.id, req.body);
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  },
};

module.exports = AuthController;
