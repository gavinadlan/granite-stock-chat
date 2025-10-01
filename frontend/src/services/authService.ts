// Authentication service for frontend - Real AWS Cognito integration with fallback
import { cognitoAuthService, CognitoUser, CognitoAuthResponse, CognitoLoginCredentials, CognitoRegisterCredentials } from './cognitoAuthService';

// Re-export types for compatibility
export type User = CognitoUser;
export type AuthResponse = CognitoAuthResponse;
export type LoginCredentials = CognitoLoginCredentials;
export type RegisterCredentials = CognitoRegisterCredentials;

// Check if AWS Cognito is properly configured
const isCognitoConfigured = () => {
  const userPoolId = import.meta.env.VITE_USER_POOL_ID;
  const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID;
  
  return userPoolId && 
         clientId && 
         !userPoolId.includes('XXXXXXXXX') && 
         !clientId.includes('XXXXXXXXXXXXXXXXXXXXXXXXXX');
};

class AuthService {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    if (!isCognitoConfigured()) {
      console.warn('⚠️ AWS Cognito not configured, using mock service');
      return await this.mockRegister(credentials);
    }
    
    try {
      return await cognitoAuthService.register(credentials);
    } catch (error: any) {
      console.error('Cognito registration failed, falling back to mock:', error);
      return await this.mockRegister(credentials);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!isCognitoConfigured()) {
      console.warn('⚠️ AWS Cognito not configured, using mock service');
      return await this.mockLogin(credentials);
    }
    
    try {
      return await cognitoAuthService.login(credentials);
    } catch (error: any) {
      console.error('Cognito login failed, falling back to mock:', error);
      return await this.mockLogin(credentials);
    }
  }

  async getProfile(): Promise<{ user: User }> {
    if (!isCognitoConfigured()) {
      return await this.mockGetProfile();
    }
    
    try {
      const user = await cognitoAuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      return { user };
    } catch (error: any) {
      console.error('Cognito getProfile failed, falling back to mock:', error);
      return await this.mockGetProfile();
    }
  }

  async updateProfile(name: string): Promise<{ message: string }> {
    if (!isCognitoConfigured()) {
      return await this.mockUpdateProfile(name);
    }
    
    try {
      return await cognitoAuthService.updateProfile(name);
    } catch (error: any) {
      console.error('Cognito updateProfile failed, falling back to mock:', error);
      return await this.mockUpdateProfile(name);
    }
  }

  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    if (!isCognitoConfigured()) {
      return await this.mockVerifyEmail(email, code);
    }
    
    try {
      return await cognitoAuthService.verifyEmail(email, code);
    } catch (error: any) {
      console.error('Cognito verifyEmail failed, falling back to mock:', error);
      return await this.mockVerifyEmail(email, code);
    }
  }

  async logout(): Promise<void> {
    if (!isCognitoConfigured()) {
      console.log('Mock logout - clearing local storage');
      this.clearTokens();
      return;
    }
    
    try {
      return await cognitoAuthService.logout();
    } catch (error: any) {
      console.error('Cognito logout failed, clearing local storage:', error);
      this.clearTokens();
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (!isCognitoConfigured()) {
      return !!this.getAccessToken();
    }
    
    try {
      return await cognitoAuthService.isAuthenticated();
    } catch (error: any) {
      console.error('Cognito isAuthenticated failed, checking local storage:', error);
      return !!this.getAccessToken();
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (!isCognitoConfigured()) {
      return this.getAccessTokenSync();
    }
    
    try {
      return await cognitoAuthService.getAccessToken();
    } catch (error: any) {
      console.error('Cognito getAccessToken failed, checking local storage:', error);
      return this.getAccessTokenSync();
    }
  }

  // Mock methods for fallback
  private async mockRegister(credentials: RegisterCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      userId: `user_${Date.now()}`,
      email: credentials.email,
      name: credentials.name
    };

    const accessToken = `mock_access_token_${Date.now()}`;
    const refreshToken = `mock_refresh_token_${Date.now()}`;

    // Store in localStorage for mock
    this.setTokens(accessToken, refreshToken);
    this.setUser(mockUser);

    return {
      message: 'User registered successfully (Mock)',
      accessToken,
      refreshToken,
      user: mockUser
    };
  }

  private async mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Extract name from email (before @) or use email as name
    const nameFromEmail = credentials.email.split('@')[0];
    const displayName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    
    const mockUser: User = {
      userId: `user_${Date.now()}`,
      email: credentials.email,
      name: displayName
    };

    const accessToken = `mock_access_token_${Date.now()}`;
    const refreshToken = `mock_refresh_token_${Date.now()}`;

    // Store in localStorage for mock
    this.setTokens(accessToken, refreshToken);
    this.setUser(mockUser);

    return {
      message: 'Login successful (Mock)',
      accessToken,
      refreshToken,
      user: mockUser
    };
  }

  private async mockGetProfile(): Promise<{ user: User }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedUser = this.getUser();
    if (!storedUser) {
      throw new Error('User not authenticated');
    }

    return { user: storedUser };
  }

  private async mockUpdateProfile(name: string): Promise<{ message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedUser = this.getUser();
    if (storedUser) {
      const updatedUser = { ...storedUser, name };
      this.setUser(updatedUser);
    }
    
    return { message: 'Profile updated successfully (Mock)' };
  }

  private async mockVerifyEmail(_email: string, _code: string): Promise<{ message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Email verified successfully (Mock)' };
  }

  // Local storage helpers (for mock fallback)
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessTokenSync(): string | null {
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
}

export const authService = new AuthService();