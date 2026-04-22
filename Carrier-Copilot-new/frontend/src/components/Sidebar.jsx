import React from 'react';
import { motion } from 'framer-motion';

const Sidebar = ({ activeTab, setActiveTab, darkMode, progress }) => {
  const tabs = [
    { id: 'resume', label: 'Resume Analyzer', icon: '📄', badge: 'Start Here', color: 'from-green-500 to-emerald-500', locked: false },
    { id: 'skill-gap', label: 'Skill Gap Analysis', icon: '📊', color: 'from-blue-500 to-cyan-500', locked: !progress?.resumeCompleted },
    { id: 'roadmap', label: 'Personalized Roadmap', icon: '🗺️', color: 'from-purple-500 to-pink-500', locked: !progress?.skillGapCompleted }
  ];

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className={`w-80 min-h-screen ${darkMode ? 'bg-gray-800/50 backdrop-blur-lg border-gray-700' : 'bg-white/50 backdrop-blur-lg border-gray-200'} border-r p-6 space-y-4`}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Your AI-powered career journey
        </p>
      </motion.div>

      {tabs.map((tab, index) => (
        <motion.button
          key={tab.id}
          variants={itemVariants}
          whileHover={!tab.locked ? { scale: 1.05, x: 10 } : {}}
          whileTap={!tab.locked ? { scale: 0.95 } : {}}
          onClick={() => setActiveTab(tab.id)}
          disabled={tab.locked}
          className={`w-full text-left p-4 rounded-xl transition-all relative overflow-hidden group ${
            tab.locked
              ? darkMode
                ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              : activeTab === tab.id
              ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl`
              : darkMode
              ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {/* Animated Background on Hover */}
          {activeTab !== tab.id && !tab.locked && (
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-0 group-hover:opacity-10 transition-opacity`}
            />
          )}

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.span
                animate={activeTab === tab.id ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="text-2xl"
              >
                {tab.locked ? '🔒' : tab.icon}
              </motion.span>
              <div>
                <div className="font-semibold">{tab.label}</div>
                {tab.badge && activeTab !== tab.id && !tab.locked && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full"
                  >
                    {tab.badge}
                  </motion.span>
                )}
                {tab.locked && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs text-gray-500"
                  >
                    Complete previous step
                  </motion.span>
                )}
              </div>
            </div>

            {activeTab === tab.id && !tab.locked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-white rounded-full"
              />
            )}
          </div>

          {/* Progress Indicator */}
          {activeTab === tab.id && !tab.locked && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      ))}

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`mt-8 p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'}`}
      >
        <h3 className={`font-semibold mb-3 ${darkMode ? 'text-purple-300' : 'text-purple-900'}`}>
          🎯 Quick Stats
        </h3>
        <div className="space-y-2 text-sm">
          <div className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span>RAG Powered</span>
            <span className="font-semibold text-green-500">✓ Active</span>
          </div>
          <div className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span>AI Model</span>
            <span className="font-semibold text-green-500">✓ Gemini</span>
          </div>
          <div className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span>Vector DB</span>
            <span className="font-semibold text-green-500">✓ ChromaDB</span>
          </div>
        </div>
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className={`mt-4 p-4 rounded-xl ${darkMode ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}
      >
        <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
          💡 <strong>Tip:</strong> Start by uploading your resume, then analyze your skill gaps!
        </p>
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;
