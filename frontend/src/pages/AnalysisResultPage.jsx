import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Copy, Download, Save, ArrowLeft, AlertTriangle,
  CheckCircle, Clock, BookOpen, Lightbulb, Wrench,
  Shield, Target, Bug, Loader2, Play, FlaskConical,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { debugAPI, historyAPI } from '../services/authService';

/* ── helpers ────────────────────────────────────────────────────── */
function safe(v, fallback = '') { return v !== undefined && v !== null ? v : fallback; }
function safeArr(v) { return Array.isArray(v) ? v : []; }

function CopyBtn({ text, label = 'Copy' }) {
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(String(text || '')); toast.success(`${label} copied!`); }}
      className="btn-secondary text-sm flex items-center gap-1.5 py-1.5 px-3"
    >
      <Copy className="w-4 h-4" /> {label}
    </button>
  );
}

function ScoreBadge({ score }) {
  const n = Number(score) || 0;
  const cls = n >= 80 ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300'
    : n >= 60 ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300'
    : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
  return <span className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-lg ${cls}`}>{n}/100</span>;
}

function CodeBlock({ title, code, badge }) {
  if (!code || !code.trim()) return null;
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          {badge && <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">{badge}</span>}
        </div>
        <CopyBtn text={code} label="Copy" />
      </div>
      <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap break-words">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ErrorList({ title, errors, type }) {
  const list = safeArr(errors);
  if (!list.length) return null;
  const isSyntax = type === 'syntax';
  const Icon = isSyntax ? AlertTriangle : Target;
  const color = isSyntax ? 'text-red-500' : 'text-yellow-500';
  const badge = isSyntax
    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  return (
    <div className="card">
      <h3 className={`font-semibold text-lg mb-3 flex items-center gap-2 ${color}`}>
        <Icon className="w-5 h-5" /> {title} ({list.length})
      </h3>
      <div className="space-y-3">
        {list.map((err, i) => (
          <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 border-red-400">
            <div className="flex items-center gap-2 mb-1">
              {err.line && <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">Line {err.line}</span>}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>{isSyntax ? 'Syntax' : 'Logical'}</span>
            </div>
            <p className="font-medium text-sm">{safe(err.message, String(err))}</p>
            {err.explanation && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{err.explanation}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TestCaseList({ title, cases }) {
  const list = safeArr(cases);
  if (!list.length) return null;
  const allText = list.map((tc, i) => `Case ${i+1}: ${tc.input || tc}`).join('\n');
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-purple-600"><FlaskConical className="w-5 h-5" />{title}</h3>
        <CopyBtn text={allText} label="Copy All" />
      </div>
      <div className="space-y-2">
        {list.map((tc, i) => (
          <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-start justify-between gap-2">
            <div className="flex-1">
              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full mr-2">Case {i+1}</span>
              <span className="text-sm font-mono">{safe(tc.input, String(tc))}</span>
              {tc.description && <p className="text-xs text-gray-500 mt-1">{tc.description}</p>}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(safe(tc.input, String(tc))); toast.success('Copied!'); }}>
              <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TagList({ title, items, icon: Icon, color = 'text-primary-600' }) {
  const list = safeArr(items);
  if (!list.length) return null;
  return (
    <div className="card">
      <h3 className={`font-semibold text-lg mb-3 flex items-center gap-2 ${color}`}>
        <Icon className="w-5 h-5" /> {title}
      </h3>
      <ul className="space-y-2">
        {list.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-primary-600 font-bold mt-0.5">{i+1}.</span>
            <span>{String(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Apply Fix inline (no separate page, no double layout) ────── */
function ApplyFixView({ result, onBack }) {
  const [copied, setCopied] = useState(false);
  const fixCode = result.correctedCode || result.optimizedCode || result.originalCode || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(fixCode);
    setCopied(true);
    toast.success('Fixed code copied! Paste it in your editor.');
    setTimeout(() => setCopied(false), 3000);
  };

  const errors = [...safeArr(result.syntaxErrors), ...safeArr(result.logicalErrors)];

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Report
      </button>

      {/* Steps */}
      <div className="card">
        <div className="flex items-center gap-6 flex-wrap">
          {['Detected Bugs', 'Suggested Fix', 'Copy & Apply'].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 2 ? 'bg-green-600 text-white' : copied ? 'bg-green-600 text-white' : 'bg-primary-600 text-white'}`}>
                {i < 2 || copied ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-sm font-medium">{step}</span>
              {i < 2 && <span className="text-gray-300 dark:text-gray-600">›</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bugs list */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-3 text-red-600 flex items-center gap-2">
            <Bug className="w-5 h-5" /> Detected Issues ({errors.length})
          </h3>
          {errors.length === 0
            ? <p className="text-sm text-gray-500">No bugs — showing optimized version.</p>
            : <div className="space-y-2 max-h-64 overflow-y-auto">
                {errors.map((err, i) => (
                  <div key={i} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border-l-4 border-red-400">
                    {err.line && <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded mr-2">Line {err.line}</span>}
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 mt-1">{err.message}</p>
                    {err.explanation && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{err.explanation}</p>}
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Fixed code */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg text-green-600 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Fixed Code
            </h3>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                copied ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Fix</>}
            </button>
          </div>
          <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
            <code>{fixCode}</code>
          </pre>
          <p className="text-xs text-gray-500 mt-2">Copy this code and paste it back into the editor.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────── */
export default function AnalysisResultPage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [saving, setSaving]           = useState(false);
  const [pdfLoading, setPdfLoading]   = useState(false);
  const [applyFix, setApplyFix]       = useState(false);

  const result = location.state?.result;

  /* No result — show guide instead of black screen */
  if (!result) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6">
            <Bug className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No Analysis Yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-sm leading-relaxed">
            Go to the <strong>Code Editor</strong>, paste or write your code,
            select a language, then click <strong>Analyze</strong> to see the full report here.
          </p>
          <Link to="/editor" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
            <Play className="w-5 h-5" /> Open Code Editor
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  /* Safe field access */
  const syntaxErrors   = safeArr(result.syntaxErrors);
  const logicalErrors  = safeArr(result.logicalErrors);
  const bugCount       = syntaxErrors.length + logicalErrors.length;
  const score          = Number(result.analysisScore) || (100 - bugCount * 10);
  const hasBugs        = bugCount > 0;
  const hasFix         = !!(result.correctedCode || result.optimizedCode);

  const handleSaveHistory = async () => {
    if (result.historyId) { toast.success('Already saved'); return; }
    setSaving(true);
    try { await historyAPI.save(result); toast.success('Saved to history!'); }
    catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const response = await debugAPI.generatePDF({ analysis: result, language: result.language, originalCode: result.originalCode });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `debug-report-${Date.now()}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('Failed to generate PDF'); }
    finally { setPdfLoading(false); }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <button onClick={() => navigate('/editor')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Editor
          </button>
          <h1 className="text-3xl font-bold">Analysis Report</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-full">
              {safe(result.language, 'Unknown')}
            </span>
            <ScoreBadge score={score} />
            <span className="text-sm text-gray-500">{bugCount} bug{bugCount !== 1 ? 's' : ''} found</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasBugs && hasFix && !applyFix && (
            <button onClick={() => setApplyFix(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors">
              <Wrench className="w-4 h-4" /> Apply Fix
            </button>
          )}
          <button onClick={handleSaveHistory} disabled={saving} className="btn-secondary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handleDownloadPDF} disabled={pdfLoading} className="btn-primary flex items-center gap-2">
            {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {pdfLoading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Apply Fix view — inline, no separate route */}
      {applyFix ? (
        <ApplyFixView result={result} onBack={() => setApplyFix(false)} />
      ) : (
        <div className="space-y-6">
          {/* Original Code */}
          <CodeBlock title="Original Code" code={result.originalCode} />

          {/* Auto Fix Banner */}
          {hasBugs && hasFix && (
            <div className="card border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                    <Wrench className="w-5 h-5" /> Auto Fix Available
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    {syntaxErrors.length} syntax + {logicalErrors.length} logical error{logicalErrors.length !== 1 ? 's' : ''} detected. Click Apply Fix to see the corrected code.
                  </p>
                </div>
                <button onClick={() => setApplyFix(true)} className="flex-shrink-0 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
                  <Play className="w-4 h-4" /> Apply Fix
                </button>
              </div>
            </div>
          )}

          {/* Errors */}
          <ErrorList title="Syntax Errors" errors={syntaxErrors} type="syntax" />
          <ErrorList title="Logical Errors" errors={logicalErrors} type="logical" />

          {/* Code */}
          <CodeBlock title="Corrected Code" code={result.correctedCode} badge="Fixed" />
          <CodeBlock title="Optimized Code" code={result.optimizedCode} badge="Optimized" />

          {result.optimizationExplanation && (
            <div className="card">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary-600" /> Optimization Explanation</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{result.optimizationExplanation}</p>
            </div>
          )}

          {/* Complexity */}
          <div className="card">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-600"><Clock className="w-5 h-5" /> Complexity Analysis</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: '⏱ Time Complexity',      value: result.timeComplexity,          color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
                { label: '💾 Space Complexity',     value: result.spaceComplexity,         color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
                { label: '🚀 Optimized Time',       value: result.optimizedTimeComplexity, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
                { label: '📦 Optimized Space',      value: result.optimizedSpaceComplexity,color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' },
                { label: '⬆️ Worst Case',           value: result.worstCase,               color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
                { label: '📊 Average Case',         value: result.averageCase,             color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
                { label: '⬇️ Best Case',            value: result.bestCase,                color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
              ].filter(r => r.value && r.value !== 'Unknown').map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  <span className={`text-sm font-mono font-bold px-3 py-1 rounded-full ${color}`}>{value}</span>
                </div>
              ))}
            </div>
            {result.complexityExplanation && (
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">{result.complexityExplanation}</p>
            )}
          </div>

          {/* Test Cases */}
          <TestCaseList title="Normal Test Cases"   cases={result.testCases} />
          <TestCaseList title="Boundary Test Cases" cases={result.boundaryTestCases} />
          <TestCaseList title="Edge Test Cases"     cases={result.edgeTestCases} />

          {/* Expected Outputs */}
          {safeArr(result.expectedOutputs).length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-green-600"><CheckCircle className="w-5 h-5" /> Expected Outputs</h3>
                <CopyBtn text={safeArr(result.expectedOutputs).join('\n')} label="Copy All" />
              </div>
              <div className="space-y-2">
                {safeArr(result.expectedOutputs).map((out, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Output {i+1}</span>
                      <span className="text-sm font-mono">{String(out)}</span>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(String(out)); toast.success('Copied!'); }}>
                      <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <TagList title="Best Practices"          items={result.bestPractices}    icon={Shield}   color="text-blue-600" />
            <TagList title="Learning Recommendations" items={result.learningTopics}   icon={BookOpen} color="text-purple-600" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <TagList title="Recommended Algorithms"    items={result.recommendedAlgorithms}     icon={Lightbulb} color="text-orange-600" />
            <TagList title="Interview Questions"        items={result.interviewQuestions}        icon={Target}    color="text-indigo-600" />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
