import { useState } from 'react';
import { FormLayout } from '@/components/FormLayout';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface VerifyEmailFormProps {
  email: string;
  /** Called after the code is accepted. */
  onVerified: () => Promise<void> | void;
}

export function VerifyEmailForm({ email, onVerified }: VerifyEmailFormProps) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const { confirmRegistration, resendConfirmationCode } = useAuth();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      toast({ title: 'Invalid code', description: 'Enter the 6-digit code from your email.', variant: 'destructive' });
      return;
    }
    try {
      setBusy(true);
      await confirmRegistration(email, code);
      toast({ title: 'Email verified', description: 'Your account is ready.' });
      await onVerified();
    } catch (error) {
      toast({ title: 'Verification failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await resendConfirmationCode(email);
      toast({ title: 'Code sent', description: `We sent a new code to ${email}.` });
    } catch (error) {
      toast({ title: 'Could not resend code', description: (error as Error).message, variant: 'destructive' });
    }
  };

  return (
    <FormLayout
      title="Verify your email"
      description={<>We sent a 6-digit code to <span className="font-medium text-foreground [overflow-wrap:anywhere]">{email}</span>.</>}
      back={{ to: '/login', label: 'Back to sign in' }}
    >
      <form onSubmit={submit} className="space-y-5">
        <Field
          id="code"
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          required
        />
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? 'Verifying…' : 'Verify email'}
        </Button>
      </form>
      <p className="mt-6 text-muted-foreground">
        Didn&apos;t get it?{' '}
        <button type="button" onClick={resend} className="font-medium text-foreground underline underline-offset-4 hover:decoration-2">
          Resend code
        </button>
      </p>
    </FormLayout>
  );
}
