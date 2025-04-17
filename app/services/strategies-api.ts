import { apiRequest } from './api';
import { Strategy } from '@/app/components/StrategyCard';
import { OptionItem } from '@/app/constants/optionDictionaries';

// Helper type for API compatibility
type ApiStrategy = Omit<Strategy, 'trigger'> & {
  trigger: string | OptionItem;
};

/**
 * API functions for strategies
 */
export const strategiesApi = {
  /**
   * Get all strategies
   */
  getStrategies: async (): Promise<Strategy[]> => {
    const response = await apiRequest('/strategies', { method: 'GET' });
    
    // If trigger is a string, convert it to an OptionItem structure in the client
    // This allows the API to work with both string triggers and OptionItem triggers
    return response;
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
    // If the trigger is an OptionItem, handle it correctly for the API
    const apiData = { ...data };
    
    // Convert OptionItem to string if needed for API compatibility
    if (data.trigger && typeof data.trigger !== 'string') {
      const triggerOption = data.trigger as OptionItem;
      // Store both id and emoji for better display
      apiData.trigger = `${triggerOption.id}:${triggerOption.emoji}:${triggerOption.label}`;
    }
    
    return apiRequest('/strategies', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  },
  
  /**
   * Update a strategy
   */
  updateStrategy: async (id: string, data: Partial<Strategy>): Promise<Strategy> => {
    // If the trigger is an OptionItem, handle it correctly for the API
    const apiData = { ...data };
    
    // Convert OptionItem to string if needed for API compatibility
    if (data.trigger && typeof data.trigger !== 'string') {
      const triggerOption = data.trigger as OptionItem;
      // Store both id and emoji for better display
      apiData.trigger = `${triggerOption.id}:${triggerOption.emoji}:${triggerOption.label}`;
    }
    
    return apiRequest(`/strategies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
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
  getStrategiesByTrigger: async (trigger: string | OptionItem): Promise<Strategy[]> => {
    // Convert OptionItem to string for API call if needed
    const triggerParam = typeof trigger === 'string' 
      ? trigger 
      : trigger.id;
      
    return apiRequest(`/strategies/trigger/${triggerParam}`, { method: 'GET' });
  },
  
  /**
   * Toggle strategy status
   */
  toggleStrategyStatus: async (id: string): Promise<Strategy> => {
    return apiRequest(`/strategies/${id}/toggle-status`, { method: 'PUT' });
  },
};

export default strategiesApi;