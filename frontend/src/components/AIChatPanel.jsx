import { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, Loader2, Trash2, ChevronDown,
  Copy, Check, Sparkles, Code2, Zap, Bug, BookOpen,
  BarChart2, Globe, MessageSquare, FlaskConical,
  Briefcase, ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { chatAPI } from '../services/authService';

/* ─── UI Languages ───────────────────────────────────────────── */
const UI_LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'ta', label: 'Tamil',      flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi',      flag: '🇮🇳' },
  { code: 'fr', label: 'French',     flag: '🇫🇷' },
  { code: 'es', label: 'Spanish',    flag: '🇪🇸' },
  { code: 'de', label: 'German',     flag: '🇩🇪' },
  { code: 'zh', label: 'Chinese',    flag: '🇨🇳' },
  { code: 'ar', label: 'Arabic',     flag: '🇸🇦' },
  { code: 'pt', label: 'Portuguese', flag: '🇧🇷' },
  { code: 'ja', label: 'Japanese',   flag: '🇯🇵' },
];

/* ─── Feature Modes ──────────────────────────────────────────── */
const MODES = [
  { id: 'chat',       label: 'Chat',        icon: MessageSquare, color: 'indigo',  desc: 'Ask anything'    },
  { id: 'explain',    label: 'Explain',     icon: BookOpen,      color: 'blue',    desc: 'Beginner guide'  },
  { id: 'testcases',  label: 'Test Cases',  icon: FlaskConical,  color: 'purple',  desc: 'Inputs & outputs'},
  { id: 'optimize',   label: 'Optimize',    icon: Zap,           color: 'yellow',  desc: 'Improve code'    },
  { id: 'complexity', label: 'Complexity',  icon: BarChart2,     color: 'green',   desc: 'Big-O analysis'  },
  { id: 'bugpredict', label: 'Bug Predict', icon: ShieldAlert,   color: 'red',     desc: 'Runtime risks'   },
  { id: 'interview',  label: 'Interview',   icon: Briefcase,     color: 'orange',  desc: 'Prep questions'  },
];

const MODE_RUN_LABELS = {
  explain:    'Explain Code',
  testcases:  'Generate Test Cases',
  optimize:   'Optimize Code',
  complexity: 'Analyze Complexity',
  bugpredict: 'Predict Bugs',
  interview:  'Generate Questions',
};

const MODE_COLORS = {
  indigo: { tab: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700', header: 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' },
  blue:   { tab: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',       btn: 'bg-blue-600 hover:bg-blue-700',     header: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' },
  purple: { tab: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700', btn: 'bg-purple-600 hover:bg-purple-700', header: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300' },
  yellow: { tab: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700', btn: 'bg-yellow-600 hover:bg-yellow-700', header: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300' },
  green:  { tab: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',   btn: 'bg-green-600 hover:bg-green-700',   header: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' },
  red:    { tab: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',              btn: 'bg-red-600 hover:bg-red-700',       header: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' },
  orange: { tab: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700', btn: 'bg-orange-600 hover:bg-orange-700', header: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300' },
};

/* ─── Code block ─────────────────────────────────────────────── */
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="code-block-wrapper relative my-2 rounded-xl overflow-hidden border border-white/10 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 dark:bg-black border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          {lang && <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">{lang}</span>}
        </div>
        <button onClick={copy} className="copy-btn flex items-center gap-1 text-xs text-gray-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition-colors">
          {copied
            ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
            : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>}
        </button>
      </div>
      <pre className="bg-[#1e1e2e] text-gray-100 px-5 py-4 overflow-x-auto text-xs font-mono leading-relaxed whitespace-pre-wrap"><code>{code}</code></pre>
    </div>
  );
}

function InlineCode({ c }) {
  return <code className="mx-0.5 px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-mono text-xs border border-indigo-200 dark:border-indigo-700/50">{c}</code>;
}

