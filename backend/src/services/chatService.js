const { chatWithFallback, generateText } = require('../config/gemini');
const ApiError = require('../utils/ApiError');

/* ─── Supported UI languages ────────────────────────────────── */
const UI_LANGUAGES = {
  en:    'English',
  ta:    'Tamil',
  hi:    'Hindi',
  fr:    'French',
  es:    'Spanish',
  de:    'German',
  zh:    'Chinese (Simplified)',
  ar:    'Arabic',
  pt:    'Portuguese',
  ja:    'Japanese',
};

/* ─── Mode-specific prompt builders ────────────────────────── */
const MODE_PROMPTS = {

  /**
   * EXPLAIN — beginner-friendly line-by-line walkthrough
   */
  explain: (code, codeLang, uiLang) =>
    `You are a friendly programming teacher. Explain the following ${codeLang} code to a complete beginner.
Respond entirely in ${UI_LANGUAGES[uiLang] || 'English'}.

Structure your response as:
1. **What this code does** (1-2 sentences overview)
2. **Step-by-step explanation** (explain each important part simply)
3. **Key concepts used** (list the programming concepts a beginner should learn)
4. **Analogy** (give a real-world analogy to make it relatable)

Keep language simple. No jargon without explanation.

\`\`\`${codeLang.toLowerCase()}
${code}
\`\`\``,

  /**
   * TEST CASES — inputs, expected outputs, edge cases
   */
  testcases: (code, codeLang, uiLang) =>
    `You are a software testing expert. Generate comprehensive test cases for the following ${codeLang} code.
Respond entirely in ${UI_LANGUAGES[uiLang] || 'English'}.

Provide:
1. **Normal Test Cases** (3-5 typical inputs and expected outputs)
2. **Edge Cases** (empty input, zero, null, single element, etc.)
3. **Boundary Cases** (min/max values, limits)
4. **Large Input Cases** (performance stress test examples)

Format each test case as:
- Input: [value]
- Expected Output: [value]
- Reason: [why this case matters]

\`\`\`${codeLang.toLowerCase()}
${code}
\`\`\``,

  /**
   * OPTIMIZE — performance improvements with explanation
   */
  optimize: (code, codeLang, uiLang) =>
    `You are a performance optimization expert. Analyze and optimize the following ${codeLang} code.
Respond entirely in ${UI_LANGUAGES[uiLang] || 'English'}.

Provide:
1. **Current Issues** (what's inefficient and why)
2. **Optimized Code** (the improved version in a code block)
3. **What Changed** (bullet list of every change made)
4. **Performance Gain** (how much faster/leaner and why)
5. **Best Practices Applied** (coding standards used)

\`\`\`${codeLang.toLowerCase()}
${code}
\`\`\``,

  /**
   * COMPLEXITY — Big-O with visual breakdown
   */
  complexity: (code, codeLang, uiLang) =>
    `You are an algorithms expert. Analyze the time and space complexity of the following ${codeLang} code.
Respond entirely in ${UI_LANGUAGES[uiLang] || 'English'}.

Provide:
1. **Time Complexity**
   - Best Case: O(?) — explain why
   - Average Case: O(?) — explain why
   - Worst Case: O(?) — explain why
2. **Space Complexity**: O(?) — explain why
3. **Optimized Complexity** (if a better algorithm exists, show it)
4. **Line-by-Line Breakdown** (which lines contribute to complexity)
5. **Beginner Explanation** (explain Big-O in simple terms with an analogy)

\`\`\`${codeLang.toLowerCase()}
${code}
\`\`\``,

  /**
   * BUG PREDICT — runtime issues, crashes, logical problems
   */
  bugpredict: (code, codeLang, uiLang) =>
    `You are a code safety expert. Predict potential runtime bugs and issues in the following ${codeLang} code.
Respond entirely in ${UI_LANGUAGES[uiLang] || 'English'}.

For each issue found, provide:
- **Severity**: 🔴 Critical / 🟡 Warning / 🔵 Suggestion
- **Issue**: What could go wrong
- **When it happens**: The exact condition that triggers it
- **Line**: Which line(s) are affected
- **Fix**: How to prevent it (with a code snippet if helpful)

Also provide:
- **Risk Score**: Overall risk rating (Low / Medium / High / Critical)
- **Safe Version**: A corrected version of the entire code

\`\`\`${codeLang.toLowerCase()}
${code}
\`\`\``,

  /**
   * INTERVIEW — coding interview questions based on the code
   */
  interview: (code, codeLang, uiLang) =>
    `You are a senior software engineer conducting a coding interview. Generate interview questions based on the following ${codeLang} code.
Respond entirely in ${UI_LANGUAGES[uiLang] || 'English'}.

Generate 8-10 questions across these categories:

**Conceptual Questions** (2-3 questions about the concepts used)
**Code Walkthrough** (2-3 questions asking the candidate to explain the code)
**Bug & Edge Case** (2 questions about potential issues)
**Optimization** (1-2 questions asking how to improve it)
**Follow-up Challenges** (1-2 harder extension questions)

For each question also provide:
- Difficulty: Easy / Medium / Hard
- Expected Answer: (brief ideal answer)

\`\`\`${codeLang.toLowerCase()}
${code}
\`\`\``,

  /**
   * CHAT — general conversation with code context
   */
  chat: (code, codeLang, uiLang) => {
    let ctx =
      `You are an expert AI debugging assistant and programming tutor. ` +
      `Help developers understand code, debug errors, explain algorithms, and suggest improvements. ` +
      `Be concise, clear, and beginner-friendly. ` +
      `Format code snippets using markdown code blocks. ` +
      `Respond entirely in ${UI_LANGUAGES[uiLang] || 'English'}.`;
    if (code && code.trim()) {
      ctx += `\n\nThe user has the following ${codeLang} code open:\n\`\`\`${codeLang.toLowerCase()}\n${code.trim()}\n\`\`\`\nAnswer questions about this code when relevant.`;
    }
    return ctx;
  },
};

