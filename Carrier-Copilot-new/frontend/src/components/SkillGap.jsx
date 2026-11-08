import React, { useState, useEffect } from 'react';
import {
  Target,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Clock,
  Layers,
  ChevronDown,
  Upload,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import api, { formatApiError } from '../services/api';

const SkillGap = ({ darkMode, userEmail }) => {
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [useCustomJD, setUseCustomJD] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const commonRoles = [
    'Full Stack Engineer',
    'Frontend Specialist',
    'Backend Engineer',
    'AI / Machine Learning Engineer',
    'DevOps & Cloud Architect',
    'Data Scientist',
  ];

  useEffect(() => {
    const savedResult = localStorage.getItem('skillGapAnalysis');
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        setResult(parsed);
        if (parsed.target_role) setTargetRole(parsed.target_role);
      } catch {
        // Ignore parse error
      }
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setJobDescriptionFile(file);
      setJobDescription('');
    }
  };

  const handleAnalyze = async () => {
    const email = userEmail || localStorage.getItem('userEmail');
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please log in and ensure your resume is uploaded before analyzing.');
      return;
    }

    if (!targetRole.trim()) {
      setErrorMsg('Please specify or select a target career role.');
      return;
    }

    if (useCustomJD && !jobDescription.trim() && !jobDescriptionFile) {
      setErrorMsg('Please provide a job description (either paste text or attach a file).');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (useCustomJD && jobDescriptionFile) {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('role', targetRole.trim());
        formData.append('job_description_file', jobDescriptionFile);

        response = await api.post('/api/analyze-role-with-file', formData);
      } else {
        response = await api.post('/api/analyze-role', {
          email,
          role: targetRole.trim(),
          job_description: useCustomJD ? jobDescription.trim() : null,
        });
      }

      setResult(response.data);
      localStorage.setItem('skillGapAnalysis', JSON.stringify(response.data));
    } catch (error) {
      if (error.response?.status === 404) {
        setErrorMsg('No resume found on file. Please upload your resume in the Resume Analyzer first.');
      } else {
        setErrorMsg(formatApiError(error) || 'Failed to complete analysis. Please verify your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const matchScore = result?.skill_gap?.completion_percentage || 0;
  const matchedSkills = result?.skill_gap?.matched_skills || [];
  const missingSkills = result?.skill_gap?.missing_skills || [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
            Step 2 of 3
          </span>
          <span className="text-xs text-zinc-400">•</span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Market Benchmarking</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
          Skill Gap Analysis
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Benchmark your verified competencies against industry expectations for your target position.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Target Role Input & Configuration Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-2">
            Target Job Title
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Full Stack Engineer, AI Research Scientist..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          {/* Quick Select Preset Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-[11px] text-zinc-400 mr-1">Popular roles:</span>
            {commonRoles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setTargetRole(role)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  targetRole === role
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 font-medium'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Job Description Toggle */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={() => setUseCustomJD(!useCustomJD)}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${useCustomJD ? 'rotate-180' : ''}`} />
            <span>Targeting a specific company's Job Description? (Optional)</span>
          </button>

          {useCustomJD && (
            <div className="mt-3 space-y-3 p-4 rounded-lg bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Paste Job Description Text
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    if (e.target.value) setJobDescriptionFile(null);
                  }}
                  rows={4}
                  placeholder="Paste the job requirements, responsibilities, and qualifications..."
                  className="w-full p-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-medium">or</span>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Attach JD Document</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                  />
                </label>
                {jobDescriptionFile && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 truncate max-w-xs font-medium">
                    Attached: {jobDescriptionFile.name}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !targetRole.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Skill Gaps against Industry Standards...</span>
            </>
          ) : (
            <>
              <Target className="w-4 h-4" />
              <span>Run Skill Gap Benchmark</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6">
          {/* Match Score & Overview Card */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Benchmark Analysis
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
                  Readiness for {result.target_role}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {matchScore}%
                  </span>
                  <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                    Role Match Rate
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full mt-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  matchScore >= 70
                    ? 'bg-emerald-600'
                    : matchScore >= 45
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, matchScore)}%` }}
              />
            </div>

            {/* Dual Grid: Matched Skills vs Missing Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Matched Skills */}
              <div className="p-4 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      Matched Competencies
                    </h4>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                    {matchedSkills.length}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[60px]">
                  {matchedSkills.length > 0 ? (
                    matchedSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-md font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200/70 dark:border-emerald-800/40"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 italic">No direct matches found yet.</p>
                  )}
                </div>
              </div>

              {/* Missing Priority Gaps */}
              <div className="p-4 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      Required Skill Gaps
                    </h4>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                    {missingSkills.length}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[60px]">
                  {missingSkills.length > 0 ? (
                    missingSkills.map((gap, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-md font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200/70 dark:border-amber-800/40"
                      >
                        {gap}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 italic">
                      Zero gaps detected! You meet 100% of benchmark requirements.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Insights and Recommendations */}
            {result.ai_insights && (
              <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    Strategic Focus & Recommendations
                  </h4>
                </div>

                {result.ai_insights.estimated_time && (
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Estimated transition timeline:</span>
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {result.ai_insights.estimated_time}
                    </strong>
                  </div>
                )}

                {result.ai_insights.recommendations && result.ai_insights.recommendations.length > 0 && (
                  <ul className="space-y-2">
                    {result.ai_insights.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGap;
