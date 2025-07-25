"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, type User, type Company, type LoginRequest, type RegisterRequest, type ApiResponse } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  companies: Company[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<ApiResponse<any>>;
  register: (userData: RegisterRequest, companyName?: string) => Promise<ApiResponse<any>>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshCompanies: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        apiClient.clearTokens();
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      apiClient.clearTokens();
    }
  };

  const refreshCompanies = async () => {
    try {
      const response = await apiClient.getUserCompanies();
      if (response.data) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      setCompanies([]);
    }
  };

  const login = async (credentials: LoginRequest): Promise<ApiResponse<any>> => {
    setIsLoading(true);
    try {
      const response = await apiClient.login(credentials);
      
      if (response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        // Fetch user's companies after successful login
        await refreshCompanies();
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest, companyName?: string): Promise<ApiResponse<any>> => {
    setIsLoading(true);
    try {
      const response = await apiClient.register(userData);
      
      if (response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // If company name is provided, create the company
        if (companyName?.trim()) {
          const companyResponse = await apiClient.createCompany({
            name: companyName.trim(),
            description: `${companyName.trim()} - Restaurant company`
          });
          
          if (companyResponse.data) {
            localStorage.setItem('companyName', companyName);
            setCompanies([companyResponse.data]);
          }
        }
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
      setUser(null);
      setCompanies([]);
      setIsAuthenticated(false);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiClient.getAccessToken();
      
      if (token) {
        // Try to refresh the token first
        const refreshed = await apiClient.refreshAccessToken();
        
        if (refreshed || token) {
          await refreshUser();
          await refreshCompanies();
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Auto-refresh token when it's close to expiring
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      await apiClient.refreshAccessToken();
    }, 30 * 60 * 1000); // Refresh every 30 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    companies,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    refreshCompanies,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 