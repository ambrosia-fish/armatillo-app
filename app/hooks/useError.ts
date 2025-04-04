import { useMemo } from 'react';
import { errorService, ErrorOptions, ErrorLevel, ErrorSource } from '../services/ErrorService';

/**
 * Interface for the error handling methods returned by the useError hook
 */
interface ErrorHandlers {
  /**
   * Generic error handler with full options control
   * 
   * @param error - The error that occurred
   * @param options - Options to control error handling behavior
   * @returns The error object created by the service
   */
  handleError: (error: Error | string, options?: ErrorOptions) => ReturnType<typeof errorService.handleError>;
  
  /**
   * Specialized handler for API-related errors
   * 
   * @param error - The error that occurred
   * @param context - Additional context information
   * @param level - Error severity level (defaults to 'error')
   * @param displayToUser - Whether to show the error to the user (defaults to true)
   * @returns The error object created by the service
   */
  apiError: (
    error: Error | string, 
    context?: Record<string, any>,
    level?: ErrorLevel,
    displayToUser?: boolean
  ) => ReturnType<typeof errorService.handleError>;
  
  /**
   * Specialized handler for authentication-related errors
   * 
   * @param error - The error that occurred
   * @param context - Additional context information
   * @param level - Error severity level (defaults to 'error')
   * @param displayToUser - Whether to show the error to the user (defaults to true)
   * @returns The error object created by the service
   */
  authError: (
    error: Error | string, 
    context?: Record<string, any>,
    level?: ErrorLevel,
    displayToUser?: boolean
  ) => ReturnType<typeof errorService.handleError>;
  
  /**
   * Specialized handler for network-related errors
   * 
   * @param error - The error that occurred
   * @param silent - Whether to suppress user notifications (defaults to false)
   * @param level - Error severity level (defaults to 'error')
   * @param context - Additional context information
   * @returns The error object created by the service
   */
  networkError: (
    error: Error | string, 
    silent?: boolean,
    level?: ErrorLevel,
    context?: Record<string, any>
  ) => ReturnType<typeof errorService.handleError>;
  
  /**
   * Specialized handler for UI-related errors
   * 
   * @param error - The error that occurred
   * @param context - Additional context information
   * @param level - Error severity level (defaults to 'error')
   * @param displayToUser - Whether to show the error to the user (defaults to true) 
   * @returns The error object created by the service
   */
  uiError: (
    error: Error | string,
    context?: Record<string, any>,
    level?: ErrorLevel,
    displayToUser?: boolean
  ) => ReturnType<typeof errorService.handleError>;
}

/**
 * Custom hook that provides error handling utilities with strongly typed interfaces
 * 
 * @returns Object containing specialized error handling methods
 */
export function useError(): ErrorHandlers {
  // Memoize the handlers to prevent unnecessary re-renders
  return useMemo(() => ({
    handleError: (error: Error | string, options?: ErrorOptions) => 
      errorService.handleError(error, options),
    
    apiError: (
      error: Error | string, 
      context?: Record<string, any>,
      level: ErrorLevel = 'error',
      displayToUser = true
    ) => 
      errorService.handleError(error, { 
        source: 'api', 
        level,
        displayToUser,
        context 
      }),
      
    authError: (
      error: Error | string, 
      context?: Record<string, any>,
      level: ErrorLevel = 'error',
      displayToUser = true
    ) => 
      errorService.handleError(error, { 
        source: 'auth', 
        level,
        displayToUser,
        context 
      }),
      
    networkError: (
      error: Error | string, 
      silent = false,
      level: ErrorLevel = 'error',
      context?: Record<string, any>
    ) => 
      errorService.handleError(error, { 
        source: 'network',
        level,
        displayToUser: !silent,
        context
      }),
    
    uiError: (
      error: Error | string,
      context?: Record<string, any>,
      level: ErrorLevel = 'error',
      displayToUser = false
    ) =>
      errorService.handleError(error, {
        source: 'ui',
        level,
        displayToUser,
        context
      })
  }), []);
}