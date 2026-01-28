import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthState, LoginCredentials, RegisterCredentials, User } from '../../dto/auth';
import { authApi } from '../../services/api';

const AUTH_STORAGE_KEY = '@auth_state';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isRegistered: false,
  loading: false,
};

// Helper to save auth state to AsyncStorage
const saveAuthState = async (user: User | null, isAuthenticated: boolean) => {
  try {
    const authState = { user, isAuthenticated };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  } catch (error) {
    console.error('Error saving auth state:', error);
  }
};

// Load auth state from AsyncStorage
export const loadAuthState = createAsyncThunk(
  'auth/loadState',
  async () => {
    try {
      const authStateString = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (authStateString) {
        return JSON.parse(authStateString);
      }
      return null;
    } catch (error) {
      console.error('Error loading auth state:', error);
      return null;
    }
  }
);

export const loginUser = createAsyncThunk(
  'login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      console.log('Login response:', JSON.stringify(response, null, 2));
      // Create user object with token from response
      return {
        user: {
          id: credentials.email,
          email: credentials.email,
          name: credentials.email.split('@')[0],
          token: response.access_token,
        },
        token: response.access_token,
        refresh_token: response.refresh_token,
      };
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
      saveAuthState(null, false);
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      saveAuthState(action.payload, true);
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      saveAuthState(null, false);
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
        state.user = {
          ...action.payload.user,
          token: action.payload.token,
        };
        state.isAuthenticated = true;
        state.error = null;
        console.log('User stored in state:', JSON.stringify(state.user, null, 2));
        saveAuthState(state.user, true);
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
      // Load auth state
      .addCase(loadAuthState.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.isAuthenticated = action.payload.isAuthenticated;
        }
      })
  },
});

export const { logout, clearError, setUser, clearUser, resetRegistration } = authSlice.actions;
export default authSlice.reducer;