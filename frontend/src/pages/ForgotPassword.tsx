// Two-step password reset with Cognito: request a code, then set a new password.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FormLayout } from '@/components/FormLayout';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { passwordPolicyError } from '@/lib/authErrors';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const { forgotPassword, confirmForgotPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);
      await forgotPassword(email);
      toast({ title: 'Check your email', description: 'If an account exists, we sent a reset code.' });
      setStep('reset');
    } catch (error) {
      toast({ title: 'Could not send code', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    const policyError = passwordPolicyError(password);
    if (policyError) {
      toast({ title: 'Weak password', description: policyError, variant: 'destructive' });
      return;
    }
    try {
      setBusy(true);
      await confirmForgotPassword(email, code, password);
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate('/login');
    } catch (error) {
      toast({ title: 'Reset failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormLayout
      title="Reset password"
      description={step === 'request' ? 'Enter your email and we will send you a reset code.' : `Enter the code sent to ${email}.`}
      back={{ to: '/login', label: 'Back to sign in' }}
    >
      {step === 'request' ? (
        <form onSubmit={requestCode} className="space-y-5">
          <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? 'Sending…' : 'Send reset code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={reset} className="space-y-5">
          <Field id="code" label="Reset code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Field id="password" label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? 'Saving…' : 'Set new password'}
          </Button>
        </form>
      )}
    </FormLayout>
  );
}
