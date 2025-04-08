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
  clearApprovalStatus: () => Promise<void>;
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
      } else {
        setIsPendingApproval(false);
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

  // New function specifically for clearing approval status and auth state from modal
  const clearApprovalStatus = async () => {
    try {
      console.log("Auth context: clearing approval status");
      
      // Ensure state is updated first to prevent navigation loops
      setIsPendingApproval(false);
      setToken(null);
      setUser(null);
      
      // Then clear storage
      await storage.removeItem(STORAGE_KEYS.PENDING_APPROVAL);
      
      // Clear all auth-related storage
      const keysToRemove = [
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.TOKEN_EXPIRY,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.USER_NAME
      ].filter(Boolean);
      
      for (const key of keysToRemove) {
        await storage.removeItem(key);
      }
      
      console.log("Auth context: approval status and auth cleared successfully");
      return true;
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        displayToUser: false,
        context: { action: 'clearApprovalStatus' }
      });
      return false;
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
      
      try {
        const response = await api.auth.login(email, password);
        await processAuthResponse(response);
      } catch (error) {
        // Special handling for approval errors - don't throw the error, just handle it gracefully
        if (error instanceof Error && 
           (error.message.includes('pre-alpha') || 
            error.message.includes('testing is only available') || 
            error.message.includes('Thank You for your interest in Armatillo'))) {
          
          console.log("Login detected pre-alpha approval message");
          
          // Log the error for debugging but don't re-throw
          errorService.handleError(error, {
            source: 'auth',
            level: 'info', // Downgrade from error to info since this is expected
            displayToUser: false,
            context: { action: 'login.pendingApproval', email }
          });
          
          await storage.setItem(STORAGE_KEYS.PENDING_APPROVAL, 'true');
          setIsPendingApproval(true);
          
          // Navigate to approval modal
          router.push('/screens/modals/approval-pending-modal');
          return; // Return without throwing
        } else {
          // For other errors, log and show alert
          errorService.handleError(error instanceof Error ? error : String(error), {
            source: 'auth',
            level: 'error',
            context: { action: 'login', email }
          });
          
          Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
          throw error; // Only throw for non-approval errors
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      
      try {
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
        // Special handling for approval errors - don't throw the error
        if (error instanceof Error && 
           (error.message.includes('pre-alpha') || 
            error.message.includes('testing is only available') || 
            error.message.includes('Thank You for your interest in Armatillo'))) {
            
          console.log("Registration detected pre-alpha approval message");
          
          // Log the error for debugging but don't re-throw
          errorService.handleError(error, {
            source: 'auth',
            level: 'info', // Downgrade from error to info
            displayToUser: false,
            context: { action: 'register.pendingApproval', email: userData.email }
          });
          
          await storage.setItem(STORAGE_KEYS.PENDING_APPROVAL, 'true');
          setIsPendingApproval(true);
          
          // Navigate to approval modal
          router.push('/screens/modals/approval-pending-modal');
          return; // Return without throwing
        } else {
          // For other errors, log and show alert
          errorService.handleError(error instanceof Error ? error : String(error), {
            source: 'auth',
            level: 'error',
            context: { action: 'register', email: userData.email }
          });
          
          Alert.alert('Registration Failed', 'Could not create account. Please try again.');
          throw error; // Only throw for non-approval errors
        }
      }
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
    clearApprovalStatus,
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