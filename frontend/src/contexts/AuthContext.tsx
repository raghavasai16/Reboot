import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number | string; // For candidates: numeric id from candidates table. For HR: only for profile, not onboarding actions.
  email: string;
  name: string;
  role: 'candidate' | 'hr' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore user session from localStorage
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('authUser');
    if (token && userStr) {
      setUser(JSON.parse(userStr));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }
      const role = data.role;
      const name = (data.firstName || '') + ' ' + (data.lastName || '');
      // Prefer numeric id from backend, fallback to email if not present
      const userObj: User = {
        id: typeof data.id === 'number' ? data.id : (data.id ? Number(data.id) : data.email),
        email: data.email,
        name: name.trim(),
        role: role,
      };
      setUser(userObj);
      localStorage.setItem('authUser', JSON.stringify(userObj));
      localStorage.setItem('authToken', 'mock-jwt-token');
      return userObj;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};