// Two-step password reset with Cognito: request a code, then set a new password.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, KeyRound, Lock, Mail } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to sign in
          </Link>
        </div>
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">Reset password</CardTitle>
            <CardDescription className="text-slate-600">
              {step === 'request' ? 'Enter your email and we will send you a reset code.' : `Enter the code sent to ${email}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'request' ? (
              <form onSubmit={requestCode} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="email" aria-label="Email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? 'Sending...' : 'Send reset code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={reset} className="space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input aria-label="Reset code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="pl-10 tracking-widest" maxLength={6} required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="password" aria-label="New password" autoComplete="new-password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? 'Saving...' : 'Set new password'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
