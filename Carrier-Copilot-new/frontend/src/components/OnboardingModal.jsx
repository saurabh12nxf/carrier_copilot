import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const OnboardingModal = ({ isOpen, onClose, darkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      emoji: "👋",
      title: "Welcome to GenAI Career Copilot!",
      description: "Your AI-powered career mentor is here to guide you from where you are to where you want to be.",
      color: "from-purple-500 to-pink-500"
    },
    {
      emoji: "📄",
      title: "Step 1: Upload Your Resume",
      description: "Our AI will analyze your skills, experience, and strengths in seconds. Don't worry, your data stays private!",
      color: "from-blue-500 to-cyan-500"
    },
    {
      emoji: "🎯",
      title: "Step 2: Analyze Skill Gaps",
      description: "Choose your dream role and we'll show you exactly what skills you need to learn to get there.",
      color: "from-green-500 to-emerald-500"
    },
    {
      emoji: "🗺️",
      title: "Step 3: Get Your Roadmap",
      description: "Receive a personalized learning roadmap with resources, timelines, and actionable steps.",
      color: "from-orange-500 to-red-500"
    },
    {
      emoji: "🚀",
      title: "Ready to Start?",
      description: "Follow the steps in order to get the best results. Each step builds on the previous one!",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboardingCompleted', 'true');
      onClose();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleSkip}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative max-w-2xl w-full rounded-3xl ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border shadow-2xl overflow-hidden`}
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
                className={`h-full bg-gradient-to-r ${steps[currentStep].color}`}
              />
            </div>

            {/* Content */}
            <div className="p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-8xl mb-6"
                  >
                    {steps[currentStep].emoji}
                  </motion.div>

                  <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {steps[currentStep].title}
                  </h2>

                  <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {steps[currentStep].description}
                  </p>

                  {/* Step Indicators */}
                  <div className="flex justify-center gap-2 mb-8">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentStep
                            ? `bg-gradient-to-r ${steps[currentStep].color} w-8`
                            : index < currentStep
                            ? 'bg-green-500 w-2'
                            : 'bg-gray-300 dark:bg-gray-600 w-2'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Buttons */}
              <div className="flex justify-between items-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSkip}
                  className={`px-6 py-3 rounded-full font-semibold ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                >
                  Skip
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(168, 85, 247, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className={`px-8 py-3 bg-gradient-to-r ${steps[currentStep].color} text-white rounded-full font-semibold shadow-lg`}
                >
                  {currentStep < steps.length - 1 ? 'Next' : "Let's Go! 🚀"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;
