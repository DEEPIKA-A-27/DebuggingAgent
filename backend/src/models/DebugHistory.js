const { pool } = require('../config/database');

const JSON_FIELDS = [
  'syntax_errors', 'logical_errors', 'bug_root_causes',
  'generated_test_cases', 'boundary_test_cases', 'edge_test_cases', 'large_input_test_cases',
  'expected_outputs', 'line_explanations', 'security_issues', 'performance_issues',
  'best_practices', 'learning_topics', 'recommended_data_structures',
  'recommended_algorithms', 'programming_topics', 'interview_questions', 'documentation',
];

const DebugHistory = {
  /**
   * Save a debug analysis session
   */
  async create(data) {
    const {
      userId, language, originalCode,
      syntaxErrors, logicalErrors, bugRootCauses,
      correctedCode, optimizedCode, optimizationExplanation,
      timeComplexity, optimizedTimeComplexity,
      spaceComplexity, optimizedSpaceComplexity,
      worstCase, averageCase, bestCase, complexityExplanation,
      generatedTestCases, boundaryTestCases, edgeTestCases, largeInputTestCases,
      expectedOutputs, lineExplanations, securityIssues, performanceIssues,
      bestPractices, learningTopics,
      recommendedDataStructures, recommendedAlgorithms, programmingTopics, interviewQuestions,
      documentation, analysisScore,
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO debug_history (
        user_id, language, original_code,
        syntax_errors, logical_errors, bug_root_causes,
        corrected_code, optimized_code, optimization_explanation,
        time_complexity, optimized_time_complexity,
        space_complexity, optimized_space_complexity,
        worst_case, average_case, best_case, complexity_explanation,
        generated_test_cases, boundary_test_cases, edge_test_cases, large_input_test_cases,
        expected_outputs, line_explanations, security_issues, performance_issues,
        best_practices, learning_topics,
        recommended_data_structures, recommended_algorithms, programming_topics, interview_questions,
        documentation, analysis_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, language, originalCode,
        JSON.stringify(syntaxErrors || []),
        JSON.stringify(logicalErrors || []),
        JSON.stringify(bugRootCauses || []),
        correctedCode || '', optimizedCode || '', optimizationExplanation || '',
        timeComplexity || '', optimizedTimeComplexity || '',
        spaceComplexity || '', optimizedSpaceComplexity || '',
        worstCase || '', averageCase || '', bestCase || '', complexityExplanation || '',
        JSON.stringify(generatedTestCases || []),
        JSON.stringify(boundaryTestCases || []),
        JSON.stringify(edgeTestCases || []),
        JSON.stringify(largeInputTestCases || []),
        JSON.stringify(expectedOutputs || []),
        JSON.stringify(lineExplanations || []),
        JSON.stringify(securityIssues || []),
        JSON.stringify(performanceIssues || []),
        JSON.stringify(bestPractices || []),
        JSON.stringify(learningTopics || []),
        JSON.stringify(recommendedDataStructures || []),
        JSON.stringify(recommendedAlgorithms || []),
        JSON.stringify(programmingTopics || []),
        JSON.stringify(interviewQuestions || []),
        JSON.stringify(documentation || null),
        analysisScore ?? 100,
      ]
    );

    return result.insertId;
  },

  /**
   * Get all history for a user with optional search, filter, and sort
   */
  async findByUserId(userId, search = '', language = '', sortBy = 'created_at', sortOrder = 'DESC') {
    const allowed = ['created_at', 'language', 'analysis_score'];
    const col = allowed.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    let query = `
      SELECT id, language, original_code, time_complexity, space_complexity,
             analysis_score, created_at,
             JSON_LENGTH(syntax_errors) + JSON_LENGTH(logical_errors) as bug_count
      FROM debug_history
      WHERE user_id = ?
    `;
    const params = [userId];

    if (search) {
      query += ' AND (language LIKE ? OR original_code LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s);
    }

    if (language) {
      query += ' AND language = ?';
      params.push(language);
    }

    query += ` ORDER BY ${col} ${order}`;

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  /**
   * Get single history record by ID (must belong to user)
   */
  async findById(id, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM debug_history WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0] || null;
  },

  /**
   * Delete history record
   */
  async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM debug_history WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Get enhanced dashboard statistics for a user
   */
  async getStats(userId) {
    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) as total FROM debug_history WHERE user_id = ?', [userId]
    );

    const [[{ optimizations }]] = await pool.execute(
      `SELECT COUNT(*) as optimizations FROM debug_history
       WHERE user_id = ? AND optimized_code IS NOT NULL AND optimized_code != ''`, [userId]
    );

    // Total bugs fixed (sum of syntax + logical errors)
    const [bugRows] = await pool.execute(
      'SELECT syntax_errors, logical_errors FROM debug_history WHERE user_id = ?', [userId]
    );
    let totalBugs = 0;
    let criticalBugs = 0;
    let totalTestCases = 0;

    bugRows.forEach((row) => {
      try {
        const se = JSON.parse(row.syntax_errors || '[]');
        const le = JSON.parse(row.logical_errors || '[]');
        totalBugs += (Array.isArray(se) ? se.length : 0) + (Array.isArray(le) ? le.length : 0);
        criticalBugs += [...(se || []), ...(le || [])].filter(e => e.severity === 'critical').length;
      } catch { /* skip */ }
    });

    // Test cases count
    const [tcRows] = await pool.execute(
      'SELECT generated_test_cases FROM debug_history WHERE user_id = ?', [userId]
    );
    tcRows.forEach((row) => {
      try {
        const cases = JSON.parse(row.generated_test_cases || '[]');
        totalTestCases += Array.isArray(cases) ? cases.length : 0;
      } catch { /* skip */ }
    });

    // Language usage breakdown
    const [langRows] = await pool.execute(
      'SELECT language, COUNT(*) as count FROM debug_history WHERE user_id = ? GROUP BY language ORDER BY count DESC',
      [userId]
    );

    // Recent activity (last 5)
    const [recentRows] = await pool.execute(
      `SELECT id, language, analysis_score, created_at FROM debug_history
       WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`, [userId]
    );

    // Today's analyses
    const [[{ todayCount }]] = await pool.execute(
      `SELECT COUNT(*) as todayCount FROM debug_history
       WHERE user_id = ? AND DATE(created_at) = CURDATE()`, [userId]
    );

    // This month
    const [[{ monthCount }]] = await pool.execute(
      `SELECT COUNT(*) as monthCount FROM debug_history
       WHERE user_id = ? AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`,
      [userId]
    );

    // Average score
    const [[{ avgScore }]] = await pool.execute(
      'SELECT AVG(analysis_score) as avgScore FROM debug_history WHERE user_id = ?', [userId]
    );

    return {
      totalSessions: total,
      totalOptimizations: optimizations,
      totalTestCases,
      totalBugs,
      criticalBugs,
      languageBreakdown: langRows,
      recentActivity: recentRows,
      todayCount,
      monthCount,
      avgScore: avgScore ? Math.round(avgScore) : 100,
    };
  },

  /**
   * Parse JSON fields from database row
   */
  parseRow(row) {
    if (!row) return null;
    const parsed = { ...row };
    JSON_FIELDS.forEach((field) => {
      if (parsed[field]) {
        try { parsed[field] = JSON.parse(parsed[field]); }
        catch { parsed[field] = []; }
      } else {
        parsed[field] = [];
      }
    });
    // documentation is object not array
    if (parsed.documentation && typeof parsed.documentation === 'string') {
      try { parsed.documentation = JSON.parse(parsed.documentation); } catch { parsed.documentation = null; }
    }
    return parsed;
  },
};

module.exports = DebugHistory;
