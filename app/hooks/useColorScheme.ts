import { useColorScheme as _useColorScheme, ColorSchemeName } from 'react-native';
import { useEffect, useState } from 'react';
import { errorService } from '../services/ErrorService';

/**
 * Enhanced useColorScheme hook that provides reliable theme information
 * - Always returns 'light' or 'dark' (never null or undefined)
 * - Adds error handling with ErrorService
 * - Memoizes value to prevent excessive re-renders
 * 
 * @returns {'light' | 'dark'} The current color scheme 
 */
export function useColorScheme(): 'light' | 'dark' {
  // Track the actual colorScheme value
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  
  // Get the native colorScheme
  const nativeColorScheme = _useColorScheme();
  
  // Update our state when the native value changes
  useEffect(() => {
    try {
      // Use the native value or default to 'light'
      const newScheme = nativeColorScheme === 'dark' ? 'dark' : 'light';
      setColorScheme(newScheme);
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'warning',
        source: 'ui',
        displayToUser: false,
        context: { 
          component: 'useColorScheme', 
          action: 'updateColorScheme',
          nativeValue: String(nativeColorScheme)
        }
      });
      // Ensure we have a valid fallback
      setColorScheme('light');
    }
  }, [nativeColorScheme]);
  
  return colorScheme;
}

export default {};