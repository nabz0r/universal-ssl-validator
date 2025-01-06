import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Certificate } from '../types';

export const fetchCertificates = createAsyncThunk(
  'certificates/fetchAll',
  async () => {
    const response = await fetch('/api/certificates');
    if (!response.ok) throw new Error('Failed to fetch certificates');
    return response.json();
  }
);

export const validateCertificate = createAsyncThunk(
  'certificates/validate',
  async (domain: string) => {
    const response = await fetch('/api/certificates/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain })
    });
    if (!response.ok) throw new Error('Validation failed');
    return response.json();
  }
);

interface CertificatesState {
  items: Certificate[];
  loading: boolean;
  error: string | null;
}

const initialState: CertificatesState = {
  items: [],
  loading: false,
  error: null
};

const certificatesSlice = createSlice({
  name: 'certificates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch certificates';
      })
      .addCase(validateCertificate.fulfilled, (state, action) => {
        state.items = [...state.items, action.payload];
      });
  }
});

export default certificatesSlice.reducer;