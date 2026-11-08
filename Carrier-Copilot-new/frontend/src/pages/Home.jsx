import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Target,
  Map,
  Bot,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Compass,
  Layers,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';

const Home = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  const workflowSteps = [
    {
      step: '01',
      title: 'Resume Competency Parsing',
      description:
        'Upload your current technical resume. Our parser identifies your verified skills, frameworks, and domain proficiencies with zero public data exposure.',
      icon: FileText,
    },
    {
      step: '02',
      title: 'Market Gap Benchmarking',
      description:
        'Select any target job position or attach a specific job description. We compare your competencies against real requirements to highlight critical skill gaps.',
      icon: Target,
    },
    {
      step: '03',
      title: 'Personalized Study Roadmap',
      description:
        'Receive an adaptive week-by-week curriculum with curated resources, estimated study hours, and production-ready portfolio project blueprints.',
      icon: Map,
    },
  ];

  const platformCapabilities = [
    {
      title: 'Context-Aware AI Mentor',
      description:
        'Chat with an intelligent coach trained on your specific career gaps, project questions, and interview preparation.',
      icon: Bot,
    },
    {
      title: 'Hands-On Capstone Projects',
      description:
        'Complete realistic project specifications with architectural diagrams, starter templates, and portfolio presentation tips.',
      icon: Layers,
    },
    {
      title: 'Daily Momentum & Streaks',
      description:
        'Log study hours, track milestones, and maintain consistency with verified accountability metrics.',
      icon: Compass,
    },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#09090B] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#18181B]'}`}>
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#111113]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Career Copilot
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {setDarkMode && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title={darkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
              </button>
            )}

            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Sign in
            </Link>

            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Intelligent Career Transition Workspace</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15]">
          Navigate from your current skills to your target technical position.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Upload your resume, benchmark genuine skill gaps against industry requirements, and follow an adaptive learning curriculum with AI mentorship.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <span>Open Career Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            Create Free Account
          </Link>
        </div>

        {/* Value Bullet Points */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Strict privacy — resume analyzed securely</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Real industry role benchmarks</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Hands-on portfolio project blueprints</span>
          </div>
        </div>
      </section>

      {/* 3-Step Guided Journey Section */}
      <section className="py-16 px-4 sm:px-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              The Framework
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
              A structured 3-step transition pathway
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Every step builds directly upon the previous to keep your focus strictly on what matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="p-6 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-zinc-400 font-mono">
                      {step.step}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                      {step.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-2">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-16 px-4 sm:px-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Workspace Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
              Everything required to execute your transition
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platformCapabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 space-y-3"
                >
                  <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 inline-block">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Ready to evaluate your career transition?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
            Upload your resume and access your personalized skill gap analysis immediately.
          </p>
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
        <p>Career Copilot — Designed for deliberate technical career development.</p>
      </footer>
    </div>
  );
};

export default Home;
