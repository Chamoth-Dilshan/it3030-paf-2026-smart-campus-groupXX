import { configureStore } from '@reduxjs/toolkit';
import incidentsReducer from './incidentsSlice';

const store = configureStore({
  reducer: {
    incidents: incidentsReducer
  }
});

export default store;
