import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuditLog } from '../types';

export const fetchAuditLogs = createAsyncThunk(
  'auditLogs/fetch',
  async () => {
    const response = await fetch('/api/audit-logs');
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  }
);

interface AuditLogsState {
  items: AuditLog[];
  loading: boolean;
  error: string | null;
}

const initialState: AuditLogsState = {
  items: [],
  loading: false,
  error: null
};

const auditLogsSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {
    addAuditLog: (state, action) => {
      state.items.unshift(action.payload);
      if (state.items.length > 100) state.items.pop();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch audit logs';
      });
  }
});

export const { addAuditLog } = auditLogsSlice.actions;
export default auditLogsSlice.reducer;