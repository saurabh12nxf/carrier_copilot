import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const AICoach = ({ darkMode, userEmail }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history
    const loadHistory = async () => {
      const email = userEmail || localStorage.getItem('userEmail');
      if (!email) return;

      try {
        const response = await axios.get(`http://localhost:8000/api/coach/history/${email}`);
        if (response.data.history && response.data.history.length > 0) {
          const formattedHistory = response.data.history.map(h => ([
            { type: 'user', text: h.user, timestamp: h.timestamp },
            { type: 'ai', text: h.ai, timestamp: h.timestamp }
          ])).flat();
          setMessages(formattedHistory);
        } else {
          // Welcome message
          setMessages([{
            type: 'ai',
            text: `Hi! 👋 I'm your AI Career Coach. I'm here to help you with:\n\n• Career advice and guidance\n• Learning strategies\n• Skill development tips\n• Interview preparation\n• Project ideas\n• Overcoming challenges\n\nWhat would you like to know?`,
            timestamp: new Date().toISOString()
          }]);
        }
      } catch (error) {
        console.error('Failed to load history:', error);
        // Show welcome message on error
        setMessages([{
          type: 'ai',
          text: `Hi! 👋 I'm your AI Career Coach. How can I help you today?`,
          timestamp: new Date().toISOString()
        }]);
      }
    };

    loadHistory();
  }, [userEmail]);

  const handleSend = async () => {
    const email = userEmail || localStorage.getItem('userEmail');
    
    if (!email) {
      alert('Please login first');
      return;
    }

    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/coach/chat', {
        email: email,
        message: input
      });

      const aiMessage = {
        type: 'ai',
        text: response.data.response,
        timestamp: new Date().toISOString(),
        provider: response.data.llm_provider
      };

      setMessages(prev => [...prev, aiMessage]);
      setContext(response.data.user_context);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = async () => {
    const email = userEmail || localStorage.getItem('userEmail');
    if (!email) return;

    try {
      await axios.post('http://localhost:8000/api/coach/clear-history', { email });
      setMessages([{
        type: 'ai',
        text: `Hi! 👋 I'm your AI Career Coach. How can I help you today?`,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const suggestedQuestions = [
    "I'm weak in DSA, what should I do?",
    "How do I prepare for interviews?",
    "What projects should I build?",
    "How long will it take to become job-ready?",
    "I'm feeling overwhelmed, help!"
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          🤖 AI Career Coach
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Ask me anything about your career, skills, or learning path
        </p>
      </div>

      {/* Context Card */}
      {context && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}
        >
          <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
            💡 I know about your {context.skills_count} skills, targeting {context.target_role}, {context.completion}% ready
          </p>
        </motion.div>
      )}

      {/* Chat Container */}
      <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.type === 'user'
                      ? darkMode
                        ? 'bg-primary text-white'
                        : 'bg-primary text-white'
                      : darkMode
                      ? 'bg-gray-700 text-gray-100'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex space-x-2">
                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 2 && (
          <div className={`px-6 py-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Suggested questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className={`text-xs px-3 py-1 rounded-full ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your career..."
              rows="2"
              className={`flex-1 px-4 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-primary focus:border-transparent resize-none`}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Send
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Press Enter to send, Shift+Enter for new line
            </p>
            <button
              onClick={clearHistory}
              className={`text-xs ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Clear history
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
