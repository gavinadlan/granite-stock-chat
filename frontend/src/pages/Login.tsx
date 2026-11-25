// Login page component
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FormLayout } from '@/components/FormLayout';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await login({ email, password });
      if (result.status === 'needsConfirmation') {
        toast({
          title: "Verify your email",
          description: "Your account isn't verified yet. We sent you a new code.",
        });
        navigate(`/register?verify=${encodeURIComponent(email.trim())}`);
        return;
      }

      toast({
        title: "Success",
        description: "Login successful! Welcome back.",
      });

      navigate('/chat');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormLayout title="Sign in" description="Sign in to use the stock chat." back={{ to: '/', label: 'Back to home' }}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field id="password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <p>
          <Link to="/forgot-password" className="font-medium underline underline-offset-4 hover:decoration-2">Forgot password?</Link>
        </p>
        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-6 text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-foreground underline underline-offset-4 hover:decoration-2">Sign up</Link>
      </p>
    </FormLayout>
  );
}
