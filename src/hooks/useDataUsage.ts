import { useState, useCallback } from 'react';
import { useAiraloAPI } from './useAiraloAPI';

interface DataUsage {
  sim_iccid: string;
  data_used: number;
  data_unit: string;
  last_updated: string;
  status: string;
}

export const useDataUsage = () => {
  const { fetchAPI, loading, error } = useAiraloAPI();
  const [usage, setUsage] = useState<DataUsage | null>(null);

  const fetchUsage = useCallback(async (simIccid: string) => {
    const response = await fetchAPI<DataUsage>(`/v1/sims/${simIccid}/usage`);
    if (response.data) {
      setUsage(response.data);
    }
    return response;
  }, [fetchAPI]);

  const formatDataUsage = useCallback((usage: DataUsage | null) => {
    if (!usage) return 'N/A';
    const used = usage.data_used.toFixed(2);
    const unit = usage.data_unit === 'GB' ? 'Go' : usage.data_unit;
    return `${used} ${unit}`;
  }, []);

  return {
    usage,
    loading,
    error,
    fetchUsage,
    formatDataUsage,
  };
}; 