// Authentication service for frontend - Real AWS Cognito integration
import { cognitoAuthService, CognitoUser, CognitoAuthResponse, CognitoLoginCredentials, CognitoRegisterCredentials } from './cognitoAuthService';

// Re-export types for compatibility
export type User = CognitoUser;
export type AuthResponse = CognitoAuthResponse;
export type LoginCredentials = CognitoLoginCredentials;
export type RegisterCredentials = CognitoRegisterCredentials;

class AuthService {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return await cognitoAuthService.register(credentials);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return await cognitoAuthService.login(credentials);
  }

  async getProfile(): Promise<{ user: User }> {
    const user = await cognitoAuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return { user };
  }

  async updateProfile(name: string): Promise<{ message: string }> {
    return await cognitoAuthService.updateProfile(name);
  }

  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    return await cognitoAuthService.verifyEmail(email, code);
  }

  async logout(): Promise<void> {
    return await cognitoAuthService.logout();
  }

  async isAuthenticated(): Promise<boolean> {
    return await cognitoAuthService.isAuthenticated();
  }

  async getAccessToken(): Promise<string | null> {
    return await cognitoAuthService.getAccessToken();
  }

  // Local storage helpers (for compatibility)
  setTokens(_accessToken: string, _refreshToken: string): void {
    // AWS Amplify handles token storage automatically
    console.log('Tokens are managed by AWS Amplify');
  }

  getRefreshToken(): string | null {
    // AWS Amplify handles refresh tokens automatically
    return null;
  }

  clearTokens(): void {
    // AWS Amplify handles token cleanup automatically
    console.log('Tokens are managed by AWS Amplify');
  }

  setUser(_user: User): void {
    // AWS Amplify manages user state automatically
    console.log('User state is managed by AWS Amplify');
  }

  getUser(): User | null {
    // This method is now async, but keeping for compatibility
    console.warn('getUser() is now async, use await getCurrentUser() instead');
    return null;
  }
}

export const authService = new AuthService();