import { useState, useRef, useEffect } from 'react';
import { GitBranch, Loader2, Download, RefreshCw } from 'lucide-react';
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

// Node shapes by type
const NODE_STYLES = {
  start: { shape: 'rounded-full', bg: 'bg-green-500', text: 'text-white', border: 'border-green-500' },
  end: { shape: 'rounded-full', bg: 'bg-red-500', text: 'text-white', border: 'border-red-500' },
  process: { shape: 'rounded-lg', bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500' },
  decision: { shape: 'rounded-lg rotate-45', bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-500' },
  io: { shape: 'rounded-lg', bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-500' },
};

function FlowNode({ node, x, y }) {
  const style = NODE_STYLES[node.type] || NODE_STYLES.process;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <foreignObject x="-60" y="-20" width="120" height="40">
        <div
          className={`w-full h-full flex items-center justify-center ${style.bg} ${style.text} ${style.shape} px-2 py-1`}
          style={{ fontSize: '11px', textAlign: 'center' }}
        >
          {node.label}
        </div>
      </foreignObject>
    </g>
  );
}

function FlowchartVisual({ data }) {
  if (!data?.nodes?.length) return null;

  // Simple vertical layout
  const nodeHeight = 80;
  const nodeGap = 30;
  const svgWidth = 600;
  const totalHeight = data.nodes.length * (nodeHeight + nodeGap) + 40;
  const centerX = svgWidth / 2;

  // Map node id → position
  const positions = {};
  data.nodes.forEach((node, i) => {
    positions[node.id] = { x: centerX, y: 40 + i * (nodeHeight + nodeGap) };
  });

  return (
    <div className="overflow-auto">
      <svg width={svgWidth} height={totalHeight} className="mx-auto">
        {/* Edges */}
        {data.edges?.map((edge, i) => {
          const from = positions[edge.from];
          const to = positions[edge.to];
          if (!from || !to) return null;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          return (
            <g key={i}>
              <line
                x1={from.x} y1={from.y + 20}
                x2={to.x} y2={to.y - 20}
                stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrow)"
              />
              {edge.label && (
                <text x={midX + 5} y={midY} fontSize="10" fill="#6b7280">{edge.label}</text>
              )}
            </g>
          );
        })}

        {/* Arrow marker */}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
          </marker>
        </defs>

        {/* Nodes */}
        {data.nodes.map((node) => {
          const pos = positions[node.id];
          return pos ? <FlowNode key={node.id} node={node} x={pos.x} y={pos.y} /> : null;
        })}
      </svg>
    </div>
  );
}

export default function FlowchartPage() {
  const { darkMode } = useTheme();
  const [language, setLanguage] = useState('Python');
  const [code, setCode] = useState('def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const svgRef = useRef(null);

  const handleGenerate = async () => {
    if (!code.trim()) { toast.error('Enter code to generate flowchart'); return; }
    setLoading(true);
    try {
      const { data } = await debugAPI.flowchart({ code, language });
      setResult(data.data);
      toast.success('Flowchart generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Flowchart generation failed');
    } finally { setLoading(false); }
  };

  const handleDownload = () => {
    const svgEl = document.querySelector('.flowchart-svg-wrapper svg');
    if (!svgEl) { toast.error('No flowchart to download'); return; }
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'flowchart.svg'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Flowchart downloaded!');
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GitBranch className="w-7 h-7 text-primary-600" /> Flowchart Generator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Generate logical flowcharts from your code</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Code input */}
        <div>
          <div className="card mb-3 py-3 px-4">
            <div className="flex items-center gap-3">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-field w-40 py-2 text-sm">
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
              <button onClick={handleGenerate} disabled={loading} className="btn-primary flex items-center gap-2 ml-auto">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Editor
              height="460px"
              language={MONACO_MAP[language]}
              value={code}
              onChange={(v) => setCode(v || '')}
              theme={darkMode ? 'vs-dark' : 'light'}
              options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on', scrollBeyondLastLine: false }}
            />
          </div>
        </div>

        {/* Flowchart output */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Generated Flowchart</h3>
            {result && (
              <button onClick={handleDownload} className="btn-secondary text-sm flex items-center gap-1.5 py-1.5 px-3">
                <Download className="w-4 h-4" /> Download SVG
              </button>
            )}
          </div>
          <div className="card min-h-[460px] flex flex-col">
            {!result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <GitBranch className="w-16 h-16 mb-3 opacity-30" />
                <p>Flowchart will appear here</p>
              </div>
            ) : (
              <>
                {result.title && <h4 className="font-semibold text-center mb-3">{result.title}</h4>}
                <div className="flowchart-svg-wrapper flex-1 overflow-auto">
                  <FlowchartVisual data={result} />
                </div>
                {result.description && (
                  <p className="text-xs text-gray-500 mt-3 text-center">{result.description}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
