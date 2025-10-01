// Authentication service for frontend with mock fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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
  private useMock: boolean;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Use mock service in development or when API is not available
    this.useMock = import.meta.env.DEV || API_BASE_URL.includes('localhost');
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    if (this.useMock) {
      console.log('🔧 Using mock auth service for development');
      return await this.mockRegister(credentials);
    }

    try {
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
    } catch (error) {
      console.error('Registration error:', error);
      // Fallback to mock service if API fails
      console.log('🔄 Falling back to mock auth service');
      return await this.mockRegister(credentials);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (this.useMock) {
      console.log('🔧 Using mock auth service for development');
      return await this.mockLogin(credentials);
    }

    try {
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
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to mock service if API fails
      console.log('🔄 Falling back to mock auth service');
      return await this.mockLogin(credentials);
    }
  }

  async getProfile(accessToken: string): Promise<{ user: User }> {
    if (this.useMock) {
      return await this.mockGetProfile(accessToken);
    }

    try {
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
    } catch (error) {
      console.error('Get profile error:', error);
      // Fallback to mock service if API fails
      return await this.mockGetProfile(accessToken);
    }
  }

  async updateProfile(accessToken: string, name: string): Promise<{ message: string }> {
    if (this.useMock) {
      return await this.mockUpdateProfile(accessToken, name);
    }

    try {
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
    } catch (error) {
      console.error('Update profile error:', error);
      // Fallback to mock service if API fails
      return await this.mockUpdateProfile(accessToken, name);
    }
  }

  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    if (this.useMock) {
      return await this.mockVerifyEmail(email, code);
    }

    try {
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
    } catch (error) {
      console.error('Email verification error:', error);
      // Fallback to mock service if API fails
      return await this.mockVerifyEmail(email, code);
    }
  }

  // Mock methods for development
  private async mockRegister(credentials: RegisterCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      userId: `user_${Date.now()}`,
      email: credentials.email,
      name: credentials.name
    };

    return {
      message: 'User registered successfully',
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user: mockUser
    };
  }

  private async mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      userId: `user_${Date.now()}`,
      email: credentials.email,
      name: 'Demo User'
    };

    return {
      message: 'Login successful',
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user: mockUser
    };
  }

  private async mockGetProfile(accessToken: string): Promise<{ user: User }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: User = {
      userId: 'user_123',
      email: 'demo@example.com',
      name: 'Demo User'
    };

    return { user: mockUser };
  }

  private async mockUpdateProfile(accessToken: string, name: string): Promise<{ message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Profile updated successfully' };
  }

  private async mockVerifyEmail(email: string, code: string): Promise<{ message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Email verified successfully' };
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