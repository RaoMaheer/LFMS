import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'https://lfms-backend-dgpk.onrender.com/api/law';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

// FETCH
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${BASE_URL}/appointments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch appointments');
      }

      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ADD
export const addAppointment = createAsyncThunk(
  'appointments/add',
  async (formData, thunkAPI) => {
    try {
      const res = await fetch(`${BASE_URL}/appointments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add appointment');
      }

      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// UPDATE
export const updateAppointment = createAsyncThunk(
  'appointments/update',
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await fetch(`${BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });

      const updated = await res.json();

      if (!res.ok) {
        throw new Error(updated.message || 'Failed to update appointment');
      }

      return updated;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// DELETE
export const deleteAppointment = createAsyncThunk(
  'appointments/delete',
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete appointment');
      }

      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',

  initialState: {
    items: [],
    loading: false,
    error: null
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })

      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addAppointment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // UPDATE
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (a) => a.appointment_id === action.payload.appointment_id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // DELETE
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (a) => a.appointment_id !== action.payload
        );
      });
  }
});

export default appointmentsSlice.reducer;