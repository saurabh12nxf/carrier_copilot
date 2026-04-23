import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import RoadmapWeekly from './RoadmapWeekly';

const Roadmap = ({ darkMode, userEmail }) => {
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Load previous result from localStorage
    const savedResult = localStorage.getItem('roadmapData');
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (e) {
        console.error('Failed to parse saved result');
      }
    }
  }, []);

  const handleGenerate = async () => {
    const email = userEmail || localStorage.getItem('userEmail');
    
    if (!email) {
      toast.error('Please upload your resume first in the Resume Analyzer tab');
      return;
    }
    
    if (!targetRole.trim()) {
      toast.error('Please enter a target role');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/roadmap', {
        email: email,
        target_role: targetRole
      });
      
      setResult(response.data);
      
      // Save result to localStorage
      localStorage.setItem('roadmapData', JSON.stringify(response.data));
      
      toast.success('🗺️ Personalized week-by-week roadmap generated!');
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('No resume found. Please upload your resume first!');
      } else {
        toast.error('Failed to generate roadmap. Make sure the backend is running.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          🗺️ Personalized Learning Roadmap
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Step 3: Get an AI-generated week-by-week learning path tailored to your skills
        </p>
      </div>

      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
        {userEmail && (
          <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              📧 Generating roadmap for: <strong>{userEmail}</strong>
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

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>AI is creating your roadmap...</span>
            </>
          ) : (
            <>
              <span>🤖</span>
              <span>Generate Week-by-Week Roadmap</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <RoadmapWeekly roadmap={result} darkMode={darkMode} />
      )}
    </div>
  );
};

export default Roadmap;
