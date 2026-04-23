import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProjectDetailsModal from './ProjectDetailsModal';

const RoadmapWeekly = ({ roadmap, darkMode }) => {
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [trackingData, setTrackingData] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const email = userEmail || localStorage.getItem('userEmail');
      if (!email) return;

      const response = await axios.get(`http://localhost:8000/api/roadmap/progress/${email}`);
      if (response.data.initialized) {
        setTrackingData(response.data.tracking_data);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const markWeekComplete = async (weekNum, hoursSpent = 0) => {
    try {
      const email = userEmail || localStorage.getItem('userEmail');
      if (!email) {
        toast.error('Please log in first');
        return;
      }

      const response = await axios.post('http://localhost:8000/api/roadmap/mark-week-complete', {
        email,
        week_num: weekNum,
        hours_spent: hoursSpent
      });

      setTrackingData(response.data.tracking_data);
      
      const summary = response.data.progress_summary;
      toast.success(`🎉 Week ${weekNum} completed! ${summary.recommendation}`);

      if (response.data.should_adjust) {
        toast.info('💡 Your pace suggests we could adjust your roadmap. Keep going!');
      }
    } catch (error) {
      toast.error('Failed to mark week complete');
      console.error(error);
    }
  };

  const markTaskComplete = async (weekNum, taskIndex) => {
    try {
      const email = userEmail || localStorage.getItem('userEmail');
      if (!email) return;

      const response = await axios.post('http://localhost:8000/api/roadmap/mark-task-complete', {
        email,
        week_num: weekNum,
        task_index: taskIndex
      });

      setTrackingData(response.data.tracking_data);
      toast.success('✓ Task completed!');
    } catch (error) {
      console.error('Failed to mark task complete:', error);
    }
  };

  const isWeekCompleted = (weekNum) => {
    if (!trackingData || !trackingData.week_progress) return false;
    return trackingData.week_progress[weekNum]?.completed || false;
  };

  const isTaskCompleted = (weekNum, taskIndex) => {
    if (!trackingData || !trackingData.week_progress) return false;
    const weekProgress = trackingData.week_progress[weekNum];
    return weekProgress?.tasks_completed?.includes(taskIndex) || false;
  };

  if (!roadmap || !roadmap.weekly_plan) {
    return null;
  }

  const phases = [...new Set(roadmap.weekly_plan.map(w => w.phase))];
  const filteredWeeks = selectedPhase === 'all' 
    ? roadmap.weekly_plan 
    : roadmap.weekly_plan.filter(w => w.phase === selectedPhase);

  const phaseColors = {
    'Foundation': 'from-green-500 to-emerald-500',
    'Intermediate': 'from-blue-500 to-cyan-500',
    'Advanced': 'from-purple-500 to-pink-500'
  };

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      {trackingData && (
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500' : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'} shadow-lg`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Your Progress
            </h3>
            <span className={`px-4 py-2 rounded-full font-bold text-lg ${
              trackingData.pace_status === 'fast' ? 'bg-green-500 text-white' :
              trackingData.pace_status === 'slow' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'
            }`}>
              {trackingData.velocity}x
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {trackingData.completed_weeks.length}/{trackingData.total_weeks}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Week</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {trackingData.current_week}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hours Spent</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {trackingData.total_hours_spent}h
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Time Left</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {trackingData.adjusted_timeline}
              </p>
            </div>
          </div>

          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {trackingData.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Timeline Header */}
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500' : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'} shadow-lg`}>
        <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📅 {roadmap.timeline} Learning Plan
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {roadmap.total_weeks} weeks • {Math.round(roadmap.total_weeks * 2.5)} hours/week • {roadmap.completion_percentage}% current readiness
        </p>
      </div>

      {/* Phase Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedPhase('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedPhase === 'all'
              ? 'bg-primary text-white'
              : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Weeks
        </button>
        {phases.map(phase => (
          <button
            key={phase}
            onClick={() => setSelectedPhase(phase)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedPhase === phase
                ? `bg-gradient-to-r ${phaseColors[phase]} text-white`
                : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* Weekly Timeline */}
      <div className="space-y-4">
        {filteredWeeks.map((week, index) => (
          <motion.div
            key={week.week}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 ${
              week.phase === 'Foundation' ? 'border-green-500' :
              week.phase === 'Intermediate' ? 'border-blue-500' : 'border-purple-500'
            }`}
          >
            {/* Week Header */}
            <div
              onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
              className={`p-4 cursor-pointer hover:bg-opacity-80 transition-all ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${phaseColors[week.phase]} flex items-center justify-center text-white font-bold text-lg relative`}>
                    {isWeekCompleted(week.week) && (
                      <div className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center">
                        ✓
                      </div>
                    )}
                    {!isWeekCompleted(week.week) && week.week}
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {week.focus}
                      {isWeekCompleted(week.week) && (
                        <span className="ml-2 text-green-500">✓</span>
                      )}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {week.phase} • {week.hours_per_day}h/day
                      {isWeekCompleted(week.week) && (
                        <span className="ml-2 text-green-500">• Completed</span>
                      )}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedWeek === week.week ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Week Details (Expandable) */}
            <AnimatePresence>
              {expandedWeek === week.week && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="p-4 space-y-4">
                    {/* Topics */}
                    {week.topics && week.topics.length > 0 && (
                      <div>
                        <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          📚 Topics to Cover:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {week.topics.map((topic, i) => (
                            <span
                              key={i}
                              className={`px-3 py-1 rounded-full text-sm ${
                                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Daily Tasks */}
                    {week.daily_tasks && week.daily_tasks.length > 0 && (
                      <div>
                        <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          ✅ Daily Tasks:
                        </p>
                        <ul className="space-y-2">
                          {week.daily_tasks.map((task, i) => (
                            <li
                              key={i}
                              className={`flex items-start gap-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              <input
                                type="checkbox"
                                checked={isTaskCompleted(week.week, i)}
                                onChange={() => markTaskComplete(week.week, i)}
                                disabled={isWeekCompleted(week.week)}
                                className="mt-1 w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
                              />
                              <span className={isTaskCompleted(week.week, i) ? 'line-through opacity-60' : ''}>
                                {task}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Deliverable */}
                    {week.deliverable && (
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/20 border border-green-500' : 'bg-green-50 border border-green-200'}`}>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                          🎯 Week Goal: {week.deliverable}
                        </p>
                      </div>
                    )}

                    {/* Mark Week Complete Button */}
                    {!isWeekCompleted(week.week) && (
                      <button
                        onClick={() => {
                          const hours = prompt('How many hours did you spend this week?', week.hours_per_day * 5);
                          if (hours) markWeekComplete(week.week, parseFloat(hours));
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                      >
                        ✓ Mark Week {week.week} Complete
                      </button>
                    )}

                    {/* Resources */}
                    {week.verified_resources && week.verified_resources.length > 0 && (
                      <div>
                        <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          🔗 Learning Resources:
                        </p>
                        <div className="space-y-2">
                          {week.verified_resources.map((resource, i) => (
                            <a
                              key={i}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`block p-2 rounded-lg hover:bg-opacity-80 transition-all ${
                                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                              }`}
                            >
                              <p className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {resource.title}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {resource.type} • {resource.url}
                              </p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Milestones */}
      {roadmap.milestones && roadmap.milestones.length > 0 && (
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h4 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🏆 Milestones
          </h4>
          <div className="space-y-3">
            {roadmap.milestones.map((milestone, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {milestone.title}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {milestone.achievement}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    Week {milestone.week}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {roadmap.projects && roadmap.projects.length > 0 && (
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h4 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            💻 Portfolio Projects
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {roadmap.projects.map((project, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border-2 ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
              >
                <p className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {project.title}
                </p>
                <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.skills_used.slice(0, 3).map((skill, j) => (
                    <span
                      key={j}
                      className="px-2 py-1 bg-primary text-white rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Week {project.week}
                  </p>
                  <button
                    onClick={() => setSelectedProject({ ...project, targetRole: roadmap.target_role || 'Developer' })}
                    className="px-3 py-1 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                  >
                    📖 View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailsModal
            project={selectedProject}
            targetRole={selectedProject.targetRole}
            darkMode={darkMode}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoadmapWeekly;
