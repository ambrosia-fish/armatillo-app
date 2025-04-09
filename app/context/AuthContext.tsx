import React, { createContext, useContext, useState, useEffect, ReactNode, useReducer } from 'react';
import { Alert, Platform } from 'react-native';
import { router, useRouter, useSegments } from 'expo-router';
import storage, { STORAGE_KEYS } from '../utils/storage';
import { storeAuthTokens, clearAuthTokens } from '../utils/tokenUtils';
import api from '../services/api';
import { errorService } from '../services/ErrorService';

/**
 * User interface
 */
interface User {
  id: string;
  email: string;
  displayName: string;
  username?: string;
  isPendingApproval?: boolean;
}

/**
 * Auth response from API
 */
interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  user: User;
}

/**
 * Auth state enum
 */
enum AuthState {
  INITIALIZING = 'initializing',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  LOGGING_OUT = 'logging_out',
  PENDING_APPROVAL = 'pending_approval'
}

/**
 * Auth context interface
 */
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
  authState: AuthState;
}

/**
 * Registration data interface
 */
interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

/**
 * Auth state interface for reducer
 */
interface AuthStateInterface {
  user: User | null;
  token: string | null;
  authState: AuthState;
  error: Error | null;
}

/**
 * Auth action interface for reducer
 */
type AuthAction =
  | { type: 'INITIALIZE_SUCCESS'; payload: { user: User | null; token: string | null } }
  | { type: 'INITIALIZE_ERROR'; payload: { error: Error } }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_ERROR'; payload: { error: Error } }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_ERROR'; payload: { error: Error } }
  | { type: 'LOGOUT_START' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'LOGOUT_ERROR'; payload: { error: Error } }
  | { type: 'REFRESH_SUCCESS'; payload: { user?: User; token: string } }
  | { type: 'REFRESH_ERROR'; payload: { error: Error } };

/**
 * Initial auth state
 */
const initialAuthState: AuthStateInterface = {
  user: null,
  token: null,
  authState: AuthState.INITIALIZING,
  error: null
};

/**
 * Auth reducer for managing auth state transitions
 */
