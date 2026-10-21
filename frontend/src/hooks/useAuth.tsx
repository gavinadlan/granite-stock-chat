// Authentication context backed directly by Amazon Cognito (AWS Amplify v6).
// This is the ONLY auth implementation in the app. There is no mock fallback:
// if Cognito rejects a login, the user is not logged in.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  signUp,
  confirmSignUp,
  resendSignUpCode,
  signIn,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttributes,
  resetPassword,
  confirmResetPassword,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { authErrorMessage, isAuthError } from '@/lib/authErrors';

export interface User {
  userId: string;
  email: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/** Result of a login attempt: either signed in or the account still needs email verification. */
export type LoginResult = { status: 'signedIn' } | { status: 'needsConfirmation' };

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  /** Creates the account; Cognito emails a verification code. */
  register: (credentials: RegisterCredentials) => Promise<{ needsConfirmation: boolean }>;
  confirmRegistration: (email: string, code: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Re-throws Amplify errors as Errors with a user-friendly message (keeps `name`). */
function friendly(error: unknown): never {
  const err = new Error(authErrorMessage(error));
  if (error && typeof error === 'object' && 'name' in error) err.name = String((error as { name: unknown }).name);
  throw err;
}

async function loadUser(): Promise<User | null> {
  try {
    const current = await getCurrentUser();
    const attrs = await fetchUserAttributes();
    return { userId: current.userId, email: attrs.email ?? '', name: attrs.name ?? '' };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const refresh = useCallback(async () => {
    const u = await loadUser();
    setUser(u);
    setStatus(u ? 'authenticated' : 'unauthenticated');
    return u;
  }, []);

  useEffect(() => {
    refresh();
    // Keep state in sync with sign-in/out in other tabs and failed token refreshes.
    return Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') refresh();
      if (payload.event === 'signedOut' || payload.event === 'tokenRefresh_failure') {
        setUser(null);
        setStatus('unauthenticated');
      }
    });
  }, [refresh]);

  const login = useCallback(
    async ({ email, password }: LoginCredentials): Promise<LoginResult> => {
      try {
        const { nextStep } = await signIn({ username: email.trim(), password });
        if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
          await resendSignUpCode({ username: email.trim() });
          return { status: 'needsConfirmation' };
        }
        if (nextStep.signInStep !== 'DONE') {
          throw new Error(`Additional sign-in step required (${nextStep.signInStep}), which is not supported yet.`);
        }
      } catch (error) {
        if (isAuthError(error, 'UserNotConfirmedException')) {
          await resendSignUpCode({ username: email.trim() }).catch(() => undefined);
          return { status: 'needsConfirmation' };
        }
        // Already signed in (e.g. another tab): just load that session.
        if (!isAuthError(error, 'UserAlreadyAuthenticatedException')) friendly(error);
      }
      await refresh();
      return { status: 'signedIn' };
    },
    [refresh],
  );

  const register = useCallback(async ({ email, password, name }: RegisterCredentials) => {
    try {
      const { nextStep } = await signUp({
        username: email.trim(),
        password,
        options: { userAttributes: { email: email.trim(), name: name.trim() } },
      });
      return { needsConfirmation: nextStep.signUpStep === 'CONFIRM_SIGN_UP' };
    } catch (error) {
      friendly(error);
    }
  }, []);

  const confirmRegistration = useCallback(async (email: string, code: string) => {
    try {
      await confirmSignUp({ username: email.trim(), confirmationCode: code.trim() });
    } catch (error) {
      friendly(error);
    }
  }, []);

  const resendConfirmationCode = useCallback(async (email: string) => {
    try {
      await resendSignUpCode({ username: email.trim() });
    } catch (error) {
      friendly(error);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await resetPassword({ username: email.trim() });
    } catch (error) {
      friendly(error);
    }
  }, []);

  const confirmForgotPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    try {
      await confirmResetPassword({ username: email.trim(), confirmationCode: code.trim(), newPassword });
    } catch (error) {
      friendly(error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } finally {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const updateProfile = useCallback(
    async (name: string) => {
      try {
        await updateUserAttributes({ userAttributes: { name: name.trim() } });
      } catch (error) {
        friendly(error);
      }
      await refresh();
    },
    [refresh],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      register,
      confirmRegistration,
      resendConfirmationCode,
      forgotPassword,
      confirmForgotPassword,
      logout,
      updateProfile,
    }),
    [user, status, login, register, confirmRegistration, resendConfirmationCode, forgotPassword, confirmForgotPassword, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook is colocated with its provider
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
