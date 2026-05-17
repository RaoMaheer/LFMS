import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'https://lfms-backend-dgpk.onrender.com/api/law';

// FETCH ALL
export const fetchCourtDates = createAsyncThunk('courtDates/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/courtdates`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    return data;
  } catch {
    return thunkAPI.rejectWithValue('Failed to fetch court dates');
  }
});

// ADD
export const addCourtDate = createAsyncThunk('courtDates/add', async (formData, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/courtdates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    });
    return await res.json();
  } catch {
    return thunkAPI.rejectWithValue('Failed to add court date');
  }
});

// UPDATE
export const updateCourtDate = createAsyncThunk('courtDates/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/courtdates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch {
    return thunkAPI.rejectWithValue('Failed to update court date');
  }
});

// DELETE
export const deleteCourtDate = createAsyncThunk('courtDates/delete', async (id, thunkAPI) => {
  try {
    await fetch(`${BASE_URL}/courtdates/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return id;
  } catch {
    return thunkAPI.rejectWithValue('Failed to delete court date');
  }
});

const courtDatesSlice = createSlice({
  name: 'courtDates',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourtDates.pending,    (state)          => { state.loading = true; state.error = null; })
      .addCase(fetchCourtDates.fulfilled,  (state, action)  => { state.loading = false; state.items = action.payload; })
      .addCase(fetchCourtDates.rejected,   (state, action)  => { state.loading = false; state.error = action.payload; })
      .addCase(addCourtDate.fulfilled,     (state, action)  => { state.items.push(action.payload); })
      .addCase(updateCourtDate.fulfilled,  (state, action)  => {
        const i = state.items.findIndex(d => d.court_date_id === action.payload.court_date_id);
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(deleteCourtDate.fulfilled,  (state, action)  => {
        state.items = state.items.filter(d => d.court_date_id !== action.payload);
      });
  }
});

export default courtDatesSlice.reducer;