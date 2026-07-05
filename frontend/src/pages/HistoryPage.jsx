import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Trash2, Eye, History, SortAsc, SortDesc,
  Bug, Clock, Award, Filter, Code2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { historyAPI, debugAPI } from '../services/authService';

const LANGUAGES = ['All', 'Java', 'Python', 'C++', 'JavaScript', 'C#'];

function scoreBadge(score) {
  if (score == null) return 'bg-gray-100 dark:bg-gray-800 text-gray-500';
  if (score >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
  if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
}

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await historyAPI.getAll({
        search,
        language: language === 'All' ? '' : language,
        sortBy,
        sortOrder,
      });
      setHistory(data.data);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [sortBy, sortOrder, language]);

  const handleSearch = (e) => { e.preventDefault(); fetchHistory(); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this history record?')) return;
    try {
      await historyAPI.delete(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleDownloadPDF = async (item) => {
    setPdfLoading(item.id);
    try {
      // Fetch full record first
      const { data: full } = await historyAPI.getById(item.id);
      const row = full.data;
      const response = await debugAPI.generatePDF({
        analysis: {
          syntaxErrors: row.syntax_errors || [],
          logicalErrors: row.logical_errors || [],
          correctedCode: row.corrected_code,
          optimizedCode: row.optimized_code,
          optimizationExplanation: row.optimization_explanation,
          testCases: row.generated_test_cases || [],
          timeComplexity: row.time_complexity,
          spaceComplexity: row.space_complexity,
          bestPractices: row.best_practices || [],
          learningTopics: row.learning_topics || [],
          expectedOutputs: row.expected_outputs || [],
        },
        language: row.language,
        originalCode: row.original_code,
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.download = `report-${item.id}.pdf`; link.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('Failed to generate PDF'); }
    finally { setPdfLoading(null); }
  };

  const toggleSort = (col) => {
    if (sortBy === col) setSortOrder((o) => o === 'DESC' ? 'ASC' : 'DESC');
    else { setSortBy(col); setSortOrder('DESC'); }
  };

  const SortIcon = sortOrder === 'DESC' ? SortDesc : SortAsc;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Debug History</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Search, filter, and manage your analyses</p>
      </div>

      {/* Toolbar */}
      <div className="card mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="input-field pl-9 py-2 text-sm"
                placeholder="Search code, language..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary py-2 px-4 text-sm">Search</button>
          </form>

          {/* Language filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-field py-2 text-sm w-36"
            >
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Sort buttons */}
          <div className="flex gap-1">
            {[
              { col: 'created_at', label: 'Date' },
              { col: 'analysis_score', label: 'Score' },
              { col: 'language', label: 'Language' },
            ].map(({ col, label }) => (
              <button
                key={col}
                onClick={() => toggleSort(col)}
                className={`flex items-center gap-1 text-xs px-3 py-2 rounded-lg transition-colors ${
                  sortBy === col
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {sortBy === col && <SortIcon className="w-3 h-3" />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading history..." /></div>
      ) : history.length === 0 ? (
        <div className="card text-center py-16">
          <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No debug history found.</p>
          <Link to="/editor" className="btn-primary mt-4 inline-block text-sm">Start Analyzing</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Left info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full">
                      {item.language}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${scoreBadge(item.analysisScore)}`}>
                      <Award className="w-3 h-3" /> {item.analysisScore ?? 'N/A'}/100
                    </span>
                    {item.bugCount > 0 && (
                      <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full flex items-center gap-1">
                        <Bug className="w-3 h-3" /> {item.bugCount} bug{item.bugCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                    {item.originalCode}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>⏱ {item.timeComplexity || 'N/A'}</span>
                    <span>💾 {item.spaceComplexity || 'N/A'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  <Link
                    to={`/history/${item.id}`}
                    className="btn-secondary text-sm flex items-center gap-1.5 py-1.5 px-3"
                  >
                    <Eye className="w-4 h-4" /> View
                  </Link>
                  <button
                    onClick={() => handleDownloadPDF(item)}
                    disabled={pdfLoading === item.id}
                    className="btn-secondary text-sm flex items-center gap-1.5 py-1.5 px-3"
                  >
                    <Code2 className={`w-4 h-4 ${pdfLoading === item.id ? 'animate-spin' : ''}`} />
                    PDF
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-danger text-sm flex items-center gap-1.5 py-1.5 px-3"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
