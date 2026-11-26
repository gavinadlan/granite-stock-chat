import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Side drawer on desktop, bottom sheet on mobile. Native <dialog> provides the
 * focus trap, Escape to close, inert background and focus return.
 */
export function Sheet({ open, onOpenChange, title, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={() => onOpenChange(false)}
      // The dialog has no padding, so a click on the element itself is a click on the backdrop.
      onClick={(e) => e.target === e.currentTarget && onOpenChange(false)}
      className={cn(
        'fixed inset-x-0 bottom-0 top-auto m-0 h-[80dvh] max-h-none w-full max-w-none rounded-t-panel border-t bg-popover p-0 text-popover-foreground backdrop:bg-black/50',
        'md:inset-y-0 md:left-auto md:right-0 md:h-dvh md:w-[380px] md:rounded-none md:border-l md:border-t-0',
      )}
    >
      {open && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b py-2 pl-4 pr-2">
            <h2 id={titleId} className="text-title font-semibold">
              {title}
            </h2>
            <Button variant="ghost" size="icon" aria-label="Close" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
