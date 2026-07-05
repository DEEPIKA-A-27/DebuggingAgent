const { generateJSON } = require('../config/gemini');
const DebugHistory = require('../models/DebugHistory');
const ApiError = require('../utils/ApiError');
const {
  SUPPORTED_LANGUAGES,
  buildDebugPrompt,
  validateAnalysisResponse,
  parseGeminiResponse,
} = require('../utils/promptBuilder');

/**
 * Calculate an analysis score from 0–100 based on bug count and severity
 */
function calculateScore(analysis) {
  let score = 100;
  const allBugs = [...(analysis.syntaxErrors || []), ...(analysis.logicalErrors || [])];
  allBugs.forEach((bug) => {
    if (bug.severity === 'critical') score -= 15;
    else if (bug.severity === 'warning') score -= 8;
    else score -= 5;
  });
  return Math.max(0, Math.min(100, score));
}

/**
 * AI Debugging Agent — orchestrates the full 20-step analysis workflow
 */
const DebugAgentService = {
  SUPPORTED_LANGUAGES,

  async analyze({ code, language, userId, saveHistory = true }) {
    // Validate input
    if (!code || !code.trim()) throw new ApiError(400, 'Code is required');
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      throw new ApiError(400, `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`);
    }
    if (code.length > 50000) throw new ApiError(400, 'Code exceeds maximum length of 50,000 characters');

    // Build comprehensive prompt
    const prompt = buildDebugPrompt(language, code);

    // Call Gemini with automatic model fallback
    let analysis;
    try {
      const result = await generateJSON(prompt);
      const responseText = result.response.text();
      const rawData = parseGeminiResponse(responseText);
      analysis = validateAnalysisResponse(rawData);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.message && error.message.startsWith('QUOTA_EXCEEDED')) {
        const wait = error.message.split(':')[1] || '60';
        throw new ApiError(429, `Daily AI quota exceeded. Please try again in ${wait} seconds or tomorrow.`);
      }
      console.error('Gemini API error:', error.message);
      throw new ApiError(502, 'AI analysis failed. Please try again.');
    }

    const analysisScore = calculateScore(analysis);

    // Save to MySQL
    let historyId = null;
    if (saveHistory && userId) {
      historyId = await DebugHistory.create({
        userId, language, originalCode: code,
        syntaxErrors: analysis.syntaxErrors,
        logicalErrors: analysis.logicalErrors,
        bugRootCauses: analysis.bugRootCauses,
        correctedCode: analysis.correctedCode,
        optimizedCode: analysis.optimizedCode,
        optimizationExplanation: analysis.optimizationExplanation,
        timeComplexity: analysis.timeComplexity,
        optimizedTimeComplexity: analysis.optimizedTimeComplexity,
        spaceComplexity: analysis.spaceComplexity,
        optimizedSpaceComplexity: analysis.optimizedSpaceComplexity,
        worstCase: analysis.worstCase,
        averageCase: analysis.averageCase,
        bestCase: analysis.bestCase,
        complexityExplanation: analysis.complexityExplanation,
        generatedTestCases: analysis.testCases,
        boundaryTestCases: analysis.boundaryTestCases,
        edgeTestCases: analysis.edgeTestCases,
        largeInputTestCases: analysis.largeInputTestCases,
        expectedOutputs: analysis.expectedOutputs,
        lineExplanations: analysis.lineExplanations,
        securityIssues: analysis.securityIssues,
        performanceIssues: analysis.performanceIssues,
        bestPractices: analysis.bestPractices,
        learningTopics: analysis.learningTopics,
        recommendedDataStructures: analysis.recommendedDataStructures,
        recommendedAlgorithms: analysis.recommendedAlgorithms,
        programmingTopics: analysis.programmingTopics,
        interviewQuestions: analysis.interviewQuestions,
        documentation: analysis.documentation,
        analysisScore,
      });
    }

    return {
      historyId,
      originalCode: code,
      language,
      analysisScore,
      ...analysis,
    };
  },
};

module.exports = DebugAgentService;
