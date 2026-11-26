import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

interface FormLayoutProps {
  title: string;
  description?: React.ReactNode;
  back: { to: string; label: string };
  children: React.ReactNode;
}

/** Single 400px column shared by the auth, settings and profile pages. */
export function FormLayout({ title, description, back, children }: FormLayoutProps) {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-[432px] bg-background px-4 py-6 sm:py-16">
      <Link to="/" className="mb-6 inline-flex min-h-11 items-center rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Logo />
      </Link>
      <div>
        <Link to={back.to} className="inline-flex min-h-11 items-center rounded-control text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          {back.label}
        </Link>
      </div>
      <h1 className="mt-6 text-heading font-semibold">{title}</h1>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      <div className="mt-8">{children}</div>
    </main>
  );
}
