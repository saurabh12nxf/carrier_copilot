import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SkillGap = ({ darkMode, userEmail }) => {
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [useCustomJD, setUseCustomJD] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Load previous result from localStorage
    const savedResult = localStorage.getItem('skillGapAnalysis');
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (e) {
        console.error('Failed to parse saved result');
      }
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setJobDescriptionFile(file);
      setJobDescription(''); // Clear text input if file is selected
    }
  };

  const handleAnalyze = async () => {
    const email = userEmail || localStorage.getItem('userEmail');
    
    if (!email) {
      alert('Please upload your resume first in the Resume Analyzer tab');
      return;
    }
    
    if (!targetRole.trim()) {
      alert('Please enter a target role');
      return;
    }

    if (useCustomJD && !jobDescription.trim() && !jobDescriptionFile) {
      alert('Please provide a job description (text or file)');
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (useCustomJD && jobDescriptionFile) {
        // Upload file
        const formData = new FormData();
        formData.append('email', email);
        formData.append('role', targetRole);
        formData.append('job_description_file', jobDescriptionFile);
        
        response = await axios.post('http://localhost:8000/api/analyze-role-with-file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Use text or no JD
        response = await axios.post('http://localhost:8000/api/analyze-role', {
          email: email,
          role: targetRole,
          job_description: useCustomJD ? jobDescription : null
        });
      }
      
      setResult(response.data);
      
      // Save result to localStorage
      localStorage.setItem('skillGapAnalysis', JSON.stringify(response.data));
      
      alert('🎯 AI analysis complete!');
    } catch (error) {
      if (error.response?.status === 404) {
        alert('No resume found. Please upload your resume first!');
      } else {
        alert('Failed to analyze. Make sure the backend is running.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          🎯 AI-Powered Skill Gap Analysis
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Step 2: Compare your skills with your target role using AI
        </p>
      </div>

      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
        {userEmail && (
          <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              📧 Analyzing for: <strong>{userEmail}</strong>
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Target Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g., Frontend Developer, Data Scientist, Backend Engineer"
            className={`w-full px-4 py-3 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-primary focus:border-transparent`}
          />
        </div>

        {/* Toggle for custom JD */}
        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomJD}
              onChange={(e) => setUseCustomJD(e.target.checked)}
              className="mr-2 w-4 h-4"
            />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              📄 I have a specific job description
            </span>
          </label>
        </div>

        {/* Job Description Input (conditional) */}
        {useCustomJD && (
          <div className="mb-4 space-y-3">
            <div>
              <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Option 1: Paste Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  setJobDescriptionFile(null); // Clear file if text is entered
                }}
                placeholder="Paste the job description here..."
                rows={6}
                className={`w-full px-4 py-3 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-primary focus:border-transparent`}
              />
            </div>

            <div className={`text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              OR
            </div>

            <div>
              <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Option 2: Upload Job Description File (PDF, DOCX, TXT)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                className={`w-full px-4 py-3 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer`}
              />
              {jobDescriptionFile && (
                <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ✓ Selected: {jobDescriptionFile.name}
                </p>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>AI is analyzing...</span>
            </>
          ) : (
            <>
              <span>🤖</span>
              <span>{useCustomJD ? 'Analyze with Custom JD' : 'Analyze with AI'}</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          {/* AI Insights */}
          {result.ai_insights && (
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border border-purple-500/50' : 'bg-white border border-purple-200'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <span>🤖</span>
                <span>AI Insights</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span>💪</span>
                    <span>Your Strengths:</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.ai_insights.strengths.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium shadow-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span>🎯</span>
                    <span>Focus Areas:</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.ai_insights.focus_areas.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium shadow-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ⏱️ <strong>Estimated Time:</strong> {result.ai_insights.estimated_time}
                </p>
              </div>
              {result.ai_insights.recommendations && result.ai_insights.recommendations.length > 0 && (
                <div className="mt-4">
                  <p className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span>💡</span>
                    <span>AI Recommendations:</span>
                  </p>
                  <ul className="space-y-2">
                    {result.ai_insights.recommendations.map((rec, i) => (
                      <li key={i} className={`flex items-start gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-primary mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Custom JD Badge */}
          {result.custom_jd && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/20 border border-green-500' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                ✓ <strong>Custom Job Description:</strong> Analysis based on your specific job posting
              </p>
            </div>
          )}

          {/* Skill Gap Analysis */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Skill Gap Analysis for {result.target_role}
            </h3>

            <div className="mb-6">
              <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completion Progress
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 dark:bg-gray-700">
                <div
                  className={`h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold ${
                    result.skill_gap.completion_percentage >= 70 ? 'bg-green-500' : 
                    result.skill_gap.completion_percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.skill_gap.completion_percentage}%` }}
                >
                  {result.skill_gap.completion_percentage}%
                </div>
              </div>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Role Level: <strong>{result.skill_gap.role_level}</strong>
              </p>
            </div>

            {result.skill_gap.matching_skills && result.skill_gap.matching_skills.length > 0 && (
              <div className="mb-4">
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ✓ Skills You Have ({result.skill_gap.matching_skills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.skill_gap.matching_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.skill_gap.missing_skills && result.skill_gap.missing_skills.length > 0 && (
              <div className="mb-4">
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  ✗ Skills to Learn ({result.skill_gap.missing_skills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.skill_gap.missing_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-500' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              💡 <strong>Next Step:</strong> Check out the "Personalized Roadmap" tab to get an AI-generated learning plan!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGap;
