import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResumeAnalyzer = ({ darkMode, userEmail }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    // Load previous result from localStorage
    const savedResult = localStorage.getItem('resumeAnalysis');
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        setResult(parsed);
        setShowUpload(false); // Hide upload if resume exists
      } catch (e) {
        console.error('Failed to parse saved result');
        setShowUpload(true);
      }
    } else {
      setShowUpload(true); // Show upload if no resume
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        alert('Please upload a PDF, DOCX, or TXT file');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert('Please select a resume file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', userEmail);

    try {
      const response = await axios.post('http://localhost:8000/api/resume-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(response.data);
      
      // Save result to localStorage
      localStorage.setItem('resumeAnalysis', JSON.stringify(response.data));
      
      setShowUpload(false); // Hide upload form after successful analysis
      alert('🎉 Resume analyzed! Skills extracted using AI and stored in your profile.');
    } catch (error) {
      alert('Failed to analyze resume. Make sure the backend is running.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeResume = () => {
    setShowUpload(true);
    setFile(null);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📄 Resume Analyzer
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Step 1: Upload your resume to extract skills using AI
        </p>
      </div>

      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
        {result && !showUpload ? (
          // Show existing resume with option to change
          <div>
            <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-green-900/20 border border-green-500' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                ✅ Resume uploaded and analyzed
              </p>
            </div>
            <button
              onClick={handleChangeResume}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                darkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              📝 Change Resume
            </button>
          </div>
        ) : (
          // Show upload form
          <div>
            <div className="mb-4">
              <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Upload Resume (PDF, DOCX, or TXT) <span className="text-red-500">*</span>
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
              {file && (
                <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ✓ Selected: {file.name}
                </p>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <span>🤖</span>
                  <span>Analyze Resume with AI</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      {result && (
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ✨ AI Analysis Results
          </h3>

          <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-green-900/20 border border-green-500' : 'bg-green-50 border border-green-200'}`}>
            <p className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
              ✓ Success! Your skills have been extracted and saved to your profile.
            </p>
          </div>

          <div className="mb-4">
            <h4 className={`font-semibold mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              🎯 Extracted Skills ({result.total_skills})
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.extracted_skills && result.extracted_skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-purple-900/20 border border-purple-500' : 'bg-purple-50 border border-purple-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              💡 <strong>Next Step:</strong> Go to "Skill Gap Analysis" or "Personalized Roadmap" to see how your skills match your target role!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
