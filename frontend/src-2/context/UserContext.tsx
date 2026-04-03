import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/src/types';

interface UserContextType {
  user: { uid: string; email: string; displayName: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; email: string; displayName: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('track_user');
    const storedProfile = localStorage.getItem('track_profile');
    
    if (storedUser && storedProfile) {
      setUser(JSON.parse(storedUser));
      setProfile(JSON.parse(storedProfile));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, role: UserRole) => {
    const mockUser = {
      uid: Math.random().toString(36).substr(2, 9),
      email,
      displayName: email.split('@')[0],
    };
    const mockProfile: UserProfile = {
      uid: mockUser.uid,
      email: mockUser.email,
      displayName: mockUser.displayName,
      role,
      createdAt: Date.now(),
    };
    
    setUser(mockUser);
    setProfile(mockProfile);
    localStorage.setItem('track_user', JSON.stringify(mockUser));
    localStorage.setItem('track_profile', JSON.stringify(mockProfile));
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('track_user');
    localStorage.removeItem('track_profile');
  };

  const setRole = async (role: UserRole) => {
    if (!profile) return;
    const newProfile = { ...profile, role };
    setProfile(newProfile);
    localStorage.setItem('track_profile', JSON.stringify(newProfile));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    localStorage.setItem('track_profile', JSON.stringify(newProfile));
  };

  return (
    <UserContext.Provider value={{ user, profile, loading, login, logout, setRole, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
