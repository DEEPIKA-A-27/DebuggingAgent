import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Palette, Type, Globe, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { settingsAPI } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

const EDITOR_THEMES = [
  { value: 'vs-dark', label: 'VS Dark' },
  { value: 'light', label: 'Light' },
  { value: 'hc-black', label: 'High Contrast Dark' },
];
const FONT_SIZES = [11, 12, 13, 14, 15, 16, 18, 20];
const LANGUAGES_LIST = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
];

export default function SettingsPage() {
  const { darkMode, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    theme: darkMode ? 'dark' : 'light',
    editor_theme: 'vs-dark',
    font_size: 14,
    language: 'en',
    autosave: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsAPI.get()
      .then(({ data }) => {
        setForm(data.data);
        // Sync theme context
        if (data.data.theme === 'dark' && !darkMode) toggleTheme();
        if (data.data.theme === 'light' && darkMode) toggleTheme();
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update({
        theme: form.theme,
        editorTheme: form.editor_theme,
        fontSize: form.font_size,
        language: form.language,
        autosave: form.autosave,
      });
      // Sync theme
      if (form.theme === 'dark' && !darkMode) toggleTheme();
      if (form.theme === 'light' && darkMode) toggleTheme();
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally { setSaving(false); }
  };

  if (loading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary-600" /> Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Customize your experience</p>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Appearance */}
        <div className="card">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary-600" /> Appearance
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="grid grid-cols-2 gap-3">
                {['light', 'dark'].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleChange('theme', t)}
                    className={`p-4 rounded-xl border-2 transition-colors text-left ${
                      form.theme === t
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full mb-2 ${t === 'dark' ? 'bg-gray-900' : 'bg-gray-100 border border-gray-300'}`} />
                    <p className="font-medium capitalize">{t}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Editor Theme</label>
              <select value={form.editor_theme} onChange={(e) => handleChange('editor_theme', e.target.value)} className="input-field">
                {EDITOR_THEMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="card">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-primary-600" /> Editor
          </h2>
          <div>
            <label className="block text-sm font-medium mb-2">Font Size</label>
            <div className="flex flex-wrap gap-2">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => handleChange('font_size', size)}
                  className={`w-12 h-10 rounded-lg border-2 text-sm font-medium transition-colors ${
                    form.font_size === size
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="card">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary-600" /> Language
          </h2>
          <select value={form.language} onChange={(e) => handleChange('language', e.target.value)} className="input-field">
            {LANGUAGES_LIST.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {/* Autosave */}
        <div className="card">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-600" /> Behavior
          </h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => handleChange('autosave', form.autosave ? 0 : 1)}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.autosave ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.autosave ? 'translate-x-6' : ''}`} />
            </div>
            <div>
              <p className="font-medium">Auto-save analyses</p>
              <p className="text-xs text-gray-500">Automatically save to history after each analysis</p>
            </div>
          </label>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 w-full justify-center">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </DashboardLayout>
  );
}
