/**
 * AI Provider Configuration
 * Supports Groq (primary) with Gemini as fallback
 * All functions return { response: { text() } } for compatibility
 */

const Groq = require('groq-sdk');

let groqClient = null;

// Only models confirmed working on this account
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',   // Best quality, 128k context
  'llama-3.1-8b-instant',      // Fast fallback, 128k context
];

/* ── Client ─────────────────────────────────────────────────── */
function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not configured. Get a free key at https://console.groq.com/keys');
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

/* ── Response wrapper — matches Gemini interface ────────────── */
function wrapResponse(text) {
  return { response: { text: () => text } };
}

/* ── Error helpers ───────────────────────────────────────────── */
function getStatusCode(err) {
  if (err.status) return err.status;
  const m = String(err.message || '').match(/(\d{3})/);
  return m ? parseInt(m[1]) : 0;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* ── Core call with model fallback ───────────────────────────── */
async function callGroq(messages, opts = {}) {
  const client = getGroqClient();
  let lastError;

  for (const model of GROQ_MODELS) {
    try {
      const resp = await client.chat.completions.create({
        model,
        messages,
        temperature:  opts.temperature  ?? 0.7,
        max_tokens:   opts.maxTokens    ?? 4096,
        response_format: opts.jsonMode
          ? { type: 'json_object' }
          : { type: 'text' },
      });

      const text = resp.choices[0]?.message?.content || '';
      console.log(`[Groq] response from: ${model} (${text.length} chars)`);
      return wrapResponse(text);

    } catch (err) {
      lastError = err;
      const status = getStatusCode(err);

      if (status === 429 || status === 413) {
        const retryHeader = err.headers?.['retry-after'];
        const wait = retryHeader ? parseInt(retryHeader) * 1000 : 1000;
        console.warn(`[Groq] ${model} limit hit (${status}), trying next model...`);
        await sleep(Math.min(wait, 3000));
        continue;
      }

      if (status === 503 || status === 500) {
        console.warn(`[Groq] ${model} unavailable (${status}), trying next...`);
        continue;
      }

      // 400 with decommissioned — skip
      if (status === 400 && err.message && err.message.includes('decommissioned')) {
        console.warn(`[Groq] ${model} decommissioned, trying next...`);
        continue;
      }

      throw err; // 400, 401, etc — non-retryable
    }
  }

  const status = getStatusCode(lastError);
  if (status === 429) {
    throw new Error('QUOTA_EXCEEDED:60');
  }
  throw lastError || new Error('All Groq models unavailable');
}

/* ── Public API (same interface as before) ───────────────────── */

/**
 * Generate a JSON response — for debug analysis, translation, flowchart
 */
async function generateJSON(prompt) {
  return callGroq(
    [
      { role: 'system', content: 'Respond with valid JSON only. No markdown, no text outside the JSON object.' },
      { role: 'user',   content: prompt },
    ],
    { temperature: 0.2, maxTokens: 4096, jsonMode: true }
  );
}

/**
 * Generate a plain text response — for chat, explanations
 */
async function generateText(prompt) {
  return callGroq(
    [
      { role: 'system', content: 'You are an expert AI debugging assistant and programming tutor.' },
      { role: 'user',   content: prompt },
    ],
    { temperature: 0.7, maxTokens: 4096 }
  );
}

/**
 * Multi-turn chat with history
 * history: [{ role: 'user'|'model', parts: [{ text }] }]  ← Gemini format, converted here
 */
async function chatWithFallback(history = [], message) {
  // Convert Gemini history format → OpenAI/Groq format
  const messages = [
    { role: 'system', content: 'You are an expert AI debugging assistant and programming tutor. Be concise, clear, and beginner-friendly. Format code using markdown code blocks.' },
    ...history.map(h => ({
      role:    h.role === 'model' ? 'assistant' : 'user',
      content: h.parts?.[0]?.text || h.content || '',
    })),
    { role: 'user', content: message },
  ];

  return callGroq(messages, { temperature: 0.7, maxTokens: 4096 });
}

/* ── Legacy Gemini compat stubs (kept so no other file breaks) ── */
function getGeminiClient() { throw new Error('Groq is now the AI provider. Use generateJSON/generateText/chatWithFallback.'); }
function getModel()      { return { generateContent: (p) => generateJSON(p) }; }
function getTextModel()  { return { generateContent: (p) => generateText(p) }; }

module.exports = {
  getGeminiClient,
  getModel,
  getTextModel,
  generateJSON,
  generateText,
  chatWithFallback,
};