function parseInline(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2,-2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`')) return <InlineCode key={i} c={p.slice(1,-1)} />;
    return <span key={i}>{p}</span>;
  });
}

/* ─── Markdown renderer ──────────────────────────────────────── */
function MessageContent({ content }) {
  if (!content) return null;
  const segments = content.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {segments.map((seg, i) => {
        if (seg.startsWith('```')) {
          const inner = seg.slice(3, -3);
          const nl = inner.indexOf('\n');
          const lang = nl > -1 ? inner.slice(0, nl).trim() : '';
          const code = nl > -1 ? inner.slice(nl + 1) : inner;
          return <CodeBlock key={i} lang={lang} code={code} />;
        }
        return (
          <div key={i} className="space-y-1">
            {seg.split('\n').map((line, j) => {
              if (!line.trim()) return <div key={j} className="h-1" />;
              // heading
              const hm = line.match(/^#{1,3}\s+(.+)/);
              if (hm) return <p key={j} className="font-bold text-sm mt-2 mb-0.5 text-gray-900 dark:text-gray-100">{parseInline(hm[1])}</p>;
              // numbered list
              const nm = line.match(/^(\d+)\.\s+(.+)/);
              if (nm) return (
                <div key={j} className="flex gap-2 items-start">
                  <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold">{nm[1]}</span>
                  <span className="flex-1">{parseInline(nm[2])}</span>
                </div>
              );
              // bullet
              const bm = line.match(/^[-*•]\s+(.+)/);
              if (bm) return (
                <div key={j} className="flex gap-2 items-start">
                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-indigo-400 dark:bg-indigo-500" />
                  <span className="flex-1">{parseInline(bm[1])}</span>
                </div>
              );
              return <p key={j} className="text-gray-800 dark:text-gray-200">{parseInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Typing dots ────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-2 items-end">
      <div className="ai-avatar flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce-dot1" />
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce-dot2" />
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce-dot3" />
        </div>
      </div>
    </div>
  );
}

/* ─── Mode trigger chip (shown instead of "[Explain Code]" text) */
function ModeTriggerChip({ modeId }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[1];
  const Icon = mode.icon;
  const c = MODE_COLORS[mode.color];
  return (
    <div className="flex justify-end mb-1">
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${c.tab}`}>
        <Icon className="w-3.5 h-3.5" />
        {MODE_RUN_LABELS[modeId] || mode.label}
      </div>
    </div>
  );
}

/* ─── Mode Result Card — full-width, prominent ───────────────── */
function ModeResultCard({ message }) {
  const mode = MODES.find(m => m.id === message.mode) || MODES[1];
  const Icon = mode.icon;
  const c = MODE_COLORS[mode.color];
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="animate-fade-up w-full">
      {/* Header bar */}
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-t-2xl border ${c.header}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wide">{mode.label} Analysis</span>
          <span className="text-[10px] opacity-60">· {time}</span>
        </div>
        <button
          onClick={() => setCollapsed(v => !v)}
          className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity"
        >
          {collapsed ? 'Show' : 'Hide'}
          <ChevronDown className={`w-3 h-3 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="bg-white dark:bg-gray-900 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-2xl px-5 py-4 shadow-sm">
          <MessageContent content={message.content} />
        </div>
      )}
    </div>
  );
}

/* ─── Single chat bubble ─────────────────────────────────────── */
function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  // Mode trigger chip (user side) — hide the ugly "[Explain Code]" bracket text
  if (isUser && message.isModeRun) {
    return <ModeTriggerChip modeId={message.modeId} />;
  }

  // Mode result card (AI side) — full-width prominent card
  if (!isUser && message.mode && message.mode !== 'chat') {
    return <ModeResultCard message={message} />;
  }

  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // User chat bubble
  if (isUser) {
    return (
      <div className="flex gap-2 justify-end animate-slide-in">
        <div className="flex flex-col items-end gap-0.5 max-w-[82%]">
          <div className="user-bubble text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-md">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <span className="text-[10px] text-gray-400 px-1">{time}</span>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center shadow self-end mb-4">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
    );
  }

  // AI chat bubble
  return (
    <div className="flex gap-2 items-end animate-fade-up">
      <div className="ai-avatar flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg self-end mb-4">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex flex-col gap-0.5 max-w-[85%]">
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 px-1">AI Assistant</span>
        <div className="bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          <MessageContent content={message.content} />
        </div>
        <span className="text-[10px] text-gray-400 px-1">{time}</span>
      </div>
    </div>
  );
}

/* ─── Welcome empty state ────────────────────────────────────── */
function EmptyState({ onModeRun }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-6 text-center">
      <div className="relative mb-5">
        <div className="ai-avatar w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse-slow" />
      </div>
      <h3 className="font-bold text-base bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
        AI Debug Assistant
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mb-5">
        Select a feature tab above, or click a quick action below to get started.
      </p>
      <div className="grid grid-cols-2 gap-2 w-full max-w-[280px]">
        {MODES.filter(m => m.id !== 'chat').map(({ id, label, icon: Icon, color, desc }) => {
          const c = MODE_COLORS[color];
          return (
            <button
              key={id}
              onClick={() => onModeRun(id)}
              className={`flex flex-col items-start gap-1 px-3 py-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${c.tab}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-semibold">{label}</span>
              <span className="text-[10px] opacity-70">{desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Mode tab strip ─────────────────────────────────────────── */
function ModeTabs({ activeMode, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide px-3 py-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      {MODES.map(({ id, label, icon: Icon, color }) => {
        const active = activeMode === id;
        const c = MODE_COLORS[color];
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            title={label}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              active ? c.tab : 'text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
const WELCOME_MSG = { role: 'assistant', content: null, timestamp: 0 };

export default function AIChatPanel({ code, language, onToggle }) {
  const [messages, setMessages]         = useState([WELCOME_MSG]);
  const [input, setInput]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [activeMode, setActiveMode]     = useState('chat');
  const [uiLang, setUiLang]             = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const messagesRef    = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const isWelcome = messages.length === 1 && messages[0].content === null;

  /* ── Core send function ──────────────────────────────────── */
  const doSend = async ({ text, mode, isModeRun }) => {
    if (loading) return;
    const msgText = (text || '').trim();
    if (!msgText) return;

    const currentMsgs = messagesRef.current;
    const isFirst = currentMsgs.length === 1 && currentMsgs[0].content === null;

    // User message object — mode-run gets a chip, chat gets a bubble
    const userMsg = {
      role: 'user',
      content: msgText,
      isModeRun: !!isModeRun,
      modeId: isModeRun ? mode : undefined,
      timestamp: Date.now(),
    };

    setMessages(isFirst ? [userMsg] : prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = (isFirst ? [] : currentMsgs)
        .filter(m => m.content !== null && !m.isModeRun)
        .map(m => ({ role: m.role, content: m.content }));

      const { data } = await chatAPI.sendMessage({
        message:    msgText,
        code:       code     || '',
        language:   language || 'JavaScript',
        uiLanguage: uiLang,
        mode:       mode     || 'chat',
        history:    isModeRun ? [] : history,
      });

      setMessages(prev => [
        ...prev,
        {
          role:      'assistant',
          content:   data.data.content,
          mode:      data.data.mode,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI chat failed. Please try again.');
      setMessages(prev => prev.filter(m => m !== userMsg));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  /* ── Action handlers ─────────────────────────────────────── */
  const handleModeRun = (modeId) => {
    if (!code || !code.trim()) {
      toast.error('Please write or paste some code in the editor first.');
      return;
    }
    setActiveMode(modeId);
    doSend({ text: MODE_RUN_LABELS[modeId], mode: modeId, isModeRun: true });
  };

  const handleSendChat = () => {
    doSend({ text: input, mode: activeMode, isModeRun: false });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); }
  };

  const clearChat = () => {
    setMessages([{ ...WELCOME_MSG, timestamp: Date.now() }]);
    setInput('');
    setActiveMode('chat');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const currentLang = UI_LANGUAGES.find(l => l.code === uiLang) || UI_LANGUAGES[0];
  const currentMode = MODES.find(m => m.id === activeMode) || MODES[0];
  const ModeIcon    = currentMode.icon;
  const modeColors  = MODE_COLORS[currentMode.color];
  const visibleMsgs = messages.filter(m => m.content !== null);

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 overflow-hidden" onClick={() => setShowLangMenu(false)}>

      {/* HEADER */}
      <div className="chat-header-glass flex-shrink-0 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white/30 animate-pulse-slow" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm leading-tight">AI Debug Assistant</h3>
            <p className="text-[10px] text-white/70">Online · Gemini AI · 10 Languages</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Language picker */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowLangMenu(v => !v)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] bg-white/15 hover:bg-white/25 text-white rounded-lg transition-all"
            >
              <Globe className="w-3 h-3" />
              <span>{currentLang.flag} {currentLang.label}</span>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-8 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-1 w-44 max-h-64 overflow-y-auto">
                {UI_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setUiLang(l.code); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${uiLang === l.code ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    <span className="text-sm">{l.flag}</span>{l.label}
                    {uiLang === l.code && <Check className="w-3 h-3 ml-auto text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {visibleMsgs.length > 0 && (
            <span className="text-[11px] bg-white/15 text-white/80 px-2 py-0.5 rounded-full">
              {visibleMsgs.length}
            </span>
          )}
          <button onClick={clearChat} title="Clear chat" className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onToggle} title="Hide" className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-all">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MODE TABS */}
      <ModeTabs activeMode={activeMode} onChange={m => { setActiveMode(m); setShowLangMenu(false); }} />

      {/* MESSAGES */}
      <div className="chat-messages flex-1 overflow-y-auto px-3 py-4 space-y-4 min-h-0">
        {isWelcome ? (
          <EmptyState onModeRun={handleModeRun} />
        ) : (
          <>
            {visibleMsgs.map((msg, i) => <ChatMessage key={i} message={msg} />)}
            {loading && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="flex-shrink-0 px-3 pb-3 pt-1">
        {/* Mode-run button — only for non-chat modes */}
        {activeMode !== 'chat' && (
          <button
            onClick={() => handleModeRun(activeMode)}
            disabled={loading}
            className={`w-full mb-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] ${modeColors.btn}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ModeIcon className="w-4 h-4" />}
            {loading ? 'Analyzing...' : MODE_RUN_LABELS[activeMode]}
          </button>
        )}

        {/* Text input */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg focus-within:border-indigo-400 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeMode === 'chat' ? 'Ask anything about your code...' : `Type a follow-up or click the button above...`}
            rows={1}
            disabled={loading}
            className="w-full resize-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-4 pt-3 pb-9 outline-none leading-relaxed chat-input disabled:opacity-60"
          />
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
            <span className={`text-[10px] ${input.length > 4000 ? 'text-red-400' : 'text-gray-300 dark:text-gray-600'}`}>
              {input.length > 0 ? `${input.length}/5000` : 'Enter ↵ send  ·  Shift+Enter new line'}
            </span>
            <button
              onClick={handleSendChat}
              disabled={loading || !input.trim()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                input.trim() && !loading
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:scale-105 active:scale-95'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {loading ? 'Thinking...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
