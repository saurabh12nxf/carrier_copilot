import React from 'react';
import {
  FileText,
  Target,
  Map,
  Bot,
  Activity,
  ArrowRight,
  TrendingUp,
  Flame,
  Award,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import CareerJourneyStepper from './CareerJourneyStepper';

const Overview = ({
  user,
  progress,
  onNavigateTab,
}) => {
  // Read cached session data for summaries
  const resumeData = (() => {
    try {
      const saved = localStorage.getItem('resumeAnalysis');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const skillGapData = (() => {
    try {
      const saved = localStorage.getItem('skillGapAnalysis');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const roadmapData = (() => {
    try {
      const saved = localStorage.getItem('roadmapData');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  // Compute Career Readiness Score
  // 30% for Resume, 35% for Skill Match, 35% for Roadmap completion
  const resumeScore = resumeData?.extracted_skills?.length ? 30 : 0;
  const matchPercentage = skillGapData?.skill_gap?.completion_percentage || 0;
  const gapScore = Math.round((matchPercentage / 100) * 35);
  const roadmapScore = progress?.roadmapCompleted ? 35 : (roadmapData ? 15 : 0);
  const totalReadinessScore = Math.min(100, resumeScore + gapScore + roadmapScore);

  // Target role determination
  const targetRole =
    skillGapData?.target_role ||
    roadmapData?.target_role ||
    user?.targetRole ||
    'Role not set';

  // Next recommended action determination
  const getNextAction = () => {
    if (!progress?.resumeCompleted) {
      return {
        tab: 'resume',
        title: 'Upload your resume',
        description: 'Extract your core technical skills and proficiency levels using AI.',
        cta: 'Start Resume Analysis',
        icon: FileText,
      };
    }
    if (!progress?.skillGapCompleted) {
      return {
        tab: 'skill-gap',
        title: 'Run Skill Gap Analysis',
        description: 'Select your target career path to identify matched skills and missing gaps.',
        cta: 'Analyze Skill Gaps',
        icon: Target,
      };
    }
    if (!progress?.roadmapCompleted) {
      return {
        tab: 'roadmap',
        title: 'Generate Learning Roadmap',
        description: 'Get an actionable week-by-week curriculum tailored to your gap skills.',
        cta: 'View Learning Plan',
        icon: Map,
      };
    }
    return {
      tab: 'ai-coach',
      title: 'Practice with AI Coach',
      description: 'Prepare for technical interviews or ask for personalized career advice.',
      cta: 'Open AI Coach',
      icon: Bot,
    };
  };

  const nextAction = getNextAction();
  const NextIcon = nextAction.icon;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome, {user?.name || 'Explorer'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track your career transition, target readiness, and weekly learning velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Target Role:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
            <Target className="w-3.5 h-3.5" />
            {targetRole}
          </span>
        </div>
      </div>

      {/* Career Journey Stepper */}
      <CareerJourneyStepper
        progress={progress}
        activeTab="overview"
        onStepClick={onNavigateTab}
      />

      {/* Key Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Readiness Score */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Career Readiness</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {totalReadinessScore}%
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">score</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalReadinessScore}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Extracted Skills */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified Skills</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {resumeData?.extracted_skills?.length || 0}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">extracted</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 truncate">
            {progress?.resumeCompleted ? 'Resume parsed & verified' : 'Upload resume to extract'}
          </p>
        </div>

        {/* Metric 3: Skill Match % */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Skill Match</span>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {matchPercentage}%
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">match rate</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 truncate">
            {progress?.skillGapCompleted
              ? `${skillGapData?.skill_gap?.matched_skills?.length || 0} matched / ${skillGapData?.skill_gap?.missing_skills?.length || 0} gaps`
              : 'Requires skill gap run'}
          </p>
        </div>

        {/* Metric 4: Journey Status */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Milestones</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {progress?.completed || 0}/3
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">steps complete</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3">
            {progress?.completed === 3 ? 'Curriculum active' : `${3 - (progress?.completed || 0)} steps remaining`}
          </p>
        </div>
      </div>

      {/* Next Recommended Action Banner */}
      <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-r from-indigo-50/50 via-zinc-50 to-white dark:from-indigo-950/20 dark:via-zinc-900 dark:to-[#111113] border border-indigo-200/80 dark:border-indigo-800/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5 shadow-sm">
              <NextIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  Recommended Action
                </span>
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
                {nextAction.title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 max-w-xl">
                {nextAction.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab(nextAction.tab)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0 shadow-sm"
          >
            <span>{nextAction.cta}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dual Context Section: Resume Summary & Skill Gap Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Resume Analysis Status */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Resume Status
              </h4>
            </div>
            <button
              onClick={() => onNavigateTab('resume')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {progress?.resumeCompleted ? 'Update Resume' : 'Upload'}
            </button>
          </div>

          <div className="pt-4">
            {resumeData?.extracted_skills?.length ? (
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  Top verified competencies extracted from your profile:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {resumeData.extracted_skills.slice(0, 10).map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                  {resumeData.extracted_skills.length > 10 && (
                    <span className="text-xs px-2 py-1 text-zinc-500 dark:text-zinc-400">
                      +{resumeData.extracted_skills.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  No resume has been uploaded yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Skill Gaps Summary */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Priority Skill Gaps
              </h4>
            </div>
            <button
              onClick={() => onNavigateTab('skill-gap')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Analysis
            </button>
          </div>

          <div className="pt-4">
            {skillGapData?.skill_gap?.missing_skills?.length ? (
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  Skills to develop for <span className="font-medium text-zinc-700 dark:text-zinc-300">{skillGapData.target_role}</span>:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skillGapData.skill_gap.missing_skills.slice(0, 8).map((gap, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40"
                    >
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <Target className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select a target role to view required skill gaps.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;

