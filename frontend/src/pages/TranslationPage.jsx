import { useState } from 'react';
import { ArrowLeftRight, Copy, Loader2, Languages } from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { debugAPI } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

const LANGUAGES = [
  'Java', 'Python', 'C++', 'JavaScript', 'C#',
  'TypeScript', 'Go', 'Rust', 'Swift', 'Kotlin',
];
const MONACO_MAP = {
  Java: 'java', Python: 'python', 'C++': 'cpp',
  JavaScript: 'javascript', 'C#': 'csharp',
  TypeScript: 'typescript', Go: 'go', Rust: 'rust',
  Swift: 'swift', Kotlin: 'kotlin',
};

export default function TranslationPage() {
  const { darkMode } = useTheme();
  const [source, setSource] = useState('Python');
  const [target, setTarget] = useState('JavaScript');
  const [sourceCode, setSourceCode] = useState('def add(a, b):\n    return a + b\n\nprint(add(3, 5))');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (source === target) { toast.error('Source and target languages must differ'); return; }
    if (!sourceCode.trim()) { toast.error('Enter code to translate'); return; }
    setLoading(true);
    try {
      const { data } = await debugAPI.translate({ code: sourceCode, sourceLanguage: source, targetLanguage: target });
      setResult(data.data);
      toast.success('Translation complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Translation failed');
    } finally { setLoading(false); }
  };

  const swap = () => {
    setSource(target);
    setTarget(source);
    if (result?.translatedCode) { setSourceCode(result.translatedCode); setResult(null); }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Languages className="w-7 h-7 text-primary-600" /> Code Translation
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Convert code between programming languages</p>
      </div>

      {/* Lang selector */}
      <div className="card mb-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <select value={source} onChange={(e) => setSource(e.target.value)} className="input-field w-44 py-2 text-sm">
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <button onClick={swap} className="btn-secondary mt-4 p-2" title="Swap languages">
            <ArrowLeftRight className="w-5 h-5" />
          </button>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className="input-field w-44 py-2 text-sm">
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <button onClick={handleTranslate} disabled={loading} className="btn-primary flex items-center gap-2 mt-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
            {loading ? 'Translating...' : 'Translate'}
          </button>
        </div>
      </div>

      {/* Side by side editors */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold flex items-center gap-2">
              Source <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">{source}</span>
            </h3>
          </div>
          <div className="card p-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <Editor
              height="420px"
              language={MONACO_MAP[source]}
              value={sourceCode}
              onChange={(v) => setSourceCode(v || '')}
              theme={darkMode ? 'vs-dark' : 'light'}
              options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: 'on', scrollBeyondLastLine: false }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold flex items-center gap-2">
              Translated <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">{target}</span>
            </h3>
            {result?.translatedCode && (
              <button onClick={() => { navigator.clipboard.writeText(result.translatedCode); toast.success('Copied!'); }}
                className="btn-secondary text-sm flex items-center gap-1.5 py-1.5 px-3">
                <Copy className="w-4 h-4" /> Copy
              </button>
            )}
          </div>
          <div className="card p-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <Editor
              height="420px"
              language={MONACO_MAP[target]}
              value={result?.translatedCode || '// Translation will appear here'}
              theme={darkMode ? 'vs-dark' : 'light'}
              options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, lineNumbers: 'on', scrollBeyondLastLine: false }}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      {result?.notes?.length > 0 && (
        <div className="card mt-5">
          <h3 className="font-semibold mb-3">Translation Notes</h3>
          <ul className="space-y-2">
            {result.notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary-600 font-bold mt-0.5">{i + 1}.</span>
                <span className="text-gray-600 dark:text-gray-400">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardLayout>
  );
}
