import { apiRequest } from './api';
import { Strategy } from '@/app/components/StrategyCard';
import { OptionItem } from '@/app/constants/optionDictionaries';

/**
 * API functions for strategies
 */
export const strategiesApi = {
  /**
   * Get all strategies
   */
  getStrategies: async (): Promise<Strategy[]> => {
    return apiRequest('/strategies', { method: 'GET' });
  },
  
  /**
   * Get strategy by ID
   */
  getStrategy: async (id: string): Promise<Strategy> => {
    return apiRequest(`/strategies/${id}`, { method: 'GET' });
  },
  
  /**
   * Get strategies by trigger
   */
  getStrategiesByTrigger: async (triggerId: string): Promise<Strategy[]> => {
    return apiRequest(`/strategies/trigger/${triggerId}`, { method: 'GET' });
  },
};

export default strategiesApi;