import { apiRequest } from './api';
import { Strategy } from '@/app/components/StrategyCard';

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
   * Create a new strategy
   */
  createStrategy: async (data: Partial<Strategy>): Promise<Strategy> => {
    return apiRequest('/strategies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Update a strategy
   */
  updateStrategy: async (id: string, data: Partial<Strategy>): Promise<Strategy> => {
    return apiRequest(`/strategies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Delete a strategy
   */
  deleteStrategy: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/strategies/${id}`, { method: 'DELETE' });
  },
  
  /**
   * Get strategies by trigger
   */
  getStrategiesByTrigger: async (trigger: string): Promise<Strategy[]> => {
    return apiRequest(`/strategies/trigger/${trigger}`, { method: 'GET' });
  },
  
  /**
   * Toggle strategy status
   */
  toggleStrategyStatus: async (id: string): Promise<Strategy> => {
    return apiRequest(`/strategies/${id}/toggle-status`, { method: 'PUT' });
  },
};

export default strategiesApi;