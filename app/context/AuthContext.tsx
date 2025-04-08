import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import storage, { STORAGE_KEYS } from '../utils/storage';
import { storeAuthTokens, clearAuthTokens } from '../utils/tokenUtils';
import api from '../services/api';
import { errorService } from '../services/ErrorService';

interface User {
  id: string;
  email: string;
  displayName: string;
  username?: string;
  approved?: boolean;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: User;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPendingApproval: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const isAuthenticated = !!token && !!user && user.approved === true;

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const storedToken = await storage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = await storage.getObject<User>(STORAGE_KEYS.USER);
      const pendingApproval = await storage.getItem(STORAGE_KEYS.PENDING_APPROVAL);

      if (pendingApproval === 'true') {
        setIsPendingApproval(true);
      }

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        
        if (storedUser.displayName) {
          await storage.setItem(STORAGE_KEYS.USER_NAME, storedUser.displayName);
        }
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        displayToUser: false,
        context: { action: 'loadAuthState' }
      });
      await clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    if (!token) return false;
    
    try {
      // Pass empty string to refreshToken if required
      const response = await api.auth.refreshToken('');
      
      if (response?.success && response?.token) {
        await storeAuthTokens(
          response.token,
          response.expiresIn,
          response.refreshToken
        );
        
        setToken(response.token);
        
        if (response.user) {
          setUser(response.user);
          await storage.setObject(STORAGE_KEYS.USER, response.user);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      // Check if error is due to not being approved
      if (error instanceof Error && error.message.includes('not approved')) {
        await clearAuthState();
        await storage.setItem(STORAGE_KEYS.PENDING_APPROVAL, 'true');
        setIsPendingApproval(true);
        setToken(null);
        setUser(null);
        router.replace('/screens/auth/login');
        return false;
      }
      
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        level: 'warning',
        displayToUser: false,
        context: { action: 'refreshAuth' }
      });
      await clearAuthState();
      return false;
    }
  };

  const clearAuthState = async () => {
    try {
      await clearAuthTokens();
      setToken(null);
      setUser(null);
      await storage.removeItem(STORAGE_KEYS.PENDING_APPROVAL);
      setIsPendingApproval(false);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        displayToUser: false,
        context: { action: 'clearAuthState' }
      });
    }
  };

  const processAuthResponse = async (authResponse: AuthResponse) => {
    try {
      const { success, token, user, expiresIn, refreshToken, message } = authResponse;
      
      // Check if user is pending approval
      if (success && !token && user && user.approved === false) {
        await storage.setObject(STORAGE_KEYS.USER, user);
        await storage.setItem(STORAGE_KEYS.PENDING_APPROVAL, 'true');
        setUser(user);
        setIsPendingApproval(true);
        
        // Show approval pending modal instead of alert
        router.push('/screens/modals/approval-pending-modal');
        return;
      }
      
      if (!success || !token || !user) {
        throw new Error('Invalid authentication response');
      }
      
      // Store approved status
      if (user.approved) {
        await storage.removeItem(STORAGE_KEYS.PENDING_APPROVAL);
        setIsPendingApproval(false);
      }
      
      await storeAuthTokens(token, expiresIn, refreshToken);
      await storage.setObject(STORAGE_KEYS.USER, user);
      
      setToken(token);
      setUser(user);
      
      router.replace('/(tabs)');
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        level: 'error',
        context: { action: 'processAuthResponse' }
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.auth.login(email, password);
      await processAuthResponse(response);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        level: 'error',
        context: { action: 'login', email }
      });
      
      // Special handling for approval errors
      if (error instanceof Error && error.message.includes('Thank You for your interest in Armatillo')) {
        await storage.setItem(STORAGE_KEYS.PENDING_APPROVAL, 'true');
        setIsPendingApproval(true);
        router.push('/screens/modals/approval-pending-modal');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await api.auth.register(userData);
      
      if (response?.success) {
        if (response.token && response.user) {
          await processAuthResponse(response);
          return;
        }
        
        // Handle the case where registration is successful but user needs approval
        if (response.message && response.message.includes('pending approval')) {
          await storage.setItem(STORAGE_KEYS.PENDING_APPROVAL, 'true');
          setIsPendingApproval(true);
          
          if (response.user) {
            await storage.setObject(STORAGE_KEYS.USER, response.user);
            setUser(response.user);
          }
          
          // Show approval pending modal instead of alert
          router.push('/screens/modals/approval-pending-modal');
          return;
        }
        
        Alert.alert('Success', 'Account created successfully! Please log in.');
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        level: 'error',
        context: { action: 'register', email: userData.email }
      });
      Alert.alert('Registration Failed', 'Could not create account. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      if (token) {
        try {
          await api.auth.logout();
        } catch (error) {
          errorService.handleError(error instanceof Error ? error : String(error), {
            source: 'auth',
            level: 'warning',
            displayToUser: false,
            context: { action: 'serverLogout' }
          });
        }
      }
      
      await clearAuthState();
      router.replace('/screens/auth/login');
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        context: { action: 'logout' }
      });
      Alert.alert('Logout Failed', 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    isPendingApproval,
    login,
    register,
    logout,
    refreshAuth
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

export default { AuthProvider, useAuth };