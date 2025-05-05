// Export individual api parts rather than re-exporting from base or strategies
export { 
  default as api,
  apiRequest, 
  instancesApi, 
  authApi 
} from './base';

export {
  strategiesApi,
  default as strategiesApiModule
} from './strategies';

// Also export types
export type { 
  Strategy,
  CreateStrategyData,
  TriggerObject 
} from './strategies';