// Authentication service for frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Only throw error in development mode, not during build
if (!API_BASE_URL && import.meta.env.DEV) {
  throw new Error('VITE_API_BASE_URL environment variable is required for development');
}

export interface User {
  userId: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return await response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return await response.json();
  }

  async getProfile(accessToken: string): Promise<{ user: User }> {
    const response = await fetch(`${this.baseUrl}/auth/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }

    return await response.json();
  }

  async updateProfile(accessToken: string, name: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/auth/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    return await response.json();
  }

  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Email verification failed');
    }

    return await response.json();
  }

  // Local storage helpers
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();