import { errorService, ErrorOptions } from '../services/ErrorService';

export function useError() {
  return {
    handleError: (error: Error | string, options?: ErrorOptions) => 
      errorService.handleError(error, options),
    
    apiError: (error: Error | string, context?: Record<string, any>) => 
      errorService.handleError(error, { source: 'api', context }),
      
    authError: (error: Error | string, context?: Record<string, any>) => 
      errorService.handleError(error, { source: 'auth', context }),
      
    networkError: (error: Error | string, silent: boolean = false) => 
      errorService.handleError(error, { 
        source: 'network', 
        displayToUser: !silent 
      }),
  };
}
