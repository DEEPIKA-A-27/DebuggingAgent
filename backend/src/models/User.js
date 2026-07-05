const { pool } = require('../config/database');

const User = {
  async create({ name, email, password, phone, role, collegeCompany, experienceLevel, preferredLanguage, bio, githubUrl }) {
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, phone, role, college_company,
        experience_level, preferred_language, bio, github_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password,
        phone || null, role || null, collegeCompany || null,
        experienceLevel || null, preferredLanguage || 'Python',
        bio || null, githubUrl || null]
    );
    return { id: result.insertId, name, email };
  },

  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, password, phone, role, college_company, experience_level, preferred_language, bio, github_url, created_at FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, college_company, experience_level, preferred_language, bio, github_url, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async emailExists(email) {
    const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    return rows.length > 0;
  },

  async updateProfile(id, { phone, role, collegeCompany, experienceLevel, preferredLanguage, bio, githubUrl }) {
    await pool.execute(
      `UPDATE users SET phone=?, role=?, college_company=?, experience_level=?,
        preferred_language=?, bio=?, github_url=? WHERE id=?`,
      [phone || null, role || null, collegeCompany || null, experienceLevel || null,
        preferredLanguage || null, bio || null, githubUrl || null, id]
    );
    return this.findById(id);
  },
};

module.exports = User;
