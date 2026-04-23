import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import SkillGap from '../components/SkillGap';
import ResumeAnalyzer from '../components/ResumeAnalyzer';
import Roadmap from '../components/Roadmap';
import AICoach from '../components/AICoach';
import DailyProgress from '../components/DailyProgress';
import OnboardingModal from '../components/OnboardingModal';

const Dashboard = ({ darkMode, setDarkMode }) => {
  const [activeTab, setActiveTab] = useState('resume');
  const [userEmail, setUserEmail] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  // Check authentication and get user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    
    if (!token || !email) {
      navigate('/login');
      return;
    }
    
    setUserEmail(email);
    
    // Load all user data from backend
    const loadUserData = async () => {
      try {
        // Clear old localStorage data first
        localStorage.removeItem('resumeAnalysis');
        localStorage.removeItem('skillGapAnalysis');
        localStorage.removeItem('roadmapData');
        
        const response = await axios.get(`http://localhost:8000/api/auth/user/${email}`);
        const userData = response.data;
        
        // Save ONLY this user's data to localStorage
        if (userData.resume_analysis) {
          localStorage.setItem('resumeAnalysis', JSON.stringify(userData.resume_analysis));
        }
        if (userData.skill_gap_analysis) {
          localStorage.setItem('skillGapAnalysis', JSON.stringify(userData.skill_gap_analysis));
        }
        if (userData.roadmap_data) {
          localStorage.setItem('roadmapData', JSON.stringify(userData.roadmap_data));
        }
        
        // Update progress
        setProgress(getProgress());
        
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    
    loadUserData();
    
    // Check if first time user
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [navigate]);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  // Calculate progress and check if steps are unlocked
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
      resumeCompleted: !!resumeData,
      skillGapCompleted: !!skillGapData,
      roadmapCompleted: !!roadmapData
    };
  };

  const [progress, setProgress] = useState(getProgress());

  // Listen for storage changes to update progress
  useEffect(() => {
    const handleStorageChange = () => {
      setProgress(getProgress());
    };

    // Check progress every second (simple polling)
    const interval = setInterval(handleStorageChange, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle tab change with locking logic
  const handleTabChange = (tab) => {
    if (tab === 'resume' || tab === 'ai-coach' || tab === 'progress') {
      setActiveTab(tab);
    } else if (tab === 'skill-gap') {
      if (!progress.resumeCompleted) {
        alert('🔒 Please upload and analyze your resume first!');
        return;
      }
      setActiveTab(tab);
    } else if (tab === 'roadmap') {
      if (!progress.resumeCompleted) {
        alert('🔒 Please upload and analyze your resume first!');
        return;
      }
      if (!progress.skillGapCompleted) {
        alert('🔒 Please complete the Skill Gap Analysis first!');
        return;
      }
      setActiveTab(tab);
    }
  };

  const handleLogout = () => {
    // Clear ALL user-specific data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('user');
    localStorage.removeItem('resumeAnalysis');
    localStorage.removeItem('skillGapAnalysis');
    localStorage.removeItem('roadmapData');
    localStorage.removeItem('onboardingCompleted');
    navigate('/login');
  };

  const pageVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      x: 50,
      transition: {
        duration: 0.3
      }
    }
  };

  const renderContent = () => {
    const components = {
      'resume': <ResumeAnalyzer darkMode={darkMode} userEmail={userEmail} setUserEmail={setUserEmail} />,
      'skill-gap': <SkillGap darkMode={darkMode} userEmail={userEmail} />,
      'roadmap': <Roadmap darkMode={darkMode} userEmail={userEmail} />,
      'ai-coach': <AICoach darkMode={darkMode} userEmail={userEmail} />,
      'progress': <DailyProgress darkMode={darkMode} userEmail={userEmail} />
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {components[activeTab] || components['resume']}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50'}`}>
      {/* Onboarding Modal */}
      <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 ${darkMode ? 'bg-gray-800/80 backdrop-blur-lg border-gray-700' : 'bg-white/80 backdrop-blur-lg border-gray-200'} border-b shadow-lg`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl shadow-lg"
              >
                🚀
              </motion.div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                GenAI Career Copilot
              </h1>
            </motion.div>

            <div className="flex items-center space-x-4">
              {userEmail && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`px-4 py-2 rounded-full ${darkMode ? 'bg-purple-900/50 text-purple-200' : 'bg-purple-100 text-purple-900'} text-sm font-medium`}
                >
                  👤 {userEmail}
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className={`px-4 py-2 rounded-full ${darkMode ? 'bg-red-900/50 text-red-200 hover:bg-red-900/70' : 'bg-red-100 text-red-900 hover:bg-red-200'} text-sm font-medium transition-all`}
              >
                Logout
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-800'} hover:shadow-lg transition-all`}
              >
                {darkMode ? '☀️' : '🌙'}
              </motion.button>
            </div>
          </div>

          {/* Progress Stepper */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {/* Step 1: Resume */}
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  progress.completed >= 1 
                    ? 'bg-green-500 text-white' 
                    : activeTab === 'resume'
                    ? 'bg-purple-500 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                } font-bold transition-all`}>
                  {progress.completed >= 1 ? '✓' : '1'}
                </div>
                <span className={`ml-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Resume
                </span>
              </div>

              {/* Connector */}
              <div className={`flex-1 h-1 mx-4 rounded ${
                progress.completed >= 2 ? 'bg-green-500' : darkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`} />

              {/* Step 2: Skill Gap */}
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  progress.completed >= 2 
                    ? 'bg-green-500 text-white' 
                    : activeTab === 'skill-gap'
                    ? 'bg-purple-500 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                } font-bold transition-all`}>
                  {progress.completed >= 2 ? '✓' : '2'}
                </div>
                <span className={`ml-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Skill Gap
                </span>
              </div>

              {/* Connector */}
              <div className={`flex-1 h-1 mx-4 rounded ${
                progress.completed >= 3 ? 'bg-green-500' : darkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`} />

              {/* Step 3: Roadmap */}
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  progress.completed >= 3 
                    ? 'bg-green-500 text-white' 
                    : activeTab === 'roadmap'
                    ? 'bg-purple-500 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                } font-bold transition-all`}>
                  {progress.completed >= 3 ? '✓' : '3'}
                </div>
                <span className={`ml-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Roadmap
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className={`mt-4 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>

            {/* Progress Text */}
            <p className={`text-center text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {progress.completed === 0 && "Let's start your journey! 🚀"}
              {progress.completed === 1 && "Great start! Keep going 💪"}
              {progress.completed === 2 && "Almost there! One more step 🌟"}
              {progress.completed === 3 && "Journey complete! 🎉"}
            </p>
          </motion.div>
        </div>
      </motion.header>

      <div className="flex relative z-10">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          darkMode={darkMode} 
          progress={progress}
        />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
