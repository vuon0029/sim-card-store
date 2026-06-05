import { useState, useEffect } from 'react';
import { fetchAllSimCards } from '../firebase/simCards';
import type { SimCard } from '../types';

interface UseSimCardsResult {
  simCards: SimCard[];
  loading: boolean;
  error: string | null;
}

export function useSimCards(): UseSimCardsResult {
  const [simCards, setSimCards] = useState<SimCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSimCards() {
      try {
        const data = await fetchAllSimCards();
        if (!cancelled) {
          setSimCards(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load SIM cards'
          );
          setLoading(false);
        }
      }
    }

    loadSimCards();

    return () => {
      cancelled = true;
    };
  }, []);

  return { simCards, loading, error };
}
