import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Sparkles,
  User,
  RefreshCw,
  Target,
  FileText,
  HelpCircle,
  ChevronRight,
  Clock,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Copy,
  MessageSquare,
  Flame,
  Lightbulb,
} from 'lucide-react';
import api from '../services/api';

const AICoach = ({ darkMode, userEmail }) => {
  // Navigation active tab: 'chat' | 'interview'
  const [activeTab, setActiveTab] = useState('chat');

  // ===================== CHAT STATE =====================
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'What should I prioritize this week for my target role?',
    'How can I demonstrate my project experience in technical interviews?',
    'Can you give me 3 behavioral questions for a Junior-to-Mid developer?',
    'What are the most common architecture mistakes in full-stack projects?',
  ];

  // ===================== INTERVIEW STATE =====================
  // Screen stages: 'setup' | 'interview' | 'feedback' | 'summary'
  const [interviewStage, setInterviewStage] = useState('setup');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level');
  const [interviewType, setInterviewType] = useState('Comprehensive (Mixed)');
  const [questionCount, setQuestionCount] = useState(4);

  // Active session
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);

  // Interview interactive controls
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  const recognitionRef = useRef(null);
  const initialTextRef = useRef('');
  const timerIntervalRef = useRef(null);

  // ===================== SCROLL & INIT =====================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, chatLoading, activeTab]);

  useEffect(() => {
    const email = userEmail || localStorage.getItem('userEmail');
    if (!email) return;

    // Load user context from local storage if available
    try {
      const savedGap = localStorage.getItem('skillGapAnalysis');
      const savedResume = localStorage.getItem('resumeAnalysis');
      if (savedGap || savedResume) {
        const gapData = savedGap ? JSON.parse(savedGap) : null;
        const role = gapData?.target_role || 'Full Stack Developer';
        setTargetRole(role);
        setUserContext({
          targetRole: role,
          skillsCount: savedResume ? JSON.parse(savedResume).extracted_skills?.length : 0,
        });
      }
    } catch {}

    const loadHistory = async () => {
      try {
        const response = await api.get(`/api/coach/history/${encodeURIComponent(email)}`);
        if (response.data.history && response.data.history.length > 0) {
          const formatted = response.data.history.flatMap((h) => [
            { type: 'user', text: h.user, timestamp: h.timestamp },
            { type: 'ai', text: h.ai, timestamp: h.timestamp, provider: h.provider },
          ]);
          setMessages(formatted);
        } else {
          setMessages([
            {
              type: 'ai',
              text: `Hello! I am your AI Career Mentor. I have full context of your verified resume skills and roadmap milestones. How can I assist you with your career goals today?`,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch {
        setMessages([
          {
            type: 'ai',
            text: `Hello! I am your AI Career Mentor. Ask me any questions regarding interview preparation, technical upskilling, or project ideas.`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    loadHistory();
  }, [userEmail]);

  // Clean up audio and recognition on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      stopRecording();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Timer runner for active interview
  useEffect(() => {
    if (interviewStage === 'interview' || interviewStage === 'feedback') {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [interviewStage]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ===================== CHAT HANDLERS =====================
  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    const email = userEmail || localStorage.getItem('userEmail');

    if (!email || !textToSend) return;

    const userMsg = {
      type: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);

    try {
      const response = await api.post('/api/coach/chat', {
        email,
        message: textToSend,
      });

      const aiMsg = {
        type: 'ai',
        text: response.data.response,
        timestamp: new Date().toISOString(),
        provider: response.data.llm_provider,
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (response.data.user_context) {
        setUserContext(response.data.user_context);
      }
    } catch {
      const errorMsg = {
        type: 'ai',
        text: 'Sorry, I encountered an error communicating with the model. Please ensure the backend server is running.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // ===================== SPEECH SYNTHESIS (AUDIO PLAYBACK) =====================
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    if (isSpeaking) {
      stopAudio();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // ===================== SPEECH RECOGNITION (AUDIO MIC) =====================
  const startRecording = () => {
    setSpeechError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError('Microphone speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or type your answer below.');
      return;
    }

    try {
      // Save any existing text as prefix so we don't overwrite it
      initialTextRef.current = userAnswer.trim();

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        // Iterate over all results from 0 to avoid duplicates
        for (let i = 0; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        const currentSpeech = (finalTranscript + interimTranscript).trim();
        const prefix = initialTextRef.current;
        const combined = prefix ? `${prefix} ${currentSpeech}` : currentSpeech;
        setUserAnswer(combined);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone access was denied. Please allow microphone permissions in your browser settings.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Microphone error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setSpeechError('Could not initialize speech recognition. Please type your response.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ===================== INTERVIEW FLOW =====================
  const handleStartInterview = async () => {
    setInterviewLoading(true);
    setSpeechError('');
    try {
      const email = userEmail || localStorage.getItem('userEmail') || 'user@example.com';
      const response = await api.post('/api/coach/interview/start', {
        email,
        target_role: targetRole,
        experience_level: experienceLevel,
        interview_type: interviewType,
        count: Number(questionCount),
      });

      if (response.data.questions && response.data.questions.length > 0) {
        setQuestions(response.data.questions);
        setCurrentQuestionIndex(0);
        setEvaluations([]);
        setCurrentEvaluation(null);
        setSessionSummary(null);
        setUserAnswer('');
        setTimerSeconds(0);
        setShowHints(false);
        setShowIdealAnswer(false);
        setInterviewStage('interview');

        // Automatically speak question aloud for immersive experience
        setTimeout(() => {
          speakText(response.data.questions[0].question);
        }, 600);
      }
    } catch (err) {
      console.error('Failed to generate interview:', err);
      alert('Failed to initialize interview questions. Please verify your backend server is active.');
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('Please speak or type your answer before submitting.');
      return;
    }

    stopRecording();
    stopAudio();
    setEvaluating(true);

    const email = userEmail || localStorage.getItem('userEmail') || 'user@example.com';
    const currentQ = questions[currentQuestionIndex];

    try {
      const response = await api.post('/api/coach/interview/evaluate', {
        email,
        target_role: targetRole,
        experience_level: experienceLevel,
        question: currentQ.question,
        question_type: currentQ.type,
        user_answer: userAnswer,
      });

      const evalData = response.data.evaluation;
      setCurrentEvaluation(evalData);

      const updatedEvaluations = [
        ...evaluations,
        {
          question: currentQ.question,
          topic: currentQ.topic,
          type: currentQ.type,
          user_answer: userAnswer,
          ...evalData,
        },
      ];
      setEvaluations(updatedEvaluations);
      setInterviewStage('feedback');
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
      alert('Could not grade your response. Please verify the backend is running.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = async () => {
    stopAudio();
    stopRecording();
    setShowHints(false);
    setShowIdealAnswer(false);

    if (currentQuestionIndex + 1 < questions.length) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setUserAnswer('');
      setCurrentEvaluation(null);
      setInterviewStage('interview');

      setTimeout(() => {
        speakText(questions[nextIndex].question);
      }, 500);
    } else {
      // Completed all questions -> Generate summary
      setEvaluating(true);
      try {
        const email = userEmail || localStorage.getItem('userEmail') || 'user@example.com';
        const response = await api.post('/api/coach/interview/summary', {
          email,
          target_role: targetRole,
          evaluations,
        });
        setSessionSummary(response.data.summary);
        setInterviewStage('summary');
      } catch (err) {
        console.error('Failed to generate summary:', err);
        setInterviewStage('summary');
      } finally {
        setEvaluating(false);
      }
    }
  };

  const handleResetInterview = () => {
    stopAudio();
    stopRecording();
    setInterviewStage('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setEvaluations([]);
    setCurrentEvaluation(null);
    setSessionSummary(null);
    setTimerSeconds(0);
  };

  const handleCopyIdealAnswer = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-50 dark:bg-amber-950/30';
    return 'text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-50 dark:bg-rose-950/30';
  };

  const getRecommendationBadge = (rec) => {
    if (rec?.includes('Strong Hire')) {
      return { bg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' };
    }
    if (rec?.includes('Hire')) {
      return { bg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700' };
    }
    return { bg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700' };
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Mode Switcher */}
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
              Interactive Mentorship
            </span>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Audio & Text Assessment</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
            AI Career Coach
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Context-aware career advice & real-time graded mock interview simulator.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Mentor Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('interview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'interview'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Mock Interview</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: MENTOR CHAT ===================== */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-[650px] rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, i) => {
              const isUser = msg.type === 'user';
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold shrink-0 shadow-2xs ${
                      isUser
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800/80'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {chatLoading && (
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse delay-150" />
                    <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse delay-300" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompt Chips */}
          {messages.length <= 3 && (
            <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 overflow-x-auto">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-zinc-400 shrink-0">Suggestions:</span>
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-xs px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 whitespace-nowrap transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Chat Input Field */}
          <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for interview questions, project critique, or study advice..."
                disabled={chatLoading}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={chatLoading || !input.trim()}
                className="p-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-xs"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: MOCK INTERVIEW SIMULATOR ===================== */}
      {activeTab === 'interview' && (
        <div>
          {/* STAGE 1: SETUP SCREEN */}
          {interviewStage === 'setup' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 mb-3">
                  <Award className="w-3.5 h-3.5" />
                  <span>Interactive Audio & Text Assessment</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Configure Your Mock Interview
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
                  Simulate real-world technical and behavioral rounds. Listen to questions spoken aloud, answer using speech-to-text or typing, and receive instant grading on your depth, communication, and technical rigor.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Target Role */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Target Engineering Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Full Stack Developer, Frontend Engineer, DevOps"
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Full Stack Developer', 'Frontend Engineer', 'Backend Engineer', 'DevOps / Cloud'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setTargetRole(role)}
                        className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                          targetRole === role
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Seniority Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Junior / Entry', 'Mid-Level', 'Senior / Staff'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setExperienceLevel(level)}
                        className={`p-2.5 rounded-lg border text-xs font-medium transition-all text-center ${
                          experienceLevel === level
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interview Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Interview Focus Type
                  </label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Comprehensive (Mixed)">Comprehensive (Mixed Technical, Design & STAR)</option>
                    <option value="Technical Architecture & Coding">Technical Architecture & Coding Fundamentals</option>
                    <option value="System Design & Scaling">System Design & Scalability</option>
                    <option value="Behavioral (STAR Method)">Behavioral & Leadership (STAR Method)</option>
                  </select>
                </div>

                {/* Question Count */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Number of Questions
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 4, 5].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setQuestionCount(cnt)}
                        className={`p-2.5 rounded-lg border text-xs font-medium transition-all text-center ${
                          questionCount === cnt
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        {cnt} Questions
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulation Features Checklist */}
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Speech question readout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Voice or text response</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Multi-factor AI scoring</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleStartInterview}
                  disabled={interviewLoading || !targetRole.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {interviewLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating customized questions...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Mock Interview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: ACTIVE QUESTION SCREEN */}
          {interviewStage === 'interview' && questions.length > 0 && (
            <div className="space-y-5">
              {/* Top Progress & Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-600 text-white shadow-2xs">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {targetRole} • {experienceLevel}
                  </span>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{formatTimer(timerSeconds)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetInterview}
                    className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  >
                    Exit Session
                  </button>
                </div>
              </div>

              {/* Interviewer Question Box */}
              <div className="p-6 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Lead Technical Interviewer
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          {questions[currentQuestionIndex].topic || 'Architecture & Engineering'}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span className="text-[11px] text-zinc-400 capitalize">
                          {questions[currentQuestionIndex].type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Audio Readout Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => speakText(questions[currentQuestionIndex].question)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isSpeaking
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-700 dark:text-indigo-300 animate-pulse'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                      }`}
                      title={isSpeaking ? 'Stop speaking' : 'Listen to question aloud'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed">
                    "{questions[currentQuestionIndex].question}"
                  </p>
                </div>

                {/* Rubric / Key hints disclosure */}
                {questions[currentQuestionIndex].hints && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowHints(!showHints)}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showHints ? 'Hide concepts to touch upon' : 'View concepts interviewer looks for'}</span>
                      {showHints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {showHints && (
                      <div className="mt-2.5 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                        <span className="font-semibold block text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Recommended concepts to address:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                          {questions[currentQuestionIndex].hints.map((hint, hIdx) => (
                            <li key={hIdx}>{hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Candidate Response Workspace */}
              <div className="p-6 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Your Response
                    </span>
                    <p className="text-xs text-zinc-400">
                      Speak using your microphone or type your answer below.
                    </p>
                  </div>

                  {/* Audio Microphone Recording Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                        isRecording
                          ? 'bg-rose-600 text-white ring-4 ring-rose-500/20 animate-pulse'
                          : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop Recording</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5" />
                          <span>Record with Voice</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Active Audio Waveform Banner */}
                {isRecording && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                      <span className="font-semibold">Microphone active: Listening and transcribing speech in real-time...</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-3 bg-rose-500 animate-pulse" />
                      <span className="w-1 h-5 bg-rose-500 animate-pulse delay-75" />
                      <span className="w-1 h-2 bg-rose-500 animate-pulse delay-150" />
                      <span className="w-1 h-6 bg-rose-500 animate-pulse delay-100" />
                      <span className="w-1 h-3 bg-rose-500 animate-pulse delay-200" />
                    </div>
                  </div>
                )}

                {speechError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{speechError}</span>
                  </div>
                )}

                {/* Text Response Area */}
                <div className="relative">
                  <textarea
                    rows={6}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Structure your answer clearly: state the problem context, technical architecture/algorithms, concrete tradeoffs, and validation..."
                    className="w-full p-3.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed resize-y"
                  />
                  <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                    <span>{userAnswer.split(/\s+/).filter(Boolean).length} words</span>
                    {userAnswer && (
                      <button
                        type="button"
                        onClick={() => setUserAnswer('')}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        Clear text
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={evaluating || !userAnswer.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {evaluating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Grading technical response & communication...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit for Grading</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: GRADED FEEDBACK SCREEN */}
          {interviewStage === 'feedback' && currentEvaluation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Question Reviewed Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                  "{questions[currentQuestionIndex].question}"
                </p>
              </div>

              {/* Evaluation Scorecard Card */}
              <div className="p-6 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Answer Evaluation
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                      Interviewer Assessment & Rubric Score
                    </h3>
                  </div>

                  {/* Primary Score Pill */}
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-xl border text-center ${getScoreColor(currentEvaluation.score)}`}>
                      <span className="text-2xl font-black">{currentEvaluation.score}</span>
                      <span className="text-xs font-semibold text-zinc-400 block -mt-1">/ 100</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                        {currentEvaluation.rating}
                      </span>
                      <span className="text-[11px] text-zinc-500 capitalize">
                        {currentEvaluation.score >= 75 ? 'Qualified response' : 'Needs reinforcement'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subscore Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Technical Depth</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {currentEvaluation.technical_depth_score || currentEvaluation.score}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${currentEvaluation.technical_depth_score || currentEvaluation.score}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Communication & Clarity</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {currentEvaluation.communication_score || currentEvaluation.score}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${currentEvaluation.communication_score || currentEvaluation.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Executive Feedback */}
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                    Interviewer Remarks:
                  </span>
                  {currentEvaluation.feedback}
                </div>

                {/* Strengths & Improvements Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Key Strengths Identified</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                      {(currentEvaluation.strengths || ['Good attempt on the core prompt.']).map((str, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold shrink-0">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="p-4 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Actionable Improvements</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                      {(currentEvaluation.improvements || ['Practice adding quantifiable metrics.']).map((imp, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2">
                          <span className="text-amber-500 font-bold shrink-0">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Expandable Model / Ideal Answer */}
                {currentEvaluation.ideal_answer && (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowIdealAnswer(!showIdealAnswer)}
                      className="w-full flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          Exemplary Senior Engineer Model Answer
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-400">
                          {showIdealAnswer ? 'Hide' : 'Click to study'}
                        </span>
                        {showIdealAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {showIdealAnswer && (
                      <div className="p-4 bg-white dark:bg-[#111113] border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                          {currentEvaluation.ideal_answer}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <button
                            type="button"
                            onClick={() => speakText(currentEvaluation.ideal_answer)}
                            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen to model answer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyIdealAnswer(currentEvaluation.ideal_answer)}
                            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                          >
                            {copiedAnswer ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-500">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Answer</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <span>
                      {currentQuestionIndex + 1 < questions.length
                        ? 'Proceed to Next Question'
                        : 'View Final Interview Scorecard'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: FINAL INTERVIEW SCORECARD */}
          {interviewStage === 'summary' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 mb-2">
                    <Award className="w-3.5 h-3.5" />
                    <span>Interview Completed</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Mock Interview Scorecard
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Session recap for {targetRole} ({experienceLevel}) • Total time: {formatTimer(timerSeconds)}
                  </p>
                </div>

                {/* Hiring Recommendation Pill */}
                {sessionSummary && (
                  <div
                    className={`px-4 py-2 rounded-xl border text-center ${
                      getRecommendationBadge(sessionSummary.recommendation).bg
                    }`}
                  >
                    <span className="text-xs uppercase tracking-wider font-semibold block text-zinc-500">
                      Recommendation
                    </span>
                    <span className="text-base font-bold">{sessionSummary.recommendation}</span>
                  </div>
                )}
              </div>

              {/* Overall Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-1">
                  <span className="text-xs text-zinc-500 font-medium">Overall Score</span>
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                    {sessionSummary?.overall_score ||
                      Math.round(evaluations.reduce((acc, curr) => acc + (curr.score || 0), 0) / (evaluations.length || 1))}
                    %
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-1">
                  <span className="text-xs text-zinc-500 font-medium">Technical Average</span>
                  <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                    {sessionSummary?.technical_average ||
                      Math.round(
                        evaluations.reduce((acc, curr) => acc + (curr.technical_depth_score || curr.score || 0), 0) /
                          (evaluations.length || 1)
                      )}
                    %
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-1">
                  <span className="text-xs text-zinc-500 font-medium">Communication Average</span>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {sessionSummary?.communication_average ||
                      Math.round(
                        evaluations.reduce((acc, curr) => acc + (curr.communication_score || curr.score || 0), 0) /
                          (evaluations.length || 1)
                      )}
                    %
                  </div>
                </div>
              </div>

              {/* Question-by-Question Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Question Breakdown
                </h4>
                <div className="space-y-2.5">
                  {evaluations.map((evalItem, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            Q{eIdx + 1}. {evalItem.topic || 'Engineering Question'}
                          </span>
                          <span className="text-[11px] text-zinc-400 capitalize">({evalItem.type})</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {evalItem.question}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-bold font-mono border ${getScoreColor(
                            evalItem.score
                          )}`}
                        >
                          {evalItem.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Next Steps & Focus Areas */}
              {sessionSummary?.key_focus_areas && sessionSummary.key_focus_areas.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                    Recommended Study Focus for Live Rounds:
                  </span>
                  <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                    {sessionSummary.key_focus_areas.map((focus, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{focus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const textReport = `Career Copilot Mock Interview Report\nRole: ${targetRole}\nOverall Score: ${
                      sessionSummary?.overall_score || 80
                    }%\nRecommendation: ${sessionSummary?.recommendation || 'Hire'}\nQuestions Evaluated: ${
                      evaluations.length
                    }`;
                    navigator.clipboard.writeText(textReport);
                    alert('Interview summary scorecard copied to clipboard!');
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition-colors"
                >
                  Copy Session Report
                </button>

                <button
                  type="button"
                  onClick={handleResetInterview}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start New Mock Interview</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default AICoach;