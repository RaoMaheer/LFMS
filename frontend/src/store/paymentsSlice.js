import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'https://lfms-backend-dgpk.onrender.com/api/law';

export const fetchPayments = createAsyncThunk('payments/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/payments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return await res.json();
  } catch {
    return thunkAPI.rejectWithValue('Failed to fetch payments');
  }
});

export const addPayment = createAsyncThunk('payments/add', async (formData, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    });
    return await res.json();
  } catch {
    return thunkAPI.rejectWithValue('Failed to add payment');
  }
});

export const updatePayment = createAsyncThunk('payments/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/payments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch {
    return thunkAPI.rejectWithValue('Failed to update payment');
  }
});

export const deletePayment = createAsyncThunk('payments/delete', async (id, thunkAPI) => {
  try {
    await fetch(`${BASE_URL}/payments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return id;
  } catch {
    return thunkAPI.rejectWithValue('Failed to delete payment');
  }
});

const paymentsSlice = createSlice({
  name: 'payments',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending,   (state)         => { state.loading = true; state.error = null; })
      .addCase(fetchPayments.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchPayments.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addPayment.fulfilled,    (state, action) => { state.items.push(action.payload); })
      .addCase(updatePayment.fulfilled, (state, action) => {
        const i = state.items.findIndex(p => p.payment_id === action.payload.payment_id);
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.payment_id !== action.payload);
      });
  }
});

export default paymentsSlice.reducer;