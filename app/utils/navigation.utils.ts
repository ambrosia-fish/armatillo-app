import { router } from 'expo-router';
import { errorService } from '../services/ErrorService';

/**
 * Interface for navigation options
 */
interface NavigationOptions {
  replace?: boolean;
  reset?: boolean;
  params?: Record<string, any>;
}

/**
 * Navigate after form completion with consistent behavior
 * 
 * @param path - The path to navigate to
 * @param options - Navigation options
 */
export const navigateAfterForm = (
  path: string, 
  options: NavigationOptions = { replace: true }
): void => {
  try {
    // Use replace by default to prevent going back to the form
    if (options.replace) {
      router.replace(path, options.params);
    } else if (options.reset) {
      // Navigate without adding to history
      if (typeof router.reset === 'function') {
        router.reset({
          index: 0,
          routes: [{ name: path, params: options.params }],
        });
      } else {
        // Fallback if reset is not available
        router.replace(path, options.params);
      }
    } else {
      // Normal navigation that adds to history
      router.push(path, options.params);
    }
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'ui',
      level: 'error',
      context: { action: 'navigate_after_form', path }
    });
    
    // Fallback to simple replace navigation if an error occurs
    try {
      router.replace('/');
    } catch (fallbackError) {
      // Last resort fallback - log error but we can't do much else
      console.error('Navigation fallback failed:', fallbackError);
    }
  }
};

/**
 * Navigate back with consistent behavior
 * 
 * @param fallbackPath - Path to navigate to if back navigation fails
 */
export const navigateBack = (fallbackPath: string = '/'): void => {
  try {
    router.back();
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'ui',
      level: 'warning',
      context: { action: 'navigate_back' }
    });
    
    // Fallback to home if back fails
    try {
      router.replace(fallbackPath);
    } catch (fallbackError) {
      // Last resort fallback - log error but we can't do much else
      console.error('Navigation fallback failed:', fallbackError);
    }
  }
};

/**
 * Check if a navigation action is possible
 * 
 * @param path - The path to check
 * @returns Boolean indicating if navigation is possible
 */
export const canNavigateTo = (path: string): boolean => {
  try {
    // This is a simple check and may not work for all cases
    // A more robust solution would require deeper integration with expo-router
    return Boolean(path && typeof path === 'string');
  } catch (error) {
    return false;
  }
};
