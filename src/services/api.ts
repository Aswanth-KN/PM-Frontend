import { LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse } from '../dto/auth';
import { axiosInstance, publicAxiosInstance } from './axiosConfig';


export const authApi = {
  // Public endpoints - no authentication required
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await publicAxiosInstance.post('/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    const response = await publicAxiosInstance.post('/register', credentials);
    return response.data;
  },

  // Authenticated endpoints - token required
  logout: async (): Promise<void> => {
    await axiosInstance.post('/logout');
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await axiosInstance.post('/refresh');
    return response.data;
  },


};