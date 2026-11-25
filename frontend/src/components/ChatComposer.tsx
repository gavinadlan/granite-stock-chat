import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Disclaimer } from './Disclaimer';

const MAX_HEIGHT_PX = 200;

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  /** A request is running: typing stays possible (and keeps focus), sending is blocked. */
  busy: boolean;
}

export const ChatComposer = forwardRef<HTMLTextAreaElement, ChatComposerProps>(({ value, onChange, onSend, busy }, ref) => {
  const textarea = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => textarea.current as HTMLTextAreaElement);
  const canSend = value.trim() !== '' && !busy;

  useLayoutEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // isComposing: Enter confirms an IME suggestion, it does not send.
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    if (canSend) onSend();
  };

  return (
    <div className="sticky bottom-0 bg-background pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) onSend();
        }}
        className="flex items-end gap-2 rounded-panel border border-input bg-card p-2 focus-within:ring-2 focus-within:ring-ring"
      >
        <textarea
          ref={textarea}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Ask about a stock"
          placeholder="Ask about a stock…"
          className="min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 placeholder:text-muted-foreground focus:outline-none"
        />
        <Button type="submit" size="icon" className="h-11 w-11 flex-shrink-0 rounded-card" disabled={!canSend} aria-label="Send message">
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </Button>
      </form>
      <Disclaimer short className="mt-2 text-center" />
    </div>
  );
});
ChatComposer.displayName = 'ChatComposer';
