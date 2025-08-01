import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api } from '../lib/api';
import { hashPassword, encryptToken, decryptToken } from '../lib/crypto';

interface AdminUser {
  username: string;
  is_active: boolean;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Secure token storage with encryption
  const storeToken = (rawToken: string) => {
    try {
      const encryptedToken = encryptToken(rawToken);
      sessionStorage.setItem('auth_token_encrypted', encryptedToken);
      setToken(rawToken);
      api.setToken(rawToken);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  };

  const getStoredToken = (): string | null => {
    try {
      const encryptedToken = sessionStorage.getItem('auth_token_encrypted');
      if (!encryptedToken) return null;
      return decryptToken(encryptedToken);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  const clearStoredToken = () => {
    sessionStorage.removeItem('auth_token_encrypted');
    setToken(null);
    api.clearToken();
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Hash password before sending (NEVER send plain text!)
      const hashedPassword = hashPassword(password);
      
      // Authenticate with backend using username and hashed password
      const response = await api.login(username, hashedPassword);
      
      if (response.access_token) {
        // Store token securely
        storeToken(response.access_token);
        
        // Get user info
        const userInfo = await api.getCurrentUser();
        setUser(userInfo);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setToken(null);
  }, []);

  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      // Set token and verify with backend
      api.setToken(storedToken);
      const userInfo = await api.getCurrentUser();
      
      setToken(storedToken);
      setUser(userInfo);
    } catch (error) {
      console.error('Auth refresh failed:', error);
      clearStoredToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Token rotation for enhanced security
  useEffect(() => {
    const rotateToken = async () => {
      if (!isAuthenticated || !token) return;
      
      try {
        // Check if token is close to expiry (every 25 minutes, token expires in 30)
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = tokenPayload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;
        
        // If less than 5 minutes remaining, refresh by re-authenticating
        if (timeUntilExpiry < 5 * 60 * 1000) {
          // Force logout to prompt re-authentication
          logout();
        }
      } catch (error) {
        // If token is malformed, logout
        logout();
      }
    };

    // Check token every minute
    const interval = setInterval(rotateToken, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token, logout]);

  // Initialize auth on mount
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You must be logged in to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}