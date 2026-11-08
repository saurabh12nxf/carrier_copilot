import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  FolderGit2,
  Check,
  Video,
  Code2,
  FileText,
  Target,
} from 'lucide-react';
import ProjectDetailsModal from './ProjectDetailsModal';
import api from '../services/api';

const RoadmapWeekly = ({ roadmap, darkMode }) => {
  // Expand Week 1 by default so content is immediately visible
  const [expandedWeek, setExpandedWeek] = useState(
    roadmap?.weekly_plan?.[0]?.week || 1
  );
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

      const response = await api.get(`/api/roadmap/progress/${encodeURIComponent(email)}`);
      if (response.data.initialized) {
        setTrackingData(response.data.tracking_data);
      }
    } catch (error) {
      console.error('Failed to fetch roadmap progress:', error);
    }
  };

  const markWeekComplete = async (weekNum, hoursSpent = 0) => {
    try {
      const email = userEmail || localStorage.getItem('userEmail');
      if (!email) return;

      const response = await api.post('/api/roadmap/mark-week-complete', {
        email,
        week_num: weekNum,
        hours_spent: hoursSpent,
      });

      setTrackingData(response.data.tracking_data);
    } catch (error) {
      console.error('Failed to mark week complete:', error);
    }
  };

  const markTaskComplete = async (weekNum, taskIndex) => {
    try {
      const email = userEmail || localStorage.getItem('userEmail');
      if (!email) return;

      const response = await api.post('/api/roadmap/mark-task-complete', {
        email,
        week_num: weekNum,
        task_index: taskIndex,
      });

      setTrackingData(response.data.tracking_data);
    } catch (error) {
      console.error('Failed to mark task complete:', error);
    }
  };

  const isWeekCompleted = (weekNum) => {
    if (!trackingData || !trackingData.week_progress) return false;
    return Boolean(trackingData.week_progress[weekNum]?.completed);
  };

  const isTaskCompleted = (weekNum, taskIndex) => {
    if (!trackingData || !trackingData.week_progress) return false;
    const weekProgress = trackingData.week_progress[weekNum];
    return Boolean(weekProgress?.tasks_completed?.includes(taskIndex));
  };

  if (!roadmap || !roadmap.weekly_plan || roadmap.weekly_plan.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800">
        <BookOpen className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          No curriculum generated yet
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          Specify your target role and click Generate Roadmap above.
        </p>
      </div>
    );
  }

  const phases = [...new Set(roadmap.weekly_plan.map((w) => w.phase))];
  const filteredWeeks =
    selectedPhase === 'all'
      ? roadmap.weekly_plan
      : roadmap.weekly_plan.filter((w) => w.phase === selectedPhase);

  // Compute overall progress summary
  const totalWeeks = roadmap.weekly_plan.length;
  const completedWeeksCount = roadmap.weekly_plan.filter((w) => isWeekCompleted(w.week)).length;
  const progressPercent = totalWeeks > 0 ? Math.round((completedWeeksCount / totalWeeks) * 100) : 0;

  // Format resource icon
  const getResourceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'youtube':
      case 'video':
        return <Video className="w-3.5 h-3.5 text-red-500" />;
      case 'github':
        return <Code2 className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Metric Card */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Adaptive Curriculum
            </span>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {roadmap.timeline || `${totalWeeks} weeks total`}
            </span>
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {completedWeeksCount} of {totalWeeks} Weeks Mastered ({progressPercent}%)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Click on any week to view daily study items, key topics, deliverables, and verified resources.
          </p>
        </div>

        <div className="w-full sm:w-48 bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden shrink-0">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Phase Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedPhase('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            selectedPhase === 'all'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
              : 'bg-white dark:bg-[#111113] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
        >
          All Phases ({totalWeeks} wks)
        </button>

        {phases.map((phase) => {
          const count = roadmap.weekly_plan.filter((w) => w.phase === phase).length;
          return (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                selectedPhase === phase
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111113] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
              }`}
            >
              {phase} ({count} wks)
            </button>
          );
        })}
      </div>

      {/* Week Cards Accordion List */}
      <div className="space-y-3">
        {filteredWeeks.map((week) => {
          const isCompleted = isWeekCompleted(week.week);
          const isExpanded = expandedWeek === week.week;

          // Normalize tasks from daily_tasks, tasks, or topics
          const rawTasks = week.daily_tasks || week.tasks || [];
          const tasks = Array.isArray(rawTasks) ? rawTasks : [];
          const completedTasksCount = tasks.filter((_, i) => isTaskCompleted(week.week, i)).length;

          // Normalize title from focus or title
          const rawTitle = week.focus || week.title || `Week ${week.week} Focus`;
          const displayTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

          // Normalize estimated hours
          const estimatedHours =
            week.estimated_hours || (week.hours_per_day ? week.hours_per_day * 5 : 10);

          // Find matching capstone project if available
          const project =
            (roadmap.projects || []).find((p) => p.week === week.week) ||
            week.project ||
            null;

          // Resources list
          const resources = week.verified_resources || [];

          return (
            <div
              key={week.week}
              className={`rounded-xl border transition-all overflow-hidden bg-white dark:bg-[#111113] ${
                isCompleted
                  ? 'border-emerald-200 dark:border-emerald-900/40 shadow-xs'
                  : isExpanded
                  ? 'border-indigo-300 dark:border-indigo-800/80 shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {/* Header Accordion Row */}
              <div
                onClick={() => setExpandedWeek(isExpanded ? null : week.week)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Status Circle */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      markWeekComplete(week.week, estimatedHours);
                    }}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-colors ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                    title={isCompleted ? 'Completed (Click to toggle)' : 'Mark week completed'}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : `W${week.week}`}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {week.phase || 'Curriculum'}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {estimatedHours}h / week
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate mt-0.5">
                      {displayTitle}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {tasks.length > 0 && (
                    <span className="hidden sm:inline-block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {completedTasksCount}/{tasks.length} tasks
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Expandable Week Details Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="border-t border-zinc-100 dark:border-zinc-800/80 px-5 pb-5 pt-4 space-y-5"
                  >
                    {/* Deliverable or Objective Banner */}
                    {(week.deliverable || week.milestone) && (
                      <div className="p-3.5 rounded-lg bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
                        <Target className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-zinc-900 dark:text-zinc-100">Deliverable: </strong>
                          <span>{week.deliverable || week.milestone}</span>
                        </div>
                      </div>
                    )}

                    {/* Key Topics Covered Chips */}
                    {week.topics && week.topics.length > 0 && (
                      <div>
                        <h5 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                          Core Topics
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {week.topics.map((topic, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2.5 py-1 rounded-md font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Daily Action Checklist */}
                    {tasks.length > 0 && (
                      <div>
                        <h5 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                          Daily Action Checklist
                        </h5>
                        <div className="space-y-1.5">
                          {tasks.map((task, taskIdx) => {
                            const taskDone = isTaskCompleted(week.week, taskIdx);
                            return (
                              <div
                                key={taskIdx}
                                onClick={() => markTaskComplete(week.week, taskIdx)}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  taskDone
                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 text-zinc-400 line-through'
                                    : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                                }`}
                              >
                                <button
                                  type="button"
                                  className={`flex items-center justify-center w-4 h-4 rounded border mt-0.5 shrink-0 transition-colors ${
                                    taskDone
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-zinc-300 dark:border-zinc-600'
                                  }`}
                                >
                                  {taskDone && <Check className="w-3 h-3 stroke-[3]" />}
                                </button>
                                <span className="leading-snug">{task}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Verified Curated Resources */}
                    {resources.length > 0 && (
                      <div>
                        <h5 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                          Verified Learning Resources
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors flex items-center justify-between gap-2 group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {getResourceIcon(res.type)}
                                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                  {res.title}
                                </span>
                              </div>
                              <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0 group-hover:text-indigo-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Milestone Project Card (if scheduled for this week) */}
                    {project && (
                      <div className="p-4 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <FolderGit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              Portfolio Capstone Project
                            </span>
                            <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {project.title || 'Hands-On Milestone'}
                            </h5>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                              {project.description}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 shrink-0 shadow-2xs"
                        >
                          <span>View Project Brief</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Completion Toggle Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => markWeekComplete(week.week, estimatedHours)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs ${
                          isCompleted
                            ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Mark as In Progress' : 'Mark Week Complete'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          targetRole={roadmap.target_role}
          darkMode={darkMode}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

export default RoadmapWeekly;
