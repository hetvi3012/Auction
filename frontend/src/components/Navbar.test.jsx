import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

/* ---- Mocks ---- */
const mockGetCurrentUser = vi.fn();

vi.mock('../services/api', () => ({
    authService: {
        getCurrentUser: (...args) => mockGetCurrentUser(...args),
        logout: vi.fn(),
    },
}));

vi.mock('lucide-react', () => ({
    Ticket: (props) => <span data-testid="icon-ticket" {...props} />,
    Menu: (props) => <span data-testid="icon-menu" {...props} />,
    X: (props) => <span data-testid="icon-x" {...props} />,
    ShieldAlert: (props) => <span data-testid="icon-shield" {...props} />,
    UserCircle: (props) => <span data-testid="icon-user-circle" {...props} />,
}));

/* ---- Helper ---- */
const renderNavbar = () =>
    render(
        <MemoryRouter>
            <Navbar />
        </MemoryRouter>
    );

/* ---- Tests ---- */
describe('Navbar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders brand name', () => {
        mockGetCurrentUser.mockReturnValue(null);
        renderNavbar();
        expect(screen.getByText('FairPlay Auctions')).toBeInTheDocument();
    });

    test('shows Sign In and Get Started when user is logged out', () => {
        mockGetCurrentUser.mockReturnValue(null);
        renderNavbar();

        expect(screen.getByText('Sign In')).toBeInTheDocument();
        expect(screen.getByText('Get Started')).toBeInTheDocument();
        expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
        expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    });

    test('shows profile, balance, and sign out for a logged-in user', () => {
        mockGetCurrentUser.mockReturnValue({
            token: 'tok',
            role: 'USER',
            walletBalance: 1500,
        });
        renderNavbar();

        expect(screen.getByText('My Profile')).toBeInTheDocument();
        expect(screen.getByText('Balance: $1,500')).toBeInTheDocument();
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
        expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    test('does NOT show Admin Panel for regular users', () => {
        mockGetCurrentUser.mockReturnValue({
            token: 'tok',
            role: 'USER',
            walletBalance: 100,
        });
        renderNavbar();

        expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    });

    test('shows Admin Panel link for ADMIN users', () => {
        mockGetCurrentUser.mockReturnValue({
            token: 'tok',
            role: 'ADMIN',
            walletBalance: 5000,
        });
        renderNavbar();

        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    test('renders navigation links', () => {
        mockGetCurrentUser.mockReturnValue(null);
        renderNavbar();

        expect(screen.getByText('Active Auctions')).toBeInTheDocument();
        expect(screen.getByText('Sell Ticket')).toBeInTheDocument();
    });
});
