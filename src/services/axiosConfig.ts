import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1/'; // For Android Emulator
// const API_BASE_URL = 'http://localhost:3000/api'; // For iOS Simulator
// const API_BASE_URL = 'http://YOUR_IP:3000/api'; // For Physical Device

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
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