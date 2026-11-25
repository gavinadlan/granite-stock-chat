// Register page component
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FormLayout } from '@/components/FormLayout';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';
import { passwordPolicyError } from '@/lib/authErrors';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  // `?verify=email` lets Login send unverified users straight to the code step.
  const [verifyEmail, setVerifyEmail] = useState<string | null>(searchParams.get('verify'));

  const { register, login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }

    const policyError = passwordPolicyError(password);
    if (policyError) {
      toast({
        title: "Error",
        description: policyError,
        variant: "destructive",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const { needsConfirmation } = await register({ name, email, password });
      if (needsConfirmation) {
        toast({
          title: "Check your email",
          description: `We sent a verification code to ${email.trim()}.`,
        });
        setVerifyEmail(email.trim());
        return;
      }
      await login({ email, password });
      navigate('/chat');
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerified = async () => {
    // We still have the password if the user registered in this session.
    if (password && verifyEmail === email.trim()) {
      try {
        const result = await login({ email, password });
        if (result.status === 'signedIn') {
          navigate('/chat');
          return;
        }
      } catch {
        // fall through to the login page
      }
    }
    navigate('/login');
  };

  if (verifyEmail) {
    return <VerifyEmailForm email={verifyEmail} onVerified={handleVerified} />;
  }

  return (
    <FormLayout title="Create account" description="You need an account to use the stock chat." back={{ to: '/', label: 'Back to home' }}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="name" label="Full name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters with uppercase, lowercase, numbers and symbols."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Field id="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-foreground underline underline-offset-4 hover:decoration-2">Sign in</Link>
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        By creating an account, you agree to our Terms of Service and Privacy Policy
      </p>
    </FormLayout>
  );
}
