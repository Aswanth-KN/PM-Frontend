import { LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse } from '../dto/auth';
import { axiosInstance } from './axiosConfig';


export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    const response = await axiosInstance.post('/register', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/logout');
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await axiosInstance.post('/refresh');
    return response.data;
  },


};