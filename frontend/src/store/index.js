import { configureStore } from '@reduxjs/toolkit';
import incidentsReducer from '../features/tickets/services/incidentsSlice';

const store = configureStore({
  reducer: {
    incidents: incidentsReducer
  }
});

export default store;
