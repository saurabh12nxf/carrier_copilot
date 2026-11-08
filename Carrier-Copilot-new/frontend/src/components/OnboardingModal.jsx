import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Target,
  Map,
  Bot,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';

const OnboardingModal = ({ isOpen, onClose, darkMode, userEmail }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Sparkles,
      title: 'Welcome to Career Copilot',
      description:
        'Your guided career workspace. We analyze your competencies, benchmark market skill gaps, and generate structured roadmaps to transition into your dream technical role.',
      stepTag: 'Welcome Overview',
    },
    {
      icon: FileText,
      title: 'Step 1: Resume Skill Extraction',
      description:
        'Upload your current resume in PDF, DOCX, or TXT format. Our parser extracts your technical proficiencies, frameworks, and verified strengths without sending data to third parties.',
      stepTag: 'Step 1 of 3',
    },
    {
      icon: Target,
      title: 'Step 2: Market Skill Gap Analysis',
      description:
        'Specify any target role or paste a job description. We compare your verified skills against real-time industry benchmarks to highlight high-priority learning gaps.',
      stepTag: 'Step 2 of 3',
    },
    {
      icon: Map,
      title: 'Step 3: Week-by-Week Roadmap & AI Coach',
      description:
        'Follow an adaptive curriculum with daily milestones, portfolio capstone projects, and real-time guidance from your AI career mentor.',
      stepTag: 'Step 3 of 3',
    },
  ];

  const markCompleted = () => {
    if (userEmail) {
      localStorage.setItem(`onboardingCompleted_${userEmail}`, 'true');
    }
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      markCompleted();
    }
  };

  const StepIcon = steps[currentStep].icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-lg rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden p-6 sm:p-8"
      >
        {/* Step Progress Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Close / Skip button */}
        <button
          onClick={markCompleted}
          className="absolute top-4 right-4 p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          title="Skip onboarding"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Content */}
        <div className="mt-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {steps[currentStep].stepTag}
            </span>
          </div>

          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
            <StepIcon className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {steps[currentStep].title}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1.5">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Dots & Controls */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-4 bg-indigo-600 dark:bg-indigo-400'
                    : 'bg-zinc-200 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markCompleted}
              className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
