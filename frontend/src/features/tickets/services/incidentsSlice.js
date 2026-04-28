import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import API from '../../../services/api';

const INCIDENT_CACHE_TTL_MS = 45 * 1000;

export const fetchIncidents = createAsyncThunk(
  'incidents/fetchIncidents',
  async () => {
    const response = await API.get('/incidents');
    return Array.isArray(response?.data) ? response.data : [];
  },
  {
    condition: (arg, { getState }) => {
      const force = Boolean(arg?.force);
      if (force) return true;

      const state = getState().incidents;
      if (!state) return true;
      if (state.status === 'loading') return false;

      const hasFreshCache =
        state.items.length > 0 &&
        Number.isFinite(state.lastFetchedAt) &&
        Date.now() - state.lastFetchedAt < INCIDENT_CACHE_TTL_MS;

      return !hasFreshCache;
    }
  }
);

const incidentsSlice = createSlice({
  name: 'incidents',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    lastFetchedAt: null
  },
  reducers: {
    clearIncidentCache: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
      state.lastFetchedAt = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error?.message || 'Failed to load incidents';
      });
  }
});

export const { clearIncidentCache } = incidentsSlice.actions;
export default incidentsSlice.reducer;
