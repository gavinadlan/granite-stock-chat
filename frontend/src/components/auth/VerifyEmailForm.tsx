import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { KeyRound } from 'lucide-react';

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
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-900">Verify your email</CardTitle>
        <CardDescription className="text-slate-600">
          We sent a 6-digit code to <span className="font-medium">{email}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium text-slate-700">
              Verification code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="pl-10 tracking-widest"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Verifying...' : 'Verify email'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Didn&apos;t get it?{' '}
          <button type="button" onClick={resend} className="text-blue-600 hover:text-blue-700 font-medium">
            Resend code
          </button>
        </p>
      </CardContent>
    </Card>
  );
}
