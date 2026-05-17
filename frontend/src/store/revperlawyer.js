import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Matches your specific endpoint
const API_URL = 'http://localhost:5000/api/law/revenueperlawyer';

export const fetchRevenuePerLawyer = createAsyncThunk('revperlawyer/fetch', async (_, thunkAPI) => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || "Server Error");
  }
});

const revenueSlice = createSlice({
  name: 'revperlawyer', // Updated slice name
  initialState: { items: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenuePerLawyer.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRevenuePerLawyer.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRevenuePerLawyer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default revenueSlice.reducer;