import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://lfms-backend-dgpk.onrender.com/api/law/clients';

// FETCH CLIENTS
export const fetchClients = createAsyncThunk(
  'clients/fetchAll',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// ADD CLIENT
export const addClient = createAsyncThunk(
  'clients/add',
  async (clientData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, clientData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// UPDATE CLIENT
export const updateClient = createAsyncThunk(
  'clients/update',
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}/${id}`,
        data
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// DELETE CLIENT
export const deleteClient = createAsyncThunk(
  'clients/delete',
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

const clientSlice = createSlice({
  name: 'clients',

  initialState: {
    items: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })

      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addClient.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      // UPDATE
      .addCase(updateClient.fulfilled, (state, action) => {
        state.items = state.items.map((client) =>
          client.client_id === action.payload.client_id
            ? action.payload
            : client
        );
      })

      // DELETE
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (client) => client.client_id !== action.payload
        );
      });
  },
});

export default clientSlice.reducer;