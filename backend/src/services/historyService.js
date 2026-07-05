const DebugHistory = require('../models/DebugHistory');
const ApiError = require('../utils/ApiError');

const HistoryService = {
  async save(userId, data) {
    const historyId = await DebugHistory.create({
      userId, language: data.language, originalCode: data.originalCode,
      syntaxErrors: data.syntaxErrors, logicalErrors: data.logicalErrors,
      bugRootCauses: data.bugRootCauses,
      correctedCode: data.correctedCode, optimizedCode: data.optimizedCode,
      optimizationExplanation: data.optimizationExplanation,
      timeComplexity: data.timeComplexity, optimizedTimeComplexity: data.optimizedTimeComplexity,
      spaceComplexity: data.spaceComplexity, optimizedSpaceComplexity: data.optimizedSpaceComplexity,
      worstCase: data.worstCase, averageCase: data.averageCase, bestCase: data.bestCase,
      complexityExplanation: data.complexityExplanation,
      generatedTestCases: data.testCases, boundaryTestCases: data.boundaryTestCases,
      edgeTestCases: data.edgeTestCases, largeInputTestCases: data.largeInputTestCases,
      expectedOutputs: data.expectedOutputs, lineExplanations: data.lineExplanations,
      securityIssues: data.securityIssues, performanceIssues: data.performanceIssues,
      bestPractices: data.bestPractices, learningTopics: data.learningTopics,
      recommendedDataStructures: data.recommendedDataStructures,
      recommendedAlgorithms: data.recommendedAlgorithms,
      programmingTopics: data.programmingTopics, interviewQuestions: data.interviewQuestions,
      documentation: data.documentation, analysisScore: data.analysisScore,
    });
    return { id: historyId, message: 'Analysis saved successfully' };
  },

  async getAll(userId, search, language, sortBy, sortOrder) {
    const rows = await DebugHistory.findByUserId(userId, search, language, sortBy, sortOrder);
    return rows.map((row) => {
      const code = row.original_code || '';
      return {
        id: row.id,
        language: row.language,
        originalCode: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
        timeComplexity: row.time_complexity,
        spaceComplexity: row.space_complexity,
        analysisScore: row.analysis_score ?? 100,
        bugCount: row.bug_count ?? 0,
        createdAt: row.created_at,
      };
    });
  },

  async getById(id, userId) {
    const row = await DebugHistory.findById(id, userId);
    if (!row) throw new ApiError(404, 'History record not found');
    return DebugHistory.parseRow(row);
  },

  async delete(id, userId) {
    const deleted = await DebugHistory.delete(id, userId);
    if (!deleted) throw new ApiError(404, 'History record not found');
    return { message: 'History deleted successfully' };
  },

  async getStats(userId) {
    return DebugHistory.getStats(userId);
  },
};

module.exports = HistoryService;
