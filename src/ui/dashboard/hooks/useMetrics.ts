import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchMetrics } from '../store/slices/metricsSlice';
import { AppDispatch } from '../store';

export const useMetrics = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.metrics
  );

  useEffect(() => {
    dispatch(fetchMetrics());
    const interval = setInterval(() => {
      dispatch(fetchMetrics());
    }, 30000); // Rafraîchir toutes les 30 secondes

    return () => clearInterval(interval);
  }, [dispatch]);

  const refresh = useCallback(() => {
    dispatch(fetchMetrics());
  }, [dispatch]);

  return {
    metrics: data,
    loading,
    error,
    refresh
  };
};