/* ─── Gemini history formatter ──────────────────────────────── */
function buildGeminiHistory(history = []) {
  const mapped = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: String(msg.content || '') }],
  }));
  // Gemini requires history to start with 'user'
  while (mapped.length > 0 && mapped[0].role !== 'user') mapped.shift();
  return mapped;
}

/* ─── Main service ──────────────────────────────────────────── */
const ChatService = {
  UI_LANGUAGES,

  /**
   * Send a message to the AI.
   *
   * @param {object} params
   * @param {string} params.message    - User's message text
   * @param {string} params.code       - Current editor code
   * @param {string} params.language   - Programming language
   * @param {string} params.uiLanguage - Response language code (en, ta, hi …)
   * @param {string} params.mode       - Feature mode: chat|explain|testcases|optimize|complexity|bugpredict|interview
   * @param {Array}  params.history    - Previous conversation turns
   */
  async sendMessage({ message, code, language, uiLanguage = 'en', mode = 'chat', history = [] }) {
    if (!message || !message.trim()) throw new ApiError(400, 'Message is required');

    const codeLang = language || 'JavaScript';
    const recentHistory = history.slice(-18);

    try {
      const geminiHistory = buildGeminiHistory(recentHistory);
      const isFirstMessage = geminiHistory.length === 0;

      // ── Structured mode (explain / testcases / optimize / complexity / bugpredict / interview)
      if (mode !== 'chat' && code && code.trim()) {
        const promptFn = MODE_PROMPTS[mode] || MODE_PROMPTS.chat;
        let fullMessage = promptFn(code.trim(), codeLang, uiLanguage);
        if (message.trim() && message.trim() !== getModeDefaultMessage(mode)) {
          fullMessage += `\n\nAdditional instruction: ${message.trim()}`;
        }
        // One-shot — use generateText with fallback
        const result = await generateText(fullMessage);
        return { role: 'assistant', content: result.response.text(), mode };
      }

      // ── Regular chat mode with conversation history
      const systemCtx = isFirstMessage
        ? MODE_PROMPTS.chat(code, codeLang, uiLanguage) + '\n\n---\n\nUser: ' + message.trim()
        : message.trim();

      const result = await chatWithFallback(
        isFirstMessage ? [] : geminiHistory,
        systemCtx
      );
      return { role: 'assistant', content: result.response.text(), mode: 'chat' };

    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.message && error.message.startsWith('QUOTA_EXCEEDED')) {
        const wait = error.message.split(':')[1] || '60';
        throw new ApiError(429, `Daily AI quota exceeded. Please try again in ${wait} seconds or tomorrow.`);
      }
      console.error('Chat AI error:', error.message);
      throw new ApiError(502, 'AI chat failed. Please try again.');
    }
  },
};

function getModeDefaultMessage(mode) {
  const defaults = {
    explain:    'Explain this code like I\'m a beginner.',
    testcases:  'Generate test cases for this code.',
    optimize:   'Optimize this code.',
    complexity: 'Analyze the complexity of this code.',
    bugpredict: 'Predict bugs in this code.',
    interview:  'Generate interview questions for this code.',
  };
  return defaults[mode] || '';
}

module.exports = ChatService;
