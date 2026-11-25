import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ChatMessage } from '@/services/stockMarketAPI';

const processMessage = vi.hoisted(() => vi.fn<(text: string) => Promise<ChatMessage>>());
vi.mock('@/services/stockMarketAPI', () => ({ stockMarketAPI: { processMessage } }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, logout: vi.fn() }) }));

import { ChatInterface } from './ChatInterface';

const reply = (extra: Partial<ChatMessage> = {}): ChatMessage => ({ id: crypto.randomUUID(), content: 'Reply', isUser: false, timestamp: new Date(), ...extra });
const composer = () => screen.getByRole('textbox', { name: /ask about a stock/i });
const renderChat = () => render(<ChatInterface />, { wrapper: MemoryRouter });

beforeEach(() => processMessage.mockReset().mockResolvedValue(reply()));

describe('ChatInterface', () => {
  it('sends an example, hides the empty state and returns focus to the composer', async () => {
    renderChat();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('New chat');
    fireEvent.click(screen.getByRole('button', { name: 'Technical analysis BBCA.JK' }));

    expect(processMessage).toHaveBeenCalledWith('Technical analysis BBCA.JK');
    expect(screen.queryByText(/what do you want to check/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Technical analysis BBCA.JK');
    expect(screen.getByText('Fetching data…')).toBeInTheDocument();
    expect(composer()).toHaveFocus();

    expect(await screen.findByText('Reply')).toBeInTheDocument();
    expect(screen.queryByText('Fetching data…')).not.toBeInTheDocument();
  });

  it('works with the keyboard alone and clears the composer', async () => {
    renderChat();
    fireEvent.change(composer(), { target: { value: 'AAPL price' } });
    fireEvent.keyDown(composer(), { key: 'Enter' });
    expect(processMessage).toHaveBeenCalledWith('AAPL price');
    expect(composer()).toHaveValue('');
    await screen.findByText('Reply');
  });

  it('announces messages in a polite live region', () => {
    renderChat();
    expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite');
  });

  it('shows an honest error with retry when the backend is down', async () => {
    processMessage.mockResolvedValueOnce(
      reply({ content: "Sorry, I couldn't get the price for AAPL. Network error.", error: { message: 'Network error.', retryText: 'AAPL price' } }),
    );
    renderChat();
    fireEvent.change(composer(), { target: { value: 'AAPL price' } });
    fireEvent.keyDown(composer(), { key: 'Enter' });
    fireEvent.click(await screen.findByRole('button', { name: /try again/i }));
    expect(processMessage).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    await screen.findByText('Reply');
  });

  it('offers a retry when processing throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    processMessage.mockRejectedValueOnce(new Error('boom'));
    renderChat();
    fireEvent.change(composer(), { target: { value: 'AAPL price' } });
    fireEvent.keyDown(composer(), { key: 'Enter' });
    expect(await screen.findByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.queryByText(/boom/)).not.toBeInTheDocument();
  });

  it('picks a stock from the searchable sheet', async () => {
    renderChat();
    fireEvent.click(screen.getByRole('button', { name: 'Stocks' }));
    const sheet = screen.getByRole('dialog', { name: 'Stocks' });
    fireEvent.change(within(sheet).getByRole('searchbox'), { target: { value: 'intel' } });
    fireEvent.click(within(sheet).getByRole('button', { name: /INTC/ }));
    expect(composer()).toHaveValue("What's the price of INTC?");
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(composer()).toHaveFocus());
    expect(processMessage).not.toHaveBeenCalled();
  });
});
