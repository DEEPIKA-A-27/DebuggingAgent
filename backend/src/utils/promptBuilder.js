const SUPPORTED_LANGUAGES = [
  'Java', 'Python', 'C++', 'JavaScript', 'C#',
  'TypeScript', 'Go', 'Rust', 'Swift', 'Kotlin',
];

/**
 * Build the AI debugging prompt — optimised for Groq's token limits.
 * Returns strict JSON only.
 */
function buildDebugPrompt(language, code) {
  return `You are an expert ${language} code analyzer. Analyze the code below and return ONLY a valid JSON object.

IMPORTANT: Keep all string values concise. Do not exceed response limits.

Return this exact JSON structure:
{
  "syntaxErrors": [{"line": 1, "message": "string", "explanation": "string", "severity": "critical|warning|suggestion"}],
  "logicalErrors": [{"line": 1, "message": "string", "explanation": "string", "severity": "critical|warning|suggestion"}],
  "bugRootCauses": [{"problem": "string", "rootCause": "string", "impact": "string", "solution": "string", "confidenceScore": 85}],
  "correctedCode": "string",
  "optimizedCode": "string",
  "optimizationExplanation": "string",
  "timeComplexity": "O(n)",
  "optimizedTimeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "optimizedSpaceComplexity": "O(1)",
  "worstCase": "string",
  "averageCase": "string",
  "bestCase": "string",
  "complexityExplanation": "string",
  "testCases": [{"input": "string", "description": "string"}],
  "boundaryTestCases": [{"input": "string", "description": "string"}],
  "edgeTestCases": [{"input": "string", "description": "string"}],
  "largeInputTestCases": [{"input": "string", "description": "string"}],
  "expectedOutputs": ["string"],
  "lineExplanations": [{"line": 1, "code": "string", "explanation": "string"}],
  "securityIssues": [{"type": "string", "severity": "high|medium|low", "description": "string", "solution": "string"}],
  "performanceIssues": [{"issue": "string", "impact": "high|medium|low", "suggestion": "string"}],
  "bestPractices": ["string"],
  "learningTopics": ["string"],
  "recommendedDataStructures": ["string"],
  "recommendedAlgorithms": ["string"],
  "programmingTopics": ["string"],
  "interviewQuestions": ["string"],
  "documentation": {
    "overview": "string",
    "functions": [{"name": "string", "description": "string", "inputs": "string", "outputs": "string", "algorithm": "string"}],
    "limitations": ["string"],
    "advantages": ["string"]
  }
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation outside the JSON
- If no errors found, return empty arrays []
- Keep arrays to max 3-5 items each to stay within token limits
- All string values must be valid JSON (escape special chars)

${language} code to analyze:
\`\`\`
${code.substring(0, 3000)}
\`\`\``;
}

/**
 * Attempt to repair truncated/malformed JSON from AI responses
 */
function repairJSON(text) {
  let cleaned = text.trim();

  // Strip markdown code fences
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) cleaned = fenced[1].trim();

  // If it starts with { try to parse directly
  if (cleaned.startsWith('{')) {
    try { return JSON.parse(cleaned); } catch (_) {}

    // Try to repair truncated JSON by closing open structures
    let repaired = cleaned;

    // Count open braces/brackets
    let braces = 0, brackets = 0;
    let inString = false, escape = false;

    for (const ch of repaired) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') braces++;
      if (ch === '}') braces--;
      if (ch === '[') brackets++;
      if (ch === ']') brackets--;
    }

    // Close any open string
    if (inString) repaired += '"';

    // Remove trailing comma before closing
    repaired = repaired.replace(/,\s*$/, '');

    // Close open arrays and objects
    for (let i = 0; i < brackets; i++) repaired += ']';
    for (let i = 0; i < braces; i++) repaired += '}';

    try { return JSON.parse(repaired); } catch (_) {}
  }

  throw new Error('Could not parse AI response as JSON');
}

/**
 * Parse Gemini/Groq response — handles markdown fences and repairs truncation
 */
function parseGeminiResponse(text) {
  return repairJSON(text);
}

/**
 * Validate and normalize the full AI analysis response with safe defaults
 */
