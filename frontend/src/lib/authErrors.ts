// Maps Amazon Cognito / Amplify error names to friendly messages.
const MESSAGES: Record<string, string> = {
  UsernameExistsException: 'An account with this email already exists. Try signing in instead.',
  UserNotFoundException: 'Incorrect email or password.',
  NotAuthorizedException: 'Incorrect email or password.',
  UserNotConfirmedException: 'Please verify your email first. We sent you a code.',
  CodeMismatchException: 'That verification code is not correct.',
  ExpiredCodeException: 'That code has expired. Request a new one.',
  InvalidPasswordException:
    'Password must be at least 8 characters and include upper and lower case letters, a number and a symbol.',
  InvalidParameterException: 'Some details are invalid. Please check and try again.',
  LimitExceededException: 'Too many attempts. Please wait a few minutes and try again.',
  TooManyRequestsException: 'Too many attempts. Please wait a few minutes and try again.',
  TooManyFailedAttemptsException: 'Too many attempts. Please wait a few minutes and try again.',
  NetworkError: 'Network error. Check your connection and try again.',
};

export function authErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'name' in error) {
    const name = String((error as { name: unknown }).name);
    if (MESSAGES[name]) return MESSAGES[name];
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}

export function isAuthError(error: unknown, name: string): boolean {
  return !!error && typeof error === 'object' && 'name' in error && (error as { name: unknown }).name === name;
}

/** Mirrors the Cognito user pool password policy in backend/serverless.yml. */
export function passwordPolicyError(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[a-z]/.test(password)) return 'Password needs a lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Password needs an uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password needs a number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password needs a symbol.';
  return null;
}
