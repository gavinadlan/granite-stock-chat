import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble', () => {
  it('offers a retry for failed assistant messages', () => {
    const onRetry = vi.fn();
    render(
      <MessageBubble
        message={{ id: '1', content: 'Sorry', isUser: false, timestamp: new Date(), error: { message: 'x', retryText: 'price AAPL' } }}
        onRetry={onRetry}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledWith('price AAPL');
  });

  it('shows no retry button for normal messages', () => {
    render(<MessageBubble message={{ id: '2', content: 'Hi', isUser: false, timestamp: new Date() }} onRetry={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
