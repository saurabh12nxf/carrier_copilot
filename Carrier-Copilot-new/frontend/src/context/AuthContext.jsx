import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { formatApiError } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clear all cached data belonging to any previous session
  const clearSessionStorage = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('resumeAnalysis');
    localStorage.removeItem('skillGapAnalysis');
    localStorage.removeItem('roadmapData');
    localStorage.removeItem('onboardingCompleted');
  }, []);

  // Verify active session on initial application load
  const verifySession = useCallback(async () => {
    const storedToken = localStorage.getItem('token');

    if (!storedToken || storedToken === 'dummy-token') {
      clearSessionStorage();
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      // Validate token against backend /api/auth/me
      const response = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      const activeUser = response.data?.user;
      if (activeUser && activeUser.email) {
        setUser(activeUser);
        setToken(storedToken);
        localStorage.setItem('user', JSON.stringify(activeUser));
        localStorage.setItem('userEmail', activeUser.email);
        localStorage.setItem('userName', activeUser.name || 'User');
      } else {
        throw new Error('User profile invalid or incomplete');
      }
    } catch (err) {
      console.warn('[AUTH] Stale or invalid session detected, resetting:', err?.message || err);
      clearSessionStorage();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [clearSessionStorage]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // Login handler
  const login = async (email, password) => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    if (!trimmedEmail) throw new Error('Please enter your email address');
    if (!password) throw new Error('Please enter your password');

    // Wipe any existing session before logging in with a new account
    clearSessionStorage();
    setUser(null);
    setToken(null);

    const response = await api.post('/api/auth/login', {
      email: trimmedEmail,
      username: trimmedEmail,
      password: password,
    });

    const accessToken = response.data?.access_token || response.data?.token;
    const userData = response.data?.user;

    if (!accessToken || accessToken === 'dummy-token') {
      throw new Error('Authentication failed: No valid access token returned by server.');
    }
    if (!userData || !userData.email) {
      throw new Error('Authentication failed: Incomplete user profile returned by server.');
    }

    // Persist session
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userName', userData.name || 'User');

    setToken(accessToken);
    setUser(userData);

    return userData;
  };

  // Signup handler
  const signup = async (name, email, password) => {
    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      throw new Error('Please enter your full name (at least 2 characters)');
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    clearSessionStorage();
    setUser(null);
    setToken(null);

    const response = await api.post('/api/auth/signup', {
      name: trimmedName,
      full_name: trimmedName,
      fullName: trimmedName,
      email: trimmedEmail,
      password: password,
    });

    const accessToken = response.data?.access_token || response.data?.token;
    const userData = response.data?.user;

    if (!accessToken || accessToken === 'dummy-token') {
      throw new Error('Registration failed: No valid access token returned by server.');
    }

    const finalUser = userData || { email: trimmedEmail, name: trimmedName };

    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(finalUser));
    localStorage.setItem('userEmail', finalUser.email);
    localStorage.setItem('userName', finalUser.name || 'User');

    setToken(accessToken);
    setUser(finalUser);

    return finalUser;
  };

  // Logout handler
  const logout = async () => {
    try {
      if (token) {
        await api.post('/api/auth/logout').catch(() => {});
      }
    } finally {
      clearSessionStorage();
      setUser(null);
      setToken(null);
    }
  };

  // Mark onboarding complete on backend and in state
  const completeOnboarding = async (targetEmail) => {
    const emailToUse = targetEmail || user?.email || localStorage.getItem('userEmail');
    if (emailToUse) {
      localStorage.setItem(`onboardingCompleted_${emailToUse}`, 'true');
      try {
        await api.post('/api/auth/complete-onboarding', { email: emailToUse });
      } catch (e) {
        console.warn('Failed to update onboarding on backend:', e);
      }
    }
    setUser((prev) => (prev ? { ...prev, isFirstLogin: false, is_first_login: false } : prev));
    try {
      const cached = localStorage.getItem('user');
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.isFirstLogin = false;
        parsed.is_first_login = false;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
    } catch (e) {}
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    signup,
    logout,
    refreshSession: verifySession,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
