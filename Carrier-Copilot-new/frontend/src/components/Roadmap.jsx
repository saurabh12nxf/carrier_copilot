import React, { useState, useEffect } from 'react';
import {
  Map,
  Sparkles,
  Target,
  Clock,
  Layers,
  AlertCircle,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import RoadmapWeekly from './RoadmapWeekly';
import api, { formatApiError } from '../services/api';

const Roadmap = ({ darkMode, userEmail }) => {
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Load pre-existing skill gap target role or previous roadmap
    const savedGap = localStorage.getItem('skillGapAnalysis');
    if (savedGap) {
      try {
        const parsedGap = JSON.parse(savedGap);
        if (parsedGap.target_role) {
          setTargetRole(parsedGap.target_role);
        }
      } catch {}
    }

    const savedResult = localStorage.getItem('roadmapData');
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        setResult(parsed);
        if (parsed.target_role) setTargetRole(parsed.target_role);
      } catch {}
    }
  }, []);

  const handleGenerate = async () => {
    const email = userEmail || localStorage.getItem('userEmail');
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please upload your resume first before generating a learning roadmap.');
      return;
    }

    if (!targetRole.trim()) {
      setErrorMsg('Please specify a target role for your curriculum.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/roadmap', {
        email,
        target_role: targetRole.trim(),
      });

      setResult(response.data);
      localStorage.setItem('roadmapData', JSON.stringify(response.data));
    } catch (error) {
      if (error.response?.status === 404) {
        setErrorMsg('Resume profile not found. Please upload your resume in the Resume Analyzer first.');
      } else {
        setErrorMsg(formatApiError(error) || 'Failed to generate curriculum. Verify backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
            Step 3 of 3
          </span>
          <span className="text-xs text-zinc-400">•</span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Curriculum & Projects</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
          Learning Roadmap
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Structured week-by-week curriculum, hands-on portfolio projects, and daily actionable milestones.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Target Role & Generator Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-2">
            Target Career Objective
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Developer, DevOps Engineer..."
              className="flex-1 px-3.5 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !targetRole.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Curriculum...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{result ? 'Regenerate Roadmap' : 'Generate Roadmap'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {targetRole && (
          <p className="text-[11px] text-zinc-400">
            Roadmap automatically adapts to your detected missing skill gaps for <span className="font-medium text-zinc-700 dark:text-zinc-300">{targetRole}</span>.
          </p>
        )}
      </div>

      {/* Generated Weekly Roadmap View */}
      {result && (
        <div className="space-y-6">
          <RoadmapWeekly roadmap={result} darkMode={darkMode} />
        </div>
      )}
    </div>
  );
};

export default Roadmap;
