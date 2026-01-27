export interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isRegistered: boolean;
  loading: boolean;
}



export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  token: string;
}