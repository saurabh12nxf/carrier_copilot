import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Overview from '../components/Overview';
import ResumeAnalyzer from '../components/ResumeAnalyzer';
import SkillGap from '../components/SkillGap';
import Roadmap from '../components/Roadmap';
import AICoach from '../components/AICoach';
import DailyProgress from '../components/DailyProgress';
import OnboardingModal from '../components/OnboardingModal';

const Dashboard = ({ darkMode, setDarkMode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const navigate = useNavigate();
  const { user, logout, token, completeOnboarding } = useAuth();

  // Calculate real verified progress across core steps
  const getProgress = () => {
    const resumeData = localStorage.getItem('resumeAnalysis');
    const skillGapData = localStorage.getItem('skillGapAnalysis');
    const roadmapData = localStorage.getItem('roadmapData');

    let completed = 0;
    if (resumeData) completed++;
    if (skillGapData) completed++;
    if (roadmapData) completed++;

    return {
      completed,
      total: 3,
      percentage: (completed / 3) * 100,
      resumeCompleted: Boolean(resumeData),
      skillGapCompleted: Boolean(skillGapData),
      roadmapCompleted: Boolean(roadmapData),
    };
  };

  const [progress, setProgress] = useState(getProgress());

  // Check authentication & load verified backend user state
  useEffect(() => {
    const currentToken = token || localStorage.getItem('token');
    const email = user?.email || localStorage.getItem('userEmail');

    if (!currentToken || currentToken === 'dummy-token' || !email) {
      logout();
      navigate('/login');
      return;
    }

    setUserEmail(email);

    const loadUserData = async () => {
      try {
        let userData = null;
        try {
          const meResponse = await api.get('/api/auth/me');
          userData = meResponse.data?.data || meResponse.data;
        } catch {
          try {
            const response = await api.get(`/api/auth/user/${encodeURIComponent(email)}`);
            userData = response.data;
          } catch (e2) {
            if (e2?.response?.status === 401) {
              logout();
              navigate('/login');
              return;
            }
          }
        }

        if (userData) {
          if (userData.resume_analysis) {
            localStorage.setItem('resumeAnalysis', JSON.stringify(userData.resume_analysis));
          } else {
            localStorage.removeItem('resumeAnalysis');
          }

          if (userData.skill_gap_analysis) {
            localStorage.setItem('skillGapAnalysis', JSON.stringify(userData.skill_gap_analysis));
          } else {
            localStorage.removeItem('skillGapAnalysis');
          }

          if (userData.roadmap_data) {
            localStorage.setItem('roadmapData', JSON.stringify(userData.roadmap_data));
          } else {
            localStorage.removeItem('roadmapData');
          }

          // First-time onboarding verification
          const isFirstLoginUser =
            userData?.isFirstLogin ??
            userData?.is_first_login ??
            user?.isFirstLogin ??
            user?.is_first_login ??
            false;

          const locallyCompleted =
            localStorage.getItem(`onboardingCompleted_${email}`) === 'true' ||
            localStorage.getItem('onboardingCompleted') === 'true';

          const hasExistingProgress =
            Boolean(userData?.resume_analysis) ||
            Boolean(userData?.progress?.resume_completed);

          if (isFirstLoginUser && !locallyCompleted && !hasExistingProgress) {
            setShowOnboarding(true);
          } else {
            setShowOnboarding(false);
          }
        }

        setProgress(getProgress());
      } catch (error) {
        console.error('Failed to synchronize user state:', error);
      }
    };

    loadUserData();
  }, [navigate, user, token, logout]);

  // Synchronize progress periodically
  useEffect(() => {
    const handleStorageChange = () => {
      setProgress(getProgress());
    };
    const interval = setInterval(handleStorageChange, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleOnboardingClose = async () => {
    setShowOnboarding(false);
    if (completeOnboarding) {
      await completeOnboarding(userEmail);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabLabels = {
    overview: 'Workspace Overview',
    resume: 'Resume Analyzer',
    'skill-gap': 'Skill Gap Analysis',
    roadmap: 'Learning Roadmap',
    'ai-coach': 'AI Career Coach',
    progress: 'My Progress',
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark bg-[#09090B] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#18181B]'}`}>
      {/* Onboarding Modal for First Time Users Only */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        darkMode={darkMode}
        userEmail={userEmail}
      />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          progress={progress}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onLogout={handleLogout}
          user={user}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-72 h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                progress={progress}
                collapsed={false}
                onLogout={handleLogout}
                user={user}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 truncate">
              <span className="hidden sm:inline font-medium text-zinc-600 dark:text-zinc-400">Career Workspace</span>
              <ChevronRight className="hidden sm:inline w-3 h-3 text-zinc-300 dark:text-zinc-600" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {tabLabels[activeTab] || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle (Header Quick Toggle) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={darkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>

            {/* Profile Avatar Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs shadow-sm">
                {(user?.name?.[0] || 'U').toUpperCase()}
              </div>
              <span className="hidden lg:inline text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">
                {user?.name || userEmail}
              </span>
            </div>
          </div>
        </header>

        {/* Viewport Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {activeTab === 'overview' && (
                <Overview
                  user={user}
                  progress={progress}
                  onNavigateTab={handleTabChange}
                />
              )}
              {activeTab === 'resume' && (
                <ResumeAnalyzer
                  darkMode={darkMode}
                  userEmail={userEmail}
                  setUserEmail={setUserEmail}
                />
              )}
              {activeTab === 'skill-gap' && (
                <SkillGap
                  darkMode={darkMode}
                  userEmail={userEmail}
                />
              )}
              {activeTab === 'roadmap' && (
                <Roadmap
                  darkMode={darkMode}
                  userEmail={userEmail}
                />
              )}
              {activeTab === 'ai-coach' && (
                <AICoach
                  darkMode={darkMode}
                  userEmail={userEmail}
                />
              )}
              {activeTab === 'progress' && (
                <DailyProgress
                  darkMode={darkMode}
                  userEmail={userEmail}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
