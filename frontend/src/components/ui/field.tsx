import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/input';

interface FieldProps extends InputProps {
  id: string;
  label: string;
  hint?: string;
}

/** Labelled input. Password fields get a show/hide button. */
export function Field({ id, label, hint, type, ...props }: FieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={isPassword && visible ? 'text' : type}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={isPassword ? 'h-11 pr-12' : 'h-11'}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-control text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
