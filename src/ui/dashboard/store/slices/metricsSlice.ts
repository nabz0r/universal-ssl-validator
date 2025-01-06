import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ValidationMetrics } from '../types';

export const fetchMetrics = createAsyncThunk(
  'metrics/fetch',
  async () => {
    const response = await fetch('/api/metrics');
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  }
);

interface MetricsState {
  data: ValidationMetrics | null;
  loading: boolean;
  error: string | null;
}

const initialState: MetricsState = {
  data: null,
  loading: false,
  error: null
};

const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch metrics';
      });
  }
});

export default metricsSlice.reducer;