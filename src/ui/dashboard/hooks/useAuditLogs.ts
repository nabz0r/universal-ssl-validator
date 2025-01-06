import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchAuditLogs, addAuditLog } from '../store/slices/auditLogsSlice';
import { AppDispatch } from '../store';
import { AuditLog } from '../store/types';

export const useAuditLogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector(
    (state: RootState) => state.auditLogs
  );

  useEffect(() => {
    dispatch(fetchAuditLogs());
  }, [dispatch]);

  const addLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    dispatch(addAuditLog({
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }));
  };

  return {
    logs: items,
    loading,
    error,
    addLog
  };
};