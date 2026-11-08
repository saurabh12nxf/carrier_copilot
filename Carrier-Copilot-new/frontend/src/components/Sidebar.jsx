import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Target,
  Map,
  Bot,
  Activity,
  Lock,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

const Sidebar = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  progress,
  collapsed = false,
  setCollapsed,
  onLogout,
  user,
}) => {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      locked: false,
      description: 'Career readiness summary',
    },
    {
      id: 'resume',
      label: 'Resume Analyzer',
      icon: FileText,
      badge: !progress?.resumeCompleted ? 'Step 1' : 'Done',
      badgeColor: progress?.resumeCompleted ? 'emerald' : 'indigo',
      locked: false,
      description: 'Extract skills with AI',
    },
    {
      id: 'skill-gap',
      label: 'Skill Gap Analysis',
      icon: Target,
      badge: progress?.skillGapCompleted ? 'Done' : progress?.resumeCompleted ? 'Step 2' : null,
      badgeColor: progress?.skillGapCompleted ? 'emerald' : 'indigo',
      locked: !progress?.resumeCompleted,
      description: 'Compare against market roles',
    },
    {
      id: 'roadmap',
      label: 'Learning Roadmap',
      icon: Map,
      badge: progress?.roadmapCompleted ? 'Done' : progress?.skillGapCompleted ? 'Step 3' : null,
      badgeColor: progress?.roadmapCompleted ? 'emerald' : 'indigo',
      locked: !progress?.skillGapCompleted,
      description: 'Week-by-week curriculum',
    },
    {
      id: 'ai-coach',
      label: 'AI Career Coach',
      icon: Bot,
      badge: 'Interactive',
      badgeColor: 'zinc',
      locked: false,
      description: 'Real-time mentorship & Q&A',
    },
    {
      id: 'progress',
      label: 'My Progress',
      icon: Activity,
      badge: null,
      locked: false,
      description: 'Activity logs & streaks',
    },
  ];

  const displayName = user?.name || 'Professional User';
  const displayEmail = user?.email || 'user@example.com';
  const avatarLetter = (displayName[0] || 'U').toUpperCase();

  return (
    <aside
      className={`relative z-20 flex flex-col h-screen border-r transition-all duration-200 select-none ${
        collapsed ? 'w-20' : 'w-72'
      } bg-white dark:bg-[#111113] border-zinc-200 dark:border-zinc-800`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-200 dark:border-zinc-800">
        <div
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 overflow-hidden cursor-pointer group"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 transition-transform group-hover:scale-105 shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400 dark:text-indigo-600" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
                Career Copilot
              </span>
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                AI Career Workspace
              </span>
            </div>
          )}
        </div>

        {setCollapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
            Navigation
          </div>
        )}

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!tab.locked) setActiveTab(tab.id);
              }}
              disabled={tab.locked}
              title={collapsed ? tab.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative text-left ${
                isActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : tab.locked
                  ? 'opacity-40 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-indigo-600 dark:bg-indigo-400"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : tab.locked
                    ? 'text-zinc-400'
                    : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
                }`}
              />

              {!collapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{tab.label}</span>
                  {tab.locked ? (
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  ) : tab.badge ? (
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        tab.badgeColor === 'emerald'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                          : tab.badgeColor === 'indigo'
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Profile & Actions */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        {/* Theme Switch & Quick Actions */}
        <div className="flex items-center justify-between px-1">
          {setDarkMode && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 p-1.5 rounded-md text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={darkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
              {!collapsed && <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>}
            </button>
          )}

          {onLogout && !collapsed && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 p-1.5 text-xs font-medium text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Sign out of account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs shrink-0 shadow-sm">
            {avatarLetter}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {displayEmail}
              </p>
            </div>
          )}
          {collapsed && onLogout && (
            <button
              onClick={onLogout}
              className="p-1 text-zinc-400 hover:text-red-500"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
