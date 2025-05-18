import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface AiraloAPIError {
  code: string;
  message: string;
}

interface AiraloAPIResponse<T> {
  data: T | null;
  error: AiraloAPIError | null;
}

export const useAiraloAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AiraloAPIError | null>(null);

  const fetchAPI = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AiraloAPIResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer la session Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Non authentifié');
      }

      // Récupérer les clés API depuis les variables d'environnement
      const AIRALO_API_KEY = process.env.NEXT_PUBLIC_AIRALO_API_KEY;
      const AIRALO_API_URL = process.env.NEXT_PUBLIC_AIRALO_API_URL;

      if (!AIRALO_API_KEY || !AIRALO_API_URL) {
        throw new Error('Configuration API manquante');
      }

      const response = await fetch(`${AIRALO_API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${AIRALO_API_KEY}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur API Airalo');
      }

      const data = await response.json();
      return { data, error: null };
    } catch (err) {
      const apiError: AiraloAPIError = {
        code: 'API_ERROR',
        message: err instanceof Error ? err.message : 'Erreur inconnue',
      };
      setError(apiError);
      return { data: null, error: apiError };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchAPI,
  };
}; 