import { configureStore } from '@reduxjs/toolkit';
import certificatesReducer from './slices/certificatesSlice';
import metricsReducer from './slices/metricsSlice';
import auditLogsReducer from './slices/auditLogsSlice';

export const store = configureStore({
  reducer: {
    certificates: certificatesReducer,
    metrics: metricsReducer,
    auditLogs: auditLogsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;