function authReducer(state: AuthStateInterface, action: AuthAction): AuthStateInterface {
  switch (action.type) {
    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        authState: action.payload.user?.isPendingApproval 
          ? AuthState.PENDING_APPROVAL
          : action.payload.token && action.payload.user 
            ? AuthState.AUTHENTICATED 
            : AuthState.UNAUTHENTICATED,
        error: null
      };
    case 'INITIALIZE_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        authState: AuthState.UNAUTHENTICATED,
        error: action.payload.error
      };
    case 'LOGIN_START':
      return {
        ...state,
        authState: AuthState.INITIALIZING,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        authState: action.payload.user.isPendingApproval
          ? AuthState.PENDING_APPROVAL
          : AuthState.AUTHENTICATED,
        error: null
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        authState: AuthState.UNAUTHENTICATED,
        error: action.payload.error
      };
    case 'REGISTER_START':
      return {
        ...state,
        authState: AuthState.INITIALIZING,
        error: null
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        authState: action.payload.user.isPendingApproval
          ? AuthState.PENDING_APPROVAL
          : AuthState.AUTHENTICATED,
        error: null
      };
    case 'REGISTER_ERROR':
      return {
        ...state,
        authState: AuthState.UNAUTHENTICATED,
        error: action.payload.error
      };
    case 'LOGOUT_START':
      return {
        ...state,
        authState: AuthState.LOGGING_OUT,
        error: null
      };
    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        user: null,
        token: null,
        authState: AuthState.UNAUTHENTICATED,
        error: null
      };
    case 'LOGOUT_ERROR':
      return {
        ...state,
        user: null, // Still clear user data even on error
        token: null, // Still clear token even on error
        authState: AuthState.UNAUTHENTICATED, // Still consider user logged out even on error
        error: action.payload.error
      };
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        user: action.payload.user || state.user,
        token: action.payload.token,
        authState: state.authState === AuthState.AUTHENTICATED 
          ? AuthState.AUTHENTICATED 
          : action.payload.user?.isPendingApproval
            ? AuthState.PENDING_APPROVAL
            : action.payload.token 
              ? AuthState.AUTHENTICATED 
              : AuthState.UNAUTHENTICATED,
        error: null
      };
    case 'REFRESH_ERROR':
      return {
        ...state,
        authState: AuthState.UNAUTHENTICATED,
        error: action.payload.error
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    loadAuthState();
  }, []);

  /**
   * Load authentication state from storage
   */
  const loadAuthState = async () => {
    try {
      setIsLoading(true);
      
      // First try to load from storage
      let storedToken = await storage.getItem(STORAGE_KEYS.TOKEN);
      let storedUser = await storage.getObject<User>(STORAGE_KEYS.USER);
      
      // For web platform, check localStorage directly as fallback
      if (Platform.OS === 'web' && (!storedToken || !storedUser)) {
        const localToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (localToken) {
          storedToken = localToken;
          // Ensure it's available in storage
          await storage.setItem(STORAGE_KEYS.TOKEN, localToken);
        }
        
        const localUserJson = localStorage.getItem(STORAGE_KEYS.USER);
        if (localUserJson) {
          try {
            const localUser = JSON.parse(localUserJson);
            storedUser = localUser;
            // Ensure it's available in storage
            await storage.setObject(STORAGE_KEYS.USER, localUser);
          } catch (parseError) {
            errorService.handleError(parseError instanceof Error ? parseError : String(parseError), {
              source: 'storage',
              level: 'warning',
              displayToUser: false,
              context: { action: 'parseLocalStorageUser' }
            });
          }
        }
      }

      if (storedToken && storedUser) {
        // Also store display name for easy access if available
        if (storedUser.displayName) {
          await storage.setItem(STORAGE_KEYS.USER_NAME, storedUser.displayName);
        }
        
        // Update state with stored auth data
        dispatch({ 
          type: 'INITIALIZE_SUCCESS', 
          payload: { user: storedUser, token: storedToken } 
        });
      } else {
        // No stored auth data found
        dispatch({ 
          type: 'INITIALIZE_SUCCESS', 
          payload: { user: null, token: null } 
        });
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        displayToUser: false,
        context: { action: 'loadAuthState' }
      });
      
      // Clear auth state on error and set to unauthenticated
      await clearAuthState();
      dispatch({ 
        type: 'INITIALIZE_ERROR', 
        payload: { error: error instanceof Error ? error : new Error(String(error)) } 
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh authentication using refresh token
   */
  const refreshAuth = async (): Promise<boolean> => {
    if (!state.token) return false;
    
    try {
      // Pass empty string to refreshToken if required
      const response = await api.auth.refreshToken('');
      
      if (response?.success && response?.token) {
        await storeAuthTokens(
          response.token,
          response.expiresIn,
          response.refreshToken
        );
        
        // Update state with new token and user if provided
        dispatch({ 
          type: 'REFRESH_SUCCESS', 
          payload: { 
            token: response.token,
            user: response.user 
          } 
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        level: 'warning',
        displayToUser: false,
        context: { action: 'refreshAuth' }
      });
      
      // On refresh error, clear auth state
      await clearAuthState();
      dispatch({ 
        type: 'REFRESH_ERROR', 
        payload: { error: error instanceof Error ? error : new Error(String(error)) } 
      });
      
      return false;
    }
  };

  /**
   * Clear authentication state from storage
   */
  const clearAuthState = async () => {
    try {
      // Clear tokens using utility
      await clearAuthTokens();
      
      // For web platform, also clear localStorage directly
      if (Platform.OS === 'web') {
        // Force clear all auth-related items
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.USER_NAME);
        console.log('Web localStorage cleared');
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        displayToUser: false,
        context: { action: 'clearAuthState' }
      });
      // Error is already logged, but we don't throw here to allow logout process to continue
    }
  };

  /**
   * Process authentication response
   */
  const processAuthResponse = async (authResponse: AuthResponse) => {
    try {
      const { success, token, user, expiresIn, refreshToken } = authResponse;
      
      // Validate response
      if (!success || !token || !user || !user.id) {
        throw new Error('Invalid authentication response');
      }
      
      // Store tokens and user data
      await storeAuthTokens(token, expiresIn, refreshToken);
      await storage.setObject(STORAGE_KEYS.USER, user);
      
      // For web platform, ensure localStorage is also set directly
      if (Platform.OS === 'web') {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
        
        if (expiresIn) {
          const expiryTime = Date.now() + expiresIn * 1000;
          localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
        }
      }
      
      // If user has displayName, store it for easy access
      if (user.displayName) {
        await storage.setItem(STORAGE_KEYS.USER_NAME, user.displayName);
      }
      
      return { user, token };
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        level: 'error',
        context: { action: 'processAuthResponse' }
      });
      throw error;
    }
  };

  /**
   * Login user with email and password
   */
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      setIsLoading(true);
      
      const response = await api.auth.login(email, password);
      
      // Process the response
      const { user, token } = await processAuthResponse(response);
      
      // Update auth state
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token } 
      });
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        level: 'error',
        context: { action: 'login', email }
      });
      
      // Update state to reflect error
      dispatch({ 
        type: 'LOGIN_ERROR', 
        payload: { error: error instanceof Error ? error : new Error(String(error)) } 
      });
      
      // Show user-friendly error message
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new user
   */
  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'REGISTER_START' });
      setIsLoading(true);
      
      const response = await api.auth.register(userData);
      
      if (response?.success) {
        if (response.token && response.user) {
          // Process the response and update state
          const { user, token } = await processAuthResponse(response);
          
          dispatch({ 
            type: 'REGISTER_SUCCESS', 
            payload: { user, token } 
          });
          
          return response;
        } else {
          // Registration successful but no token received
          // This likely means manual approval is required
          Alert.alert('Success', 'Account created successfully! Please log in once approved.');
          
          dispatch({ 
            type: 'REGISTER_SUCCESS', 
            payload: { 
              user: { ...response.user, isPendingApproval: true },
              token: '' 
            } 
          });
        }
      }
      
      return response;
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        level: 'error',
        context: { action: 'register', email: userData.email }
      });
      
      // Update state to reflect error
      dispatch({ 
        type: 'REGISTER_ERROR', 
        payload: { error: error instanceof Error ? error : new Error(String(error)) } 
      });
      
      // Show user-friendly error message
      Alert.alert('Registration Failed', 'Could not create account. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      dispatch({ type: 'LOGOUT_START' });
      setIsLoading(true);
      
      // Attempt to notify server about logout if we have a token
      if (state.token) {
        try {
          await api.auth.logout();
        } catch (error) {
          // Don't let server errors prevent client-side logout
          errorService.handleError(error instanceof Error ? error : String(error), {
            source: 'auth',
            level: 'warning',
            displayToUser: false,
            context: { action: 'serverLogout' }
          });
        }
      }
      
      // Clear all auth state
      await clearAuthState();
      
      // Update state to reflect logout
      dispatch({ type: 'LOGOUT_SUCCESS' });
      
      // Let the router in ProtectedLayout handle the navigation
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        level: 'error',
        context: { action: 'logout' }
      });
      
      // Update state to reflect error, but still consider user logged out
      dispatch({ 
        type: 'LOGOUT_ERROR', 
        payload: { error: error instanceof Error ? error : new Error(String(error)) } 
      });
      
      // Show user-friendly error message only on client-side logout failure
      Alert.alert('Logout Error', 'There was a problem signing out, but you have been disconnected from the app.');
    } finally {
      setIsLoading(false);
    }
  };

  // Compute derived state
  const isAuthenticated = state.authState === AuthState.AUTHENTICATED;
  const isPendingApproval = state.authState === AuthState.PENDING_APPROVAL;

  // Provide auth context
  const value = {
    user: state.user,
    token: state.token,
    isLoading,
    isAuthenticated,
    isPendingApproval,
    login,
    register,
    logout,
    refreshAuth,
    authState: state.authState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default { AuthProvider, useAuth };