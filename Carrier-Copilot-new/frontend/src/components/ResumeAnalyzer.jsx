import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Plus,
  X,
  FileUp,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import api, { formatApiError } from '../services/api';

const ResumeAnalyzer = ({ darkMode, userEmail }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedResult = localStorage.getItem('resumeAnalysis');
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        setResult(parsed);
        setShowUpload(false);
      } catch {
        setShowUpload(true);
      }
    } else {
      setShowUpload(true);
    }
  }, []);

  const validateAndSetFile = (selectedFile) => {
    setErrorMsg('');
    if (!selectedFile) return;

    const validExtensions = ['.pdf', '.docx', '.txt'];
    const fileName = selectedFile.name.toLowerCase();
    const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExtension) {
      setErrorMsg('Unsupported format. Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 15MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setErrorMsg('Please select a resume file before analyzing.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const activeEmail = userEmail || localStorage.getItem('userEmail') || '';
    const formData = new FormData();
    formData.append('file', file);
    if (activeEmail) {
      formData.append('email', activeEmail);
    }

    try {
      const response = await api.post('/api/resume-upload', formData);
      setResult(response.data);
      localStorage.setItem('resumeAnalysis', JSON.stringify(response.data));
      setShowUpload(false);
    } catch (error) {
      const msg = formatApiError(error) || 'Failed to analyze resume. Please ensure the backend is running.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    if (!result) return;
    const updatedSkills = (result.extracted_skills || []).filter((s) => s !== skillToRemove);
    const updatedResult = {
      ...result,
      extracted_skills: updatedSkills,
      total_skills: updatedSkills.length,
    };
    setResult(updatedResult);
    localStorage.setItem('resumeAnalysis', JSON.stringify(updatedResult));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed || !result) return;

    const currentSkills = result.extracted_skills || [];
    if (!currentSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      const updatedSkills = [...currentSkills, trimmed];
      const updatedResult = {
        ...result,
        extracted_skills: updatedSkills,
        total_skills: updatedSkills.length,
      };
      setResult(updatedResult);
      localStorage.setItem('resumeAnalysis', JSON.stringify(updatedResult));
    }
    setNewSkillInput('');
  };

  const handleChangeResume = () => {
    setShowUpload(true);
    setFile(null);
    setErrorMsg('');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
            Step 1 of 3
          </span>
          <span className="text-xs text-zinc-400">•</span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Profile Ingestion</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
          Resume Analyzer
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Upload your resume in PDF, DOCX, or TXT format to automatically extract verified competencies.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Analysis & Upload Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {result && !showUpload ? (
          /* State A: Resume already parsed and verified */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    Active Resume Profile
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {result.total_skills || result.extracted_skills?.length || 0} skills extracted and active for gap modeling.
                  </p>
                </div>
              </div>

              <button
                onClick={handleChangeResume}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 transition-colors shrink-0 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload Different Resume</span>
              </button>
            </div>

            {/* Extracted Skills Matrix */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Verified Competencies
                  </h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {result.extracted_skills?.length || 0}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400">
                  Click 'x' on any chip to remove, or add missing skills below
                </span>
              </div>

              {/* Skill Tags */}
              <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 min-h-[90px]">
                {result.extracted_skills && result.extracted_skills.length > 0 ? (
                  result.extracted_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs group"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-0.5 rounded"
                        title={`Remove ${skill}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 italic">No skills extracted yet.</p>
                )}
              </div>

              {/* Add Custom Skill Form */}
              <form onSubmit={handleAddSkill} className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="Add missing skill (e.g. TypeScript, Docker, SQL)..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newSkillInput.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white/90 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* State B: Dropzone File Upload */
          <div className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-8 sm:p-12 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                  : file
                  ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-900/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />

              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 mb-3 shadow-2xs">
                {file ? <FileCheck className="w-6 h-6 text-emerald-600" /> : <Upload className="w-6 h-6 text-zinc-500" />}
              </div>

              {file ? (
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-sm">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {(file.size / 1024).toFixed(1)} KB • Ready for analysis
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Click to browse or drag and drop your resume
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Supports PDF, DOCX, and TXT files (up to 15MB)
                  </p>
                </div>
              )}
            </div>

            {/* Privacy & Extraction Indicators */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Text is securely parsed and processed locally for profile matching.</span>
              </div>
              {result && (
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="font-medium text-zinc-700 dark:text-zinc-300 hover:underline shrink-0"
                >
                  Cancel & Keep Existing
                </button>
              )}
            </div>

            {/* Action Trigger */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Parsing and Extracting Skills...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Resume</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
