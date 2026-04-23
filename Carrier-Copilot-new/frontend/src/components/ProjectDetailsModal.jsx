import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProjectDetailsModal = ({ project, targetRole, darkMode, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProjectDetails();
  }, [project]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/project-details', {
        project_title: project.title,
        target_role: targetRole,
        skills_to_practice: project.skills_used || [],
        difficulty: project.difficulty || 'intermediate'
      });
      setDetails(response.data);
    } catch (error) {
      toast.error('Failed to load project details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-8`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className={`ml-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Generating project details...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!details) return null;

  const tabs = [
    { id: 'overview', label: '📋 Overview', icon: '📋' },
    { id: 'features', label: '✨ Features', icon: '✨' },
    { id: 'tech', label: '🛠️ Tech Stack', icon: '🛠️' },
    { id: 'guide', label: '📖 Step-by-Step', icon: '📖' },
    { id: 'resources', label: '🔗 Resources', icon: '🔗' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {details.title}
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {details.tagline}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  details.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                  details.difficulty === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {details.difficulty}
                </span>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ⏱️ {details.estimated_hours} hours
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-700 transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  📝 Description
                </h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {details.description}
                </p>
              </div>

              <div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  🎯 Learning Outcomes
                </h3>
                <ul className="space-y-2">
                  {details.learning_outcomes.map((outcome, i) => (
                    <li key={i} className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  💡 Portfolio Tips
                </h3>
                <div className="space-y-2">
                  {details.portfolio_tips.map((tip, i) => (
                    <div key={i} className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                      <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        💡 {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              {details.features.map((feature, i) => (
                <div key={i} className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {feature.name}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      feature.priority === 'must-have' 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {feature.priority}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {feature.description}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    ⏱️ ~{feature.estimated_hours} hours
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tech' && (
            <div className="space-y-6">
              {Object.entries(details.tech_stack).map(([category, technologies]) => (
                <div key={category}>
                  <h3 className={`text-lg font-bold mb-3 capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech, i) => (
                      <span
                        key={i}
                        className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-6">
              {details.step_by_step_guide.map((step, i) => (
                <div key={i} className={`p-5 rounded-lg border-l-4 ${
                  darkMode ? 'bg-gray-700/50 border-primary' : 'bg-gray-50 border-primary'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {step.title}
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ⏱️ {step.estimated_time}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-3">
                    {step.tasks.map((task, j) => (
                      <li key={j} className={`flex items-start gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-primary mt-0.5">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    {step.resources.map((resource, j) => (
                      <span key={j} className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                        📚 {resource}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  🚀 GitHub Starter Repos
                </h3>
                <div className="space-y-3">
                  {details.github_starter_repos.map((repo, i) => (
                    <a
                      key={i}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block p-4 rounded-lg border hover:border-primary transition-all ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <p className={`font-medium mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {repo.name}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {repo.description}
                      </p>
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ⚠️ Common Challenges & Solutions
                </h3>
                <div className="space-y-3">
                  {details.common_challenges.map((item, i) => (
                    <div key={i} className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900/20 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <p className={`font-medium mb-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        ⚠️ {item.challenge}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-600'}`}>
                        💡 {item.solution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectDetailsModal;
