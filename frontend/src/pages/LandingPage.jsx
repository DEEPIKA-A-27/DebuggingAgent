import { Link } from 'react-router-dom';
import { Bug, Code2, Brain, Shield, Zap, Globe, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const features = [
  {
    icon: Code2,
    title: 'Multi-Language Support',
    description: 'Debug code in Java, Python, C++, and JavaScript with language-specific AI analysis.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Automatic syntax and logical error detection with beginner-friendly explanations.',
  },
  {
    icon: Zap,
    title: 'Code Optimization',
    description: 'Get optimized code with detailed explanations of improvements and best practices.',
  },
  {
    icon: Shield,
    title: 'Test Case Generation',
    description: 'Automatically generate normal, boundary, and edge test cases with expected outputs.',
  },
];

const techStack = [
  'React.js', 'Tailwind CSS', 'Monaco Editor', 'Node.js',
  'Express.js', 'MySQL', 'Gemini LLM', 'Docker',
];

export default function LandingPage() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Bug className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl">AI Debugging Agent</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/login" className="btn-secondary">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
          <Globe className="w-4 h-4" />
          Powered by Google Gemini LLM
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          AI Debugging Agent
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
          Automatically detect errors, explain them in simple language, generate corrected and optimized code,
          create test cases, and get learning recommendations — all powered by AI.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="btn-primary text-lg px-8 py-3">Start Debugging</Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-3">Sign In</Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg w-fit mb-4">
                <Icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Technology Stack</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-center text-gray-500 text-sm">
        <p>AI Debugging Agent — Final Year Project</p>
      </footer>
    </div>
  );
}
