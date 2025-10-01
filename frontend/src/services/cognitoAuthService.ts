// Real AWS Cognito authentication service
import { signUp, signIn, signOut, getCurrentUser, updateUserAttributes, confirmSignUp, fetchUserAttributes } from 'aws-amplify/auth';

export interface CognitoUser {
  userId: string;
  email: string;
  name: string;
}

export interface CognitoAuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: CognitoUser;
}

export interface CognitoLoginCredentials {
  email: string;
  password: string;
}

export interface CognitoRegisterCredentials {
  email: string;
  password: string;
  name: string;
}

class CognitoAuthService {
  async register(credentials: CognitoRegisterCredentials): Promise<CognitoAuthResponse> {
    try {
      const { userId } = await signUp({
        username: credentials.email,
        password: credentials.password,
        options: {
          userAttributes: {
            email: credentials.email,
            name: credentials.name,
          },
        },
      });

      return {
        message: 'User registered successfully. Please check your email for verification.',
        accessToken: '', // Will be set after email verification
        refreshToken: '',
        user: {
          userId: userId || '',
          email: credentials.email,
          name: credentials.name,
        },
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  async login(credentials: CognitoLoginCredentials): Promise<CognitoAuthResponse> {
    try {
      const { isSignedIn } = await signIn({
        username: credentials.email,
        password: credentials.password,
      });
      
      if (!isSignedIn) {
        throw new Error('Login failed');
      }

      // Get user attributes
      const attributes = await fetchUserAttributes();
      const name = attributes.name || credentials.email.split('@')[0];

      return {
        message: 'Login successful',
        accessToken: '', // AWS Amplify handles tokens automatically
        refreshToken: '',
        user: {
          userId: '', // Will be set by getCurrentUser
          email: credentials.email,
          name: name,
        },
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  async getCurrentUser(): Promise<CognitoUser | null> {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      return {
        userId: user.userId || '',
        email: attributes.email || '',
        name: attributes.name || '',
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async updateProfile(name: string): Promise<{ message: string }> {
    try {
      await updateUserAttributes({
        userAttributes: {
          name: name,
        },
      });
      
      return { message: 'Profile updated successfully' };
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return { message: 'Email verified successfully' };
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw new Error(error.message || 'Email verification failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      await getCurrentUser();
      // AWS Amplify v6 handles tokens differently
      // For now, return null as tokens are managed automatically
      return null;
    } catch (error) {
      return null;
    }
  }
}

export const cognitoAuthService = new CognitoAuthService();
