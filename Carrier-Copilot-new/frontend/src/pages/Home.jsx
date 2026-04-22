import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Home = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [currentQuote, setCurrentQuote] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const features = [
    {
      icon: "📄",
      title: "Upload Resume",
      description: "AI analyzes your skills in seconds"
    },
    {
      icon: "🎯",
      title: "Choose Goal",
      description: "Pick your dream career path"
    },
    {
      icon: "📊",
      title: "See Gaps",
      description: "Know exactly what to learn"
    },
    {
      icon: "�️",
      title: "Get Roadmap",
      description: "Personalized learning journey"
    }
  ];

  const quotes = [
    { text: "Your dream job is just 4 steps away", emoji: "🚀" },
    { text: "Every expert was once a beginner", emoji: "�" },
    { text: "The best time to start was yesterday. The next best time is now", emoji: "⏰" },
    { text: "Your future self will thank you for starting today", emoji: "🌟" },
    { text: "Success is the sum of small efforts repeated daily", emoji: "📈" },
    { text: "Believe in yourself and all that you are", emoji: "✨" },
    { text: "The only way to do great work is to love what you do", emoji: "❤️" },
    { text: "Don't watch the clock; do what it does. Keep going", emoji: "⏱️" }
  ];

  // Rotate quotes every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 flex justify-between items-center p-6"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-3"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
            🚀
          </div>
          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            GenAI Career Copilot
          </span>
        </motion.div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className={`px-6 py-2 rounded-full font-semibold ${darkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'} transition-all`}
          >
            Login
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(168, 85, 247, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold shadow-lg"
          >
            Sign Up
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className={`p-3 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-800'} shadow-lg`}
          >
            {darkMode ? '☀️' : '🌙'}
          </motion.button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-6 py-20"
      >
        <div className="text-center">
          <motion.div
            variants={itemVariants}
            className="inline-block"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              🎯
            </motion.div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className={`text-6xl md:text-7xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Your AI-Powered
            <br />
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-transparent bg-clip-text">
              Career Navigator
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className={`text-xl md:text-2xl mb-4 max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            From Resume to Dream Job in 4 Simple Steps
          </motion.p>
          
          <motion.p
            variants={itemVariants}
            className={`text-lg mb-12 max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            AI-powered career guidance with RAG technology • Personalized roadmaps • 100% Free
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all"
            >
              🚀 Get Started
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} text-lg font-semibold rounded-full shadow-xl`}
            >
              📖 Learn More
            </motion.button>
          </motion.div>
        </div>

        {/* How It Works Section */}
        <motion.div
          variants={containerVariants}
          className="mt-20"
        >
          <motion.h2
            variants={itemVariants}
            className={`text-4xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-gray-900'}`}
          >
            How It Works
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`relative p-6 rounded-2xl ${darkMode ? 'bg-gray-800/50 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg'} shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  className="text-5xl mb-4 mt-2"
                >
                  {feature.icon}
                </motion.div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
                
                {/* Arrow for desktop */}
                {index < features.length - 1 && (
                  <div className="hidden lg:block absolute -right-8 top-1/2 transform -translate-y-1/2 text-4xl text-purple-500">
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Motivational Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20"
        >
          <motion.div
            key={currentQuote}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className={`p-12 rounded-3xl ${darkMode ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} border backdrop-blur-lg shadow-2xl text-center`}
          >
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-7xl mb-6"
            >
              {quotes[currentQuote].emoji}
            </motion.div>
            
            <h3 className={`text-3xl md:text-4xl font-bold mb-8 ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600'}`}>
              "{quotes[currentQuote].text}"
            </h3>
            
            {/* Quote Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuote(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentQuote 
                      ? 'bg-purple-500 w-8' 
                      : 'bg-gray-400 w-2 hover:bg-gray-300'
                  }`}
                  aria-label={`Go to quote ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Success Stats */}
        <motion.div
          variants={containerVariants}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { number: "10,000+", label: "Students Helped", color: "from-purple-500 to-purple-600" },
            { number: "500+", label: "Career Paths", color: "from-blue-500 to-blue-600" },
            { number: "95%", label: "Success Rate", color: "from-green-500 to-green-600" },
            { number: "3 mins", label: "Average Time", color: "from-orange-500 to-orange-600" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-xl text-center`}
            >
              <h3 className="text-4xl font-bold mb-2">{stat.number}</h3>
              <p className="text-sm opacity-90">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          {['✓ AI-Powered', '✓ 100% Free', '✓ Personalized', '✓ Privacy First'].map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              className={`px-6 py-3 rounded-full ${darkMode ? 'bg-gray-800/50 text-gray-300' : 'bg-white/50 text-gray-700'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} font-semibold shadow-lg`}
            >
              {badge}
            </motion.div>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          variants={itemVariants}
          className="mt-20 text-center"
        >
          <h2 className={`text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready to Start Your Journey?
          </h2>
          <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Join thousands of students who found their dream career
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="px-12 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all"
          >
            Get Started Free →
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className={`relative z-10 text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
      >
        <p>Made with ❤️ and 🤖 AI • 100% Local • 100% Private</p>
      </motion.footer>
      <div>
        
      </div>
    </div>
    
  );
};

export default Home;
