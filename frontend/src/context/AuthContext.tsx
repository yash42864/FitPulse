import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fitpulse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('fitpulse_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.user) {
        const u = {
          id: res.data.user._id,
          name: res.data.user.name,
          email: res.data.user.email,
          height: res.data.user.height,
          currentWeight: res.data.user.currentWeight,
          activityLevel: res.data.user.activityLevel,
          fitnessGoal: res.data.user.fitnessGoal,
          timezone: res.data.user.timezone,
          preferences: res.data.user.preferences,
        };
        setUser(u);
        localStorage.setItem('fitpulse_user', JSON.stringify(u));
      }
    } catch (err) {
      // If failed, clear auth
      setUser(null);
      setToken(null);
      localStorage.removeItem('fitpulse_user');
      localStorage.removeItem('fitpulse_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const receivedToken = res.data.token;
      const receivedUser = res.data.user;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('fitpulse_token', receivedToken);
      localStorage.setItem('fitpulse_user', JSON.stringify(receivedUser));
    }
  };

  const register = async (userData: any) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success) {
      const receivedToken = res.data.token;
      const receivedUser = res.data.user;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('fitpulse_token', receivedToken);
      localStorage.setItem('fitpulse_user', JSON.stringify(receivedUser));
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore network logout errors
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('fitpulse_user');
      localStorage.removeItem('fitpulse_token');
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      const nextUser = { ...user, ...updated };
      setUser(nextUser);
      localStorage.setItem('fitpulse_user', JSON.stringify(nextUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
