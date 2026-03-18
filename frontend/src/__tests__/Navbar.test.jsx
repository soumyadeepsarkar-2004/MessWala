import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../../components/Navbar';

describe('Navbar Component', () => {
  it('should render navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/expenses/i)).toBeInTheDocument();
    expect(screen.getByText(/menu/i)).toBeInTheDocument();
  });

  it('should display user menu when authenticated', () => {
    render(<Navbar isAuthenticated={true} user={{ name: 'John Doe' }} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should show login button when not authenticated', () => {
    render(<Navbar isAuthenticated={false} />);
    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('should call logout handler on logout', async () => {
    const mockLogout = vi.fn();
    render(<Navbar isAuthenticated={true} user={{ name: 'John' }} onLogout={mockLogout} />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await userEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should toggle mobile menu on small screens', async () => {
    render(<Navbar />);
    const menuButton = screen.getByRole('button', { name: /menu/i });

    await userEvent.click(menuButton);
    expect(screen.getByTestId('mobile-menu')).toHaveClass('visible');

    await userEvent.click(menuButton);
    expect(screen.getByTestId('mobile-menu')).not.toHaveClass('visible');
  });
});
