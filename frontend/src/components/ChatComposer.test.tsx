import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ChatComposer } from './ChatComposer';

function setup(props: Partial<React.ComponentProps<typeof ChatComposer>> = {}) {
  const onSend = vi.fn();
  render(<ChatComposer value="AAPL price" onChange={() => {}} onSend={onSend} busy={false} {...props} />);
  return { onSend, input: screen.getByRole('textbox', { name: /ask about a stock/i }) };
}

describe('ChatComposer', () => {
  it('sends on Enter', () => {
    const { onSend, input } = setup();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledOnce();
  });

  it('keeps Shift+Enter for a new line', () => {
    const { onSend, input } = setup();
    expect(fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })).toBe(true); // default not prevented
    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not send while an IME is composing', () => {
    const { onSend, input } = setup();
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it.each([
    ['empty', { value: '   ' }],
    ['busy', { busy: true }],
  ])('does not send when %s', (_, props) => {
    const { onSend, input } = setup(props);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
    expect(input).toBeEnabled();
  });

  it('always shows the disclaimer in both languages', () => {
    setup();
    expect(screen.getByText(/not financial advice/i)).toBeInTheDocument();
    expect(screen.getByText(/bukan nasihat keuangan/i)).toBeInTheDocument();
  });
});
