import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Upload, Loader2, MessageSquare, PanelRightClose, PanelRightOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import AIChatPanel from '../components/AIChatPanel';
import { debugAPI } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

const LANGUAGES = [
  'Java', 'Python', 'C++', 'JavaScript', 'C#',
  'TypeScript', 'Go', 'Rust', 'Swift', 'Kotlin',
];

const MONACO_LANG_MAP = {
  Java: 'java', Python: 'python', 'C++': 'cpp',
  JavaScript: 'javascript', 'C#': 'csharp',
  TypeScript: 'typescript', Go: 'go', Rust: 'rust',
  Swift: 'swift', Kotlin: 'kotlin',
};

const DEFAULT_CODE = {
  Java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}',
  Python: 'def main():\n    print("Hello World")\n\nif __name__ == "__main__":\n    main()',
  'C++': '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}',
  JavaScript: 'function main() {\n    console.log("Hello World");\n}\n\nmain();',
  'C#': 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello World");\n    }\n}',
  TypeScript: 'function main(): void {\n    console.log("Hello World");\n}\n\nmain();',
  Go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}',
  Rust: 'fn main() {\n    println!("Hello World");\n}',
  Swift: 'import Foundation\n\nfunc main() {\n    print("Hello World")\n}\n\nmain()',
  Kotlin: 'fun main() {\n    println("Hello World")\n}',
};

export default function CodeEditorPage() {
  const [language, setLanguage] = useState('Python');
  const [code, setCode] = useState(DEFAULT_CODE.Python);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const fileInputRef = useRef(null);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang]);
  };

  const handleReset = () => {
    setCode(DEFAULT_CODE[language]);
    toast.success('Code reset');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to analyze');
      return;
    }
    setLoading(true);
    try {
      const { data } = await debugAPI.analyze({ code, language, saveHistory: true });
      navigate('/analysis', { state: { result: data.data } });
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Code Editor</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Write or paste your code — AI analyzes it and assists in real-time
        </p>
      </div>

      {/* Toolbar */}
      <div className="card mb-4 py-3 px-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">Language</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="input-field w-44 py-2 text-sm"
              disabled={loading}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 ml-auto items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept=".java,.py,.cpp,.c,.js,.ts,.cs,.go,.rs,.swift,.kt,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center gap-2 text-sm"
              disabled={loading}
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center gap-2 text-sm"
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={() => setChatOpen((o) => !o)}
              className="btn-secondary flex items-center gap-2 text-sm"
              title={chatOpen ? 'Hide chat' : 'Show AI chat'}
            >
              {chatOpen ? (
                <><PanelRightClose className="w-4 h-4" /> Hide Chat</>
              ) : (
                <><PanelRightOpen className="w-4 h-4" /> AI Chat</>
              )}
            </button>
            <button
              onClick={handleAnalyze}
              className="btn-primary flex items-center gap-2 text-sm"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Play className="w-4 h-4" /> Analyze</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Editor + Chat side by side */}
      <div className={`grid gap-4 ${chatOpen ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor */}
        <div className="card p-0 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-black/30 z-10 flex items-center justify-center rounded-xl">
              <div className="card flex items-center gap-3 shadow-xl">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                <span className="font-medium">AI is analyzing your code...</span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <span className="text-xs font-mono text-gray-500">
              {language} • {code.split('\n').length} lines
            </span>
            <span className="text-xs text-gray-400">{code.length} chars</span>
          </div>
          <Editor
            height="520px"
            language={MONACO_LANG_MAP[language]}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme={darkMode ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: 'on',
              padding: { top: 8 },
            }}
          />
        </div>

        {/* AI Chat Panel */}
        {chatOpen && (
          <div className="rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col" style={{ height: '580px' }}>
            <AIChatPanel
              code={code}
              language={language}
              onToggle={() => setChatOpen(false)}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
