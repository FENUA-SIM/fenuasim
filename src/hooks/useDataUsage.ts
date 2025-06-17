import { useState, useCallback } from 'react';
import { useAiraloAPI } from './useAiraloAPI';

interface DataUsage {
  remaining: number;
  total: number;
  status: string;
}

export const useDataUsage = () => {
  const { fetchAPI, loading, error } = useAiraloAPI();
  const [usage, setUsage] = useState<DataUsage | null>(null);

  const fetchUsage = useCallback(async (simIccid: string) => {
    const response = await fetchAPI<DataUsage>(`/sims/${simIccid}/usage`);
    if (response.data) {
      setUsage(response.data);
    }
    return response;
  }, [fetchAPI]);

  const formatDataUsage = useCallback((usage: DataUsage | null) => {
    if (!usage) return 'N/A';
    const used = usage.total - usage.remaining;
    const unit = 'Mbs';
    return `${used} ${unit}`;
  }, []);

  const formatRemainingData = useCallback((usage: DataUsage | null) => {
    if (!usage) return 'N/A';
    const remaining = usage.remaining;
    const unit = 'Mbs';
    return `${remaining} ${unit}`;
  }, []);

  return {
    usage,
    loading,
    error,
    fetchUsage,
    formatDataUsage,
    formatRemainingData,
  };
}; 