import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { AuthState, LoginCredentials, RegisterCredentials, User } from '../../dto/auth';
import { authApi } from '../../services/api';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isRegistered: false,
  loading: false,
};

export const loginUser = createAsyncThunk(
  'login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Login failed'
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  'register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.register(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail ||
        'Registration failed'
      );
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    resetRegistration: (state) => {
      state.isRegistered = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
        state.isRegistered = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.isRegistered = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.isRegistered = false;
        state.error = action.payload as string || 'Registration failed';
      })
  },
});

export const { logout, clearError, setUser, clearUser, resetRegistration } = authSlice.actions;
export default authSlice.reducer;