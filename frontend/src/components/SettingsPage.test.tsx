import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from './SettingsPage';
import { UserProfile } from './UserProfile';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { userId: 'u1', email: 'a@example.com', name: 'A' },
    logout: vi.fn(),
    updateProfile: vi.fn(),
  }),
}));

describe('SettingsPage', () => {
  it('sends password changes through the real reset flow', () => {
    render(<SettingsPage />, { wrapper: MemoryRouter });
    expect(screen.getByRole('link', { name: /change password/i })).toHaveAttribute('href', '/forgot-password');
  });

  it('hides controls that have no implementation', () => {
    render(<SettingsPage />, { wrapper: MemoryRouter });
    expect(screen.queryByText(/delete account/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/push notifications/i)).not.toBeInTheDocument();
  });
});

describe('UserProfile', () => {
  it('shows no made-up member date', () => {
    render(<UserProfile />, { wrapper: MemoryRouter });
    expect(screen.queryByText(/member since/i)).not.toBeInTheDocument();
  });
});
