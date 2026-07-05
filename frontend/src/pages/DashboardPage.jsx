import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Code2, FlaskConical, Languages, Bug, Shield,
  TrendingUp, Calendar, Award, Target, ChevronRight,
  BarChart2, Loader2,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { historyAPI } from '../services/authService';
import { useAuth } from '../context/AuthContext';

/** Animated stat card */
function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="card hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{label}</p>
          <p className="text-3xl font-bold mt-1 tabular-nums">{value ?? 0}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-3 ${color} rounded-xl flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

/** Language usage bar */
function LangBar({ lang, count, max }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  const colors = {
    Java: 'bg-orange-500',
    Python: 'bg-blue-500',
    'C++': 'bg-purple-500',
    JavaScript: 'bg-yellow-500',
    'C#': 'bg-green-500',
  };
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium w-20 flex-shrink-0 dark:text-gray-300">{lang}</span>
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ${colors[lang] || 'bg-primary-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
    </div>
  );
}

/** Score color */
function scoreBadge(score) {
  if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
  if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
  return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyAPI.getStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => setStats({
        totalSessions: 0, totalOptimizations: 0, totalTestCases: 0,
        totalBugs: 0, criticalBugs: 0, todayCount: 0, monthCount: 0,
        avgScore: 100, languageBreakdown: [], recentActivity: [],
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading dashboard..." /></div>
      </DashboardLayout>
    );
  }

  const maxLang = stats?.languageBreakdown?.[0]?.count || 1;

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back, <span className="text-primary-600 font-semibold">{user?.name}</span>
        </p>
      </div>

      {/* Primary stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard label="Total Analyses" value={stats?.totalSessions} icon={Activity} color="bg-blue-500" />
        <StatCard label="Bugs Fixed" value={stats?.totalBugs} icon={Bug} color="bg-red-500" sub={`${stats?.criticalBugs ?? 0} critical`} />
        <StatCard label="Optimizations" value={stats?.totalOptimizations} icon={TrendingUp} color="bg-green-500" />
        <StatCard label="Test Cases" value={stats?.totalTestCases} icon={FlaskConical} color="bg-purple-500" />
      </div>

      {/* Secondary stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Today's Analyses" value={stats?.todayCount} icon={Calendar} color="bg-orange-500" />
        <StatCard label="This Month" value={stats?.monthCount} icon={BarChart2} color="bg-cyan-500" />
        <StatCard label="Avg Score" value={stats?.avgScore ? `${stats.avgScore}/100` : 'N/A'} icon={Award} color="bg-yellow-500" />
        <StatCard label="Languages Used" value={stats?.languageBreakdown?.length || 0} icon={Languages} color="bg-indigo-500" />
      </div>

      {/* Bottom grid: languages + recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Language breakdown */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary-600" /> Languages Used
            </h2>
          </div>
          {stats?.languageBreakdown?.length > 0 ? (
            <div className="space-y-3">
              {stats.languageBreakdown.map((item) => (
                <LangBar key={item.language} lang={item.language} count={item.count} max={maxLang} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <Languages className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No analyses yet</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600" /> Recent Activity
            </h2>
            <Link to="/editor" className="btn-primary text-sm py-2 px-4">New Analysis</Link>
          </div>
          {stats?.recentActivity?.length > 0 ? (
            <div className="space-y-2">
              {stats.recentActivity.map((item) => (
                <Link
                  key={item.id}
                  to={`/history/${item.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded flex-shrink-0">
                      {item.language}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.analysis_score != null && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreBadge(item.analysis_score)}`}>
                        {item.analysis_score}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Code2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No debug sessions yet.</p>
              <Link to="/editor" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
                Start your first analysis
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
