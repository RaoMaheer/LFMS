import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'https://lfms-backend-dgpk.onrender.com/api/law';

// FETCH ALL CASES
export const fetchCases = createAsyncThunk('cases/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/cases`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to fetch cases');
  }
});

// ADD CASE
export const addCase = createAsyncThunk('/cases', async (formData, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to add case');
  }
});

// UPDATE CASE
export const updateCase = createAsyncThunk('cases/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/cases/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    return result;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to update case');
  }
});

// DELETE CASE
export const deleteCase = createAsyncThunk('cases/delete', async (id, thunkAPI) => {
  try {
    await fetch(`${BASE_URL}/cases/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to delete case');
  }
});

const casesSlice = createSlice({
  name: 'cases',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchCases.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCases.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchCases.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // ADD
      .addCase(addCase.fulfilled, (state, action) => { state.items.push(action.payload); })

      // UPDATE
      .addCase(updateCase.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c.case_id === action.payload.case_id);
        if (index !== -1) state.items[index] = action.payload;
      })

      // DELETE
      .addCase(deleteCase.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.case_id !== action.payload);
      });
  }
});

export default casesSlice.reducer;