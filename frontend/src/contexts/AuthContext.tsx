import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
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
    // Simulate checking for existing session
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole') || 'candidate';
    if (token) {
      // Simulate user data fetch
      setTimeout(() => {
        setUser({
          id: '1',
          email: userRole === 'hr' ? 'hr@company.com' : 'candidate@example.com',
          name: userRole === 'hr' ? 'Sai HR Manager' : 'Veera Candidate',
          role: userRole as 'candidate' | 'hr' | 'admin',
        });
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
    }
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
      const userObj: User = {
        id: data.email,
        email: data.email,
        name: name.trim(),
        role: role,
      };
      setUser(userObj);
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('userRole', role);
      return userObj;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
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