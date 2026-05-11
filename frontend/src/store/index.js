import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import clientReducer from './clientSlice'; // 1. Import your new slice
import casesReducer from './casesSlice';
import CourtDatesReducer from './courtDatesSlice';
import appointmentsReducer from './appointmentsSlice';
import paymentsReducer from './paymentsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer,
    cases: casesReducer, // 2. Add this key! 
    courtDates: CourtDatesReducer, // 3. Add this key!
    appointments: appointmentsReducer, 
    payments: paymentsReducer,
  },
});