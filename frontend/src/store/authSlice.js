import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user:            JSON.parse(localStorage.getItem('user')) || null,
  token:           localStorage.getItem('token')            || null,
  role:            localStorage.getItem('role')             || null,
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user            = action.payload.user;
      state.token           = action.payload.token;
      state.role            = action.payload.role;
      state.isAuthenticated = true;

      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('role',  action.payload.role);
      localStorage.setItem('user',  JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user            = null;
      state.token           = null;
      state.role            = null;
      state.isAuthenticated = false;

      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;