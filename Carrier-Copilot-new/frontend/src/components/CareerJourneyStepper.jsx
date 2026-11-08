import React from 'react';
import { Check, ArrowRight, FileText, Target, Map, Lock } from 'lucide-react';

const CareerJourneyStepper = ({
  progress,
  activeTab,
  onStepClick,
}) => {
  const steps = [
    {
      id: 'resume',
      stepNumber: 1,
      title: 'Resume Analysis',
      subtitle: 'Extract verified skills',
      icon: FileText,
      isCompleted: Boolean(progress?.resumeCompleted),
      isActive: activeTab === 'resume',
      isLocked: false,
    },
    {
      id: 'skill-gap',
      stepNumber: 2,
      title: 'Skill Gap Analysis',
      subtitle: 'Compare market requirements',
      icon: Target,
      isCompleted: Boolean(progress?.skillGapCompleted),
      isActive: activeTab === 'skill-gap',
      isLocked: !progress?.resumeCompleted,
    },
    {
      id: 'roadmap',
      stepNumber: 3,
      title: 'Learning Roadmap',
      subtitle: 'Week-by-week curriculum',
      icon: Map,
      isCompleted: Boolean(progress?.roadmapCompleted),
      isActive: activeTab === 'roadmap',
      isLocked: !progress?.skillGapCompleted,
    },
  ];

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {steps.map((step, index) => {
          const StepIcon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => {
                  if (!step.isLocked && onStepClick) {
                    onStepClick(step.id);
                  }
                }}
                disabled={step.isLocked}
                className={`flex-1 flex items-center gap-3.5 p-3 rounded-lg text-left transition-all relative ${
                  step.isActive
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60'
                    : step.isCompleted
                    ? 'hover:bg-zinc-50 dark:hover:bg-zinc-850/60 border border-transparent'
                    : step.isLocked
                    ? 'opacity-50 cursor-not-allowed border border-transparent'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-850/60 border border-transparent'
                }`}
              >
                {/* Status Indicator Icon */}
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg font-semibold text-xs shrink-0 transition-colors ${
                    step.isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : step.isActive
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/30'
                      : step.isLocked
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {step.isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : step.isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  ) : (
                    <span>{step.stepNumber}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-semibold truncate ${
                        step.isActive
                          ? 'text-indigo-950 dark:text-indigo-200'
                          : step.isCompleted
                          ? 'text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    {step.isCompleted && (
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {step.subtitle}
                  </p>
                </div>
              </button>

              {/* Step Connector Arrow (Desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden sm:flex items-center justify-center text-zinc-300 dark:text-zinc-700 px-1">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CareerJourneyStepper;

