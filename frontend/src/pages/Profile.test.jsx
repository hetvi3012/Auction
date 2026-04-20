import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Profile from './Profile';

/* ---- Mocks ---- */
const mockNavigate = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockGetProfile = vi.fn();
const mockTopUp = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../services/api', () => ({
    authService: {
        getCurrentUser: (...args) => mockGetCurrentUser(...args),
        getProfile: (...args) => mockGetProfile(...args),
        topUp: (...args) => mockTopUp(...args),
    },
}));

describe('Profile Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderProfile = () => {
        const { MemoryRouter } = require('react-router-dom');
        return render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );
    };

    test('redirects to login if no user', async () => {
        mockGetCurrentUser.mockReturnValue(null);
        renderProfile();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    test('shows loading spinner while fetching', () => {
        mockGetCurrentUser.mockReturnValue({ token: 'tok' });
        mockGetProfile.mockReturnValue(new Promise(() => {}));
        renderProfile();
        expect(document.querySelector('.animate-spin')).toBeTruthy();
    });

    test('renders profile data after loading', async () => {
        mockGetCurrentUser.mockReturnValue({ token: 'tok' });
        mockGetProfile.mockResolvedValue({
            user: {
                id: 'u1',
                name: 'Alice',
                email: 'alice@test.com',
                walletBalance: 1500,
                role: 'USER',
                createdAt: '2026-01-01T00:00:00Z',
            },
            bids: [],
        });

        renderProfile();

        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
        });
        expect(screen.getByText('alice@test.com')).toBeInTheDocument();
        expect(screen.getByText('USER')).toBeInTheDocument();
    });

    test('shows wallet balance', async () => {
        mockGetCurrentUser.mockReturnValue({ token: 'tok' });
        mockGetProfile.mockResolvedValue({
            user: {
                id: 'u1',
                name: 'Alice',
                email: 'alice@test.com',
                walletBalance: 1500,
                role: 'USER',
                createdAt: '2026-01-01T00:00:00Z',
            },
            bids: [],
        });

        renderProfile();

        await waitFor(() => {
            expect(screen.getByText('$1,500')).toBeInTheDocument();
        });
    });

    test('shows empty bid history message', async () => {
        mockGetCurrentUser.mockReturnValue({ token: 'tok' });
        mockGetProfile.mockResolvedValue({
            user: {
                id: 'u1',
                name: 'Alice',
                email: 'alice@test.com',
                walletBalance: 1500,
                role: 'USER',
                createdAt: '2026-01-01T00:00:00Z',
            },
            bids: [],
        });

        renderProfile();

        await waitFor(() => {
            expect(screen.getByText(/No bids placed yet/i)).toBeInTheDocument();
        });
    });

    test('renders bid history when bids exist', async () => {
        mockGetCurrentUser.mockReturnValue({ token: 'tok' });
        mockGetProfile.mockResolvedValue({
            user: {
                id: 'u1',
                name: 'Alice',
                email: 'alice@test.com',
                walletBalance: 1500,
                role: 'USER',
                createdAt: '2026-01-01T00:00:00Z',
            },
            bids: [
                {
                    id: 'b1',
                    amount: 200,
                    createdAt: '2026-03-15T10:00:00Z',
                    auction: {
                        id: 'a1',
                        strategyType: 'English',
                        status: 'Active',
                        currentHighestBid: 200,
                        winningBidderId: 'u1',
                        endTime: '2026-12-31T23:59:59Z',
                    },
                },
            ],
        });

        renderProfile();

        await waitFor(() => {
            expect(screen.getByText('$200')).toBeInTheDocument();
        });
        expect(screen.getByText('1 bid(s)')).toBeInTheDocument();
    });

    test('top up with valid amount shows success', async () => {
        const user = userEvent.setup();
        mockGetCurrentUser.mockReturnValue({ token: 'tok' });
        mockGetProfile.mockResolvedValue({
            user: {
                id: 'u1',
                name: 'Alice',
                email: 'alice@test.com',
                walletBalance: 1000,
                role: 'USER',
                createdAt: '2026-01-01T00:00:00Z',
            },
            bids: [],
        });
        mockTopUp.mockResolvedValue({ walletBalance: 1500 });

        renderProfile();

        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText(/Enter amount/i);
        await user.type(input, '500');
        await user.click(screen.getByText('Add Funds'));

        await waitFor(() => {
            expect(mockTopUp).toHaveBeenCalledWith(500);
        });

        await waitFor(() => {
            expect(screen.getByText(/Added \$500/i)).toBeInTheDocument();
        });
    });

    test('quick amount buttons populate the input', async () => {
        const user = userEvent.setup();
        mockGetCurrentUser.mockReturnValue({ token: 'tok' });
        mockGetProfile.mockResolvedValue({
            user: {
                id: 'u1',
                name: 'Alice',
                email: 'alice@test.com',
                walletBalance: 1000,
                role: 'USER',
                createdAt: '2026-01-01T00:00:00Z',
            },
            bids: [],
        });

        renderProfile();

        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
        });

        await user.click(screen.getByText('+$500'));
        const input = screen.getByPlaceholderText(/Enter amount/i);
        expect(input.value).toBe('500');
    });
});
