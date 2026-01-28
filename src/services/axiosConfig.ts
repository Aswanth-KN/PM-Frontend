import axios from 'axios';
import { store } from '../store';

const API_BASE_URL = 'http://localhost:8000/api/v1/'; // For Android Emulator
// const API_BASE_URL = 'http://localhost:3000/api'; // For iOS Simulator
// const API_BASE_URL = 'http://YOUR_IP:3000/api'; // For Physical Device

// Public instance - No authentication required
export const publicAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Authenticated instance - Requires authentication token
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for authenticated instance
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.user?.token;
    
    console.log('Auth state:', JSON.stringify(state.auth, null, 2));
    console.log('Token from state:', token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization);
    } else {
      console.log('No token found in state');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for authenticated instance
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;