function validateAnalysisResponse(data) {
  if (!data || typeof data !== 'object') return getDefaults();

  const arr = (v) => Array.isArray(v) ? v : [];
  const str = (v, d = '') => (v && typeof v === 'string') ? v : d;

  return {
    syntaxErrors:              arr(data.syntaxErrors),
    logicalErrors:             arr(data.logicalErrors),
    bugRootCauses:             arr(data.bugRootCauses),
    correctedCode:             str(data.correctedCode),
    optimizedCode:             str(data.optimizedCode),
    optimizationExplanation:   str(data.optimizationExplanation),
    timeComplexity:            str(data.timeComplexity, 'Unknown'),
    optimizedTimeComplexity:   str(data.optimizedTimeComplexity, 'Unknown'),
    spaceComplexity:           str(data.spaceComplexity, 'Unknown'),
    optimizedSpaceComplexity:  str(data.optimizedSpaceComplexity, 'Unknown'),
    worstCase:                 str(data.worstCase, 'Unknown'),
    averageCase:               str(data.averageCase, 'Unknown'),
    bestCase:                  str(data.bestCase, 'Unknown'),
    complexityExplanation:     str(data.complexityExplanation),
    testCases:                 arr(data.testCases),
    boundaryTestCases:         arr(data.boundaryTestCases),
    edgeTestCases:             arr(data.edgeTestCases),
    largeInputTestCases:       arr(data.largeInputTestCases),
    expectedOutputs:           arr(data.expectedOutputs),
    lineExplanations:          arr(data.lineExplanations),
    securityIssues:            arr(data.securityIssues),
    performanceIssues:         arr(data.performanceIssues),
    bestPractices:             arr(data.bestPractices),
    learningTopics:            arr(data.learningTopics),
    recommendedDataStructures: arr(data.recommendedDataStructures),
    recommendedAlgorithms:     arr(data.recommendedAlgorithms),
    programmingTopics:         arr(data.programmingTopics),
    interviewQuestions:        arr(data.interviewQuestions),
    documentation:             (data.documentation && typeof data.documentation === 'object') ? data.documentation : null,
  };
}

function getDefaults() {
  return {
    syntaxErrors: [], logicalErrors: [], bugRootCauses: [],
    correctedCode: '', optimizedCode: '', optimizationExplanation: '',
    timeComplexity: 'Unknown', optimizedTimeComplexity: 'Unknown',
    spaceComplexity: 'Unknown', optimizedSpaceComplexity: 'Unknown',
    worstCase: 'Unknown', averageCase: 'Unknown', bestCase: 'Unknown',
    complexityExplanation: '',
    testCases: [], boundaryTestCases: [], edgeTestCases: [], largeInputTestCases: [],
    expectedOutputs: [], lineExplanations: [], securityIssues: [], performanceIssues: [],
    bestPractices: [], learningTopics: [], recommendedDataStructures: [],
    recommendedAlgorithms: [], programmingTopics: [], interviewQuestions: [],
    documentation: null,
  };
}

/**
 * Translation prompt — compact version for token limits
 */
function buildTranslationPrompt(sourceLanguage, targetLanguage, code) {
  const trimmedCode = code.substring(0, 1500);
  return `Translate this ${sourceLanguage} code to ${targetLanguage}. Use idiomatic ${targetLanguage} style. Preserve all logic.
Return ONLY valid JSON: {"translatedCode": "string", "notes": ["string"]}

Code:
\`\`\`
${trimmedCode}
\`\`\``;
}

/**
 * Flowchart prompt — compact version for token limits
 */
function buildFlowchartPrompt(language, code) {
  const trimmedCode = code.substring(0, 1000);
  return `Analyze this ${language} code and return a flowchart as JSON only.
Return: {"title":"string","nodes":[{"id":"n1","type":"start|end|process|decision|io","label":"string"}],"edges":[{"from":"n1","to":"n2","label":"string"}],"description":"string"}

Code:
\`\`\`
${trimmedCode}
\`\`\``;
}

module.exports = {
  SUPPORTED_LANGUAGES,
  buildDebugPrompt,
  buildTranslationPrompt,
  buildFlowchartPrompt,
  validateAnalysisResponse,
  parseGeminiResponse,
};
