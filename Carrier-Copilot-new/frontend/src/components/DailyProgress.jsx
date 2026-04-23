import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const DailyProgress = ({ darkMode, userEmail }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState('');
  const [hours, setHours] = useState(0.5);

  useEffect(() => {
    loadProgress();
  }, [userEmail]);

  const loadProgress = async () => {
    const email = userEmail || localStorage.getItem('userEmail');
    if (!email) return;

    try {
      const response = await axios.get(`http://localhost:8000/api/progress/progress/${email}`);
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async () => {
    const email = userEmail || localStorage.getItem('userEmail');
    if (!email || !topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/progress/log-activity', {
        email,
        topic,
        hours: parseFloat(hours)
      });

      setTopic('');
      setHours(0.5);
      loadProgress();

      if (response.data.goal_met) {
        alert(`🎉 Daily goal completed! Streak: ${response.data.streak} days 🔥`);
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
      alert('Failed to log activity');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📊 Daily Progress Tracker
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Track your learning, build streaks, and stay consistent
        </p>
      </div>

      {/* Streak Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500' : 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200'} shadow-lg`}
        >
          <div className="text-4xl mb-2">🔥</div>
          <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {progress?.current_streak || 0}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Day Streak
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500' : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'} shadow-lg`}
        >
          <div className="text-4xl mb-2">🏆</div>
          <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {progress?.longest_streak || 0}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Longest Streak
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-green-900/30 to-teal-900/30 border border-green-500' : 'bg-gradient-to-br from-green-50 to-teal-50 border border-green-200'} shadow-lg`}
        >
          <div className="text-4xl mb-2">⏱️</div>
          <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {progress?.total_hours || 0}h
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Hours
          </div>
        </motion.div>
      </div>

      {/* Missed Yesterday Warning */}
      {progress?.missed_yesterday && progress?.current_streak === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-red-900/20 border border-red-500' : 'bg-red-50 border border-red-200'}`}
        >
          <p className={`text-sm font-medium ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
            ⚠️ You missed yesterday — complete today's goal to start a new streak! 🔥
          </p>
        </motion.div>
      )}

      {/* Today's Progress */}
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📅 Today's Progress
        </h3>

        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Daily Goal: {progress?.daily_goal || 2} hours
            </span>
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {progress?.today_hours || 0}h / {progress?.daily_goal || 2}h
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                progress?.today_completed ? 'bg-green-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(((progress?.today_hours || 0) / (progress?.daily_goal || 2)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {progress?.today_completed && (
          <div className={`p-3 rounded-lg mb-4 ${darkMode ? 'bg-green-900/20 border border-green-500' : 'bg-green-50 border border-green-200'}`}>
            <p className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
              ✅ Daily goal completed! Keep the streak going! 🔥
            </p>
          </div>
        )}

        {progress?.today_topics && progress.today_topics.length > 0 && (
          <div className="mb-4">
            <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Topics studied today:
            </p>
            <div className="flex flex-wrap gap-2">
              {progress.today_topics.map((t, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-primary text-white rounded-full text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Log Activity */}
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ➕ Log Today's Activity
        </h3>

        <div className="space-y-4">
          <div>
            <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              What did you study?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., React Hooks, DSA Arrays, Python Basics"
              className={`w-full px-4 py-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-primary focus:border-transparent`}
            />
          </div>

          <div>
            <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Hours spent
            </label>
            <select
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-primary focus:border-transparent`}
            >
              <option value="0.5">30 minutes</option>
              <option value="1">1 hour</option>
              <option value="1.5">1.5 hours</option>
              <option value="2">2 hours</option>
              <option value="2.5">2.5 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="5">5+ hours</option>
            </select>
          </div>

          <button
            onClick={logActivity}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
          >
            ✅ Log Activity
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {progress?.total_days_active || 0}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Days Active
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {progress?.today_topics?.length || 0}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Topics Today
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyProgress;
