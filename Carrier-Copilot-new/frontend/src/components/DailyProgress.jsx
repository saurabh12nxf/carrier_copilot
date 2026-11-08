import React, { useState, useEffect } from 'react';
import {
  Flame,
  Award,
  Clock,
  Plus,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Activity,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

const DailyProgress = ({ darkMode, userEmail }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState('');
  const [hours, setHours] = useState(1);
  const [logSuccess, setLogSuccess] = useState('');

  useEffect(() => {
    loadProgress();
  }, [userEmail]);

  const loadProgress = async () => {
    const email = userEmail || localStorage.getItem('userEmail');
    if (!email) return;

    try {
      const response = await api.get(`/api/progress/progress/${encodeURIComponent(email)}`);
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to load progress tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (e) => {
    e.preventDefault();
    const email = userEmail || localStorage.getItem('userEmail');
    if (!email || !topic.trim()) return;

    setLogSuccess('');
    try {
      const response = await api.post('/api/progress/log-activity', {
        email,
        topic: topic.trim(),
        hours: parseFloat(hours),
      });

      setTopic('');
      setHours(1);
      loadProgress();
      setLogSuccess(`Activity logged! Current streak: ${response.data.streak} days`);
      setTimeout(() => setLogSuccess(''), 4000);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading progress history...</p>
      </div>
    );
  }

  const activities = progress?.activities || [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
            Accountability
          </span>
          <span className="text-xs text-zinc-400">•</span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Velocity & Streaks</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
          Daily Progress Tracker
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Record your daily study hours, maintain learning streaks, and track cumulative effort.
        </p>
      </div>

      {logSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{logSuccess}</span>
        </div>
      )}

      {/* Streak Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Current Streak */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {progress?.current_streak || 0}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">consecutive days</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3">
            {(progress?.current_streak || 0) > 0 ? 'Consistent momentum maintained' : 'Log study time to start streak'}
          </p>
        </div>

        {/* Metric 2: Record Streak */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Record Streak</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {progress?.longest_streak || 0}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">all-time best</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3">
            Target record to beat: {progress?.longest_streak || 0} days
          </p>
        </div>

        {/* Metric 3: Total Hours */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Investment</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {progress?.total_hours || 0}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">hours logged</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3">
            Cumulative deliberate learning time
          </p>
        </div>
      </div>

      {/* Log Activity Form Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Log Today's Learning Activity
        </h3>

        <form onSubmit={logActivity} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                Topic or Focus Area
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Async programming in Python, PostgreSQL query optimization..."
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                Hours Dedicated
              </label>
              <select
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="0.5">0.5 Hour (30 mins)</option>
                <option value="1">1.0 Hour</option>
                <option value="1.5">1.5 Hours</option>
                <option value="2">2.0 Hours</option>
                <option value="3">3.0 Hours</option>
                <option value="4">4.0+ Hours</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!topic.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Activity</span>
            </button>
          </div>
        </form>
      </div>

      {/* Activity History Table */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Recent Learning Sessions
        </h3>

        {activities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Focus Topic</th>
                  <th className="pb-3 font-semibold text-right">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {activities.slice(0, 10).map((act, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    <td className="py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {act.date ? new Date(act.date).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {act.topic}
                    </td>
                    <td className="py-3 text-right font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                      {act.hours}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-zinc-400">
            No study sessions logged yet. Record your first session above.
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyProgress;
