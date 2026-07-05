import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { ArrowLeft, CheckCircle, Wrench, Copy, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import DashboardLayout from './DashboardLayout';

const MONACO_LANG_MAP = {
  Java: 'java', Python: 'python', 'C++': 'cpp', JavaScript: 'javascript',
};

/**
 * ApplyFixPanel — shows detected bugs → suggested fix → apply button
 * with a side-by-side diff view of original vs corrected code
 */
export default function ApplyFixPanel({
  originalCode,
  correctedCode,
  optimizedCode,
  language,
  errors,
  onBack,
}) {
  const { darkMode } = useTheme();
  const [applied, setApplied] = useState(false);
  const [activeCode, setActiveCode] = useState(correctedCode || optimizedCode || originalCode);
  const [fixType, setFixType] = useState('corrected'); // 'corrected' | 'optimized'

  const monacoLang = MONACO_LANG_MAP[language] || 'javascript';
  const syntaxErrors = errors.filter((_, i) => i < errors.length / 2);
  const hasOptimized = !!optimizedCode;

  const handleApplyFix = () => {
    setApplied(true);
    // Copy to clipboard and notify
    navigator.clipboard.writeText(activeCode).catch(() => {});
    toast.success('Fix applied! Code copied to clipboard. Return to editor to paste.', { duration: 4000 });
  };

  const handleCopyFix = () => {
    navigator.clipboard.writeText(activeCode);
    toast.success('Fixed code copied!');
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Results
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wrench className="w-7 h-7 text-green-600" /> Auto Code Fix
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Review the fix, choose corrected or optimized version, then apply
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopyFix} className="btn-secondary flex items-center gap-2">
              <Copy className="w-4 h-4" /> Copy Fix
            </button>
            <button
              onClick={handleApplyFix}
              disabled={applied}
              className={`flex items-center gap-2 font-medium py-2.5 px-5 rounded-lg transition-colors ${
                applied
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {applied ? (
                <><CheckCircle className="w-4 h-4" /> Fix Applied!</>
              ) : (
                <><Wrench className="w-4 h-4" /> Apply Fix</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { step: 1, label: 'Detected Bugs', done: true },
            { step: 2, label: 'Suggested Fix', done: true },
            { step: 3, label: 'Apply Fix', done: applied },
          ].map(({ step, label, done }, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                done ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {done ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              <span className={`text-sm font-medium ${done ? 'text-green-700 dark:text-green-300' : 'text-gray-500'}`}>
                {label}
              </span>
              {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Detected Bugs */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-600">
              <Wrench className="w-5 h-5" /> Detected Bugs ({errors.length})
            </h3>
            {errors.length === 0 ? (
              <p className="text-sm text-gray-500">No bugs detected — optimizing code.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {errors.map((err, i) => (
                  <div key={i} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border-l-4 border-red-400">
                    <div className="flex items-center gap-2 mb-1">
                      {err.line && (
                        <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                          Line {err.line}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">{err.message}</p>
                    {err.explanation && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{err.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Version selector */}
          {hasOptimized && (
            <div className="card">
              <h3 className="font-semibold mb-3">Choose Fix Version</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setFixType('corrected'); setActiveCode(correctedCode); }}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    fixType === 'corrected'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">Corrected Code</p>
                  <p className="text-xs text-gray-500 mt-1">Bugs fixed only</p>
                </button>
                <button
                  onClick={() => { setFixType('optimized'); setActiveCode(optimizedCode); }}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    fixType === 'optimized'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">Optimized Code</p>
                  <p className="text-xs text-gray-500 mt-1">Fixed + optimized</p>
                </button>
              </div>
            </div>
          )}

          {/* Original Code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                Original Code
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full">Before</span>
              </h3>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <Editor
                height="320px"
                language={monacoLang}
                value={originalCode}
                theme={darkMode ? 'vs-dark' : 'light'}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on', scrollBeyondLastLine: false }}
              />
            </div>
          </div>
        </div>

        {/* Right: Fixed Code */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold flex items-center gap-2">
              {fixType === 'optimized' ? 'Optimized Code' : 'Corrected Code'}
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 px-2 py-0.5 rounded-full">After</span>
            </h3>
          </div>
          <div className={`rounded-xl border-2 overflow-hidden transition-colors ${
            applied ? 'border-green-500' : 'border-gray-200 dark:border-gray-700'
          }`}>
            {applied && (
              <div className="bg-green-600 text-white text-xs px-4 py-1.5 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5" /> Fix applied — copy this code into your editor
              </div>
            )}
            <Editor
              height="560px"
              language={monacoLang}
              value={activeCode}
              theme={darkMode ? 'vs-dark' : 'light'}
              options={{ readOnly: false, minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on', scrollBeyondLastLine: false }}
            />
          </div>

          {/* Apply CTA at bottom */}
          {!applied && (
            <button
              onClick={handleApplyFix}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle className="w-5 h-5" /> Apply Fix — Use This Code
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
