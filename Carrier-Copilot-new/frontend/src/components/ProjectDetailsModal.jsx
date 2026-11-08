import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  ListChecks,
  Cpu,
  FileCode,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
} from 'lucide-react';
import api from '../services/api';

const ProjectDetailsModal = ({ project, targetRole, darkMode, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const response = await api.post('/api/project-details', {
          project_title: project.title,
          target_role: targetRole,
          skills_to_practice: project.skills_used || [],
          difficulty: project.difficulty || 'intermediate',
        });
        setDetails(response.data);
      } catch (error) {
        console.error('Failed to load project details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (project) {
      fetchProjectDetails();
    }
  }, [project, targetRole]);

  if (!project) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'features', label: 'Key Features', icon: ListChecks },
    { id: 'tech', label: 'Tech Stack', icon: Cpu },
    { id: 'guide', label: 'Implementation Guide', icon: FileCode },
    { id: 'resources', label: 'Starters & Tips', icon: ExternalLink },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-4xl max-h-[88vh] flex flex-col rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 shrink-0">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-md">
                {project.title}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Portfolio Capstone Project Specification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto bg-zinc-50/50 dark:bg-zinc-900/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Synthesizing architectural specifications...
              </p>
            </div>
          ) : !details ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              Could not retrieve full details for this project.
            </div>
          ) : (
            <>
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-md font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 uppercase">
                      {details.difficulty || project.difficulty || 'Intermediate'}
                    </span>
                    {details.estimated_hours && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>~{details.estimated_hours} Hours</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Executive Summary
                    </h4>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {details.description || details.tagline || project.description}
                    </p>
                  </div>

                  {details.learning_outcomes && details.learning_outcomes.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                        Target Learning Outcomes
                      </h4>
                      <ul className="space-y-1.5">
                        {details.learning_outcomes.map((outcome, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Key Features */}
              {activeTab === 'features' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Required Functional Requirements
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {details.features && details.features.map((feature, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5"
                      >
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                          {i + 1}.
                        </span>
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Tech Stack */}
              {activeTab === 'tech' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Recommended Architecture Stack
                  </h4>
                  {details.tech_stack && typeof details.tech_stack === 'object' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(details.tech_stack).map(([category, techs], i) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2"
                        >
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                            {category}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(Array.isArray(techs) ? techs : [techs]).map((t, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2.5 py-1 rounded bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400">Architecture details not specified.</p>
                  )}
                </div>
              )}

              {/* Tab 4: Step-by-Step Guide */}
              {activeTab === 'guide' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Sequential Build Plan
                  </h4>
                  {details.step_by_step_guide && details.step_by_step_guide.map((step, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-1"
                    >
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Step {i + 1}
                      </span>
                      <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 5: Starters & Tips */}
              {activeTab === 'resources' && (
                <div className="space-y-5">
                  {details.github_starter_repos && details.github_starter_repos.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                        Starter Repositories & References
                      </h4>
                      <div className="space-y-2">
                        {details.github_starter_repos.map((repo, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                              {repo}
                            </span>
                            <span className="text-[11px] text-zinc-400">Template</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {details.portfolio_tips && details.portfolio_tips.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                        Portfolio Presentation Tips
                      </h4>
                      <ul className="space-y-1.5">
                        {details.portfolio_tips.map((tip, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Close Action */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end bg-zinc-50/50 dark:bg-zinc-900/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors"
          >
            Close Specification
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetailsModal;
