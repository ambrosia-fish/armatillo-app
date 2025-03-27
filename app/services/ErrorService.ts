import { Alert } from 'react-native';

export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical';
export type ErrorSource = 'api' | 'auth' | 'ui' | 'storage' | 'network' | 'unknown';

export interface ErrorOptions {
  level?: ErrorLevel;
  source?: ErrorSource;
  displayToUser?: boolean;
  reportToServer?: boolean;
  context?: Record<string, any>;
}

class ErrorService {
  private logErrors: boolean = true;
  
  handleError(error: Error | string, options: ErrorOptions = {}) {
    const {
      level = 'error',
      source = 'unknown',
      displayToUser = true,
      reportToServer = false,
      context = {}
    } = options;
    
    const errorObj = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error !== 'string' ? error.stack : undefined,
      level,
      source,
      timestamp: new Date().toISOString(),
      context
    };
    
    if (this.logErrors) {
      console.error(`[${source.toUpperCase()}][${level.toUpperCase()}]: ${errorObj.message}`, {
        ...errorObj,
        context
      });
    }
    
    if (displayToUser) {
      this.showErrorToUser(errorObj);
    }
    
    if (reportToServer) {
      // TODO: Future server reporting implementation
    }
    
    return errorObj;
  }
  
  private showErrorToUser(errorObj: any) {
    const { message, level } = errorObj;
    
    switch (level) {
      case 'critical':
      case 'error':
        Alert.alert('Error', message);
        break;
      case 'warning':
        Alert.alert('Warning', message);
        break;
      case 'info':
        // Could use Toast in the future
        console.log(message);
        break;
    }
  }
}

export const errorService = new ErrorService();
