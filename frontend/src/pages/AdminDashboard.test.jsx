import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from './AdminDashboard';

/* ---- Mocks ---- */
const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock('lucide-react', () => ({
    Activity: (props) => <span data-testid="icon-activity" {...props} />,
    Users: (props) => <span data-testid="icon-users" {...props} />,
    DollarSign: (props) => <span data-testid="icon-dollar" {...props} />,
    Database: (props) => <span data-testid="icon-database" {...props} />,
    AlertCircle: (props) => <span data-testid="icon-alert" {...props} />,
    XCircle: (props) => <span data-testid="icon-xcircle" {...props} />,
}));

const mockGetCurrentUser = vi.fn();
const mockGetAnalytics = vi.fn();
const mockGetAuctions = vi.fn();
const mockCloseAuction = vi.fn();

vi.mock('../services/api', () => ({
    authService: {
        getCurrentUser: (...args) => mockGetCurrentUser(...args),
    },
    adminService: {
        getAnalytics: (...args) => mockGetAnalytics(...args),
        getAuctions: (...args) => mockGetAuctions(...args),
        closeAuction: (...args) => mockCloseAuction(...args),
    },
}));

/* ---- Helpers ---- */
const sampleMetrics = {
    totalVolume: 25000,
    totalUsers: 42,
    auctions: { active: 3, completed: 10 },
};

const sampleAuctions = [
    {
        id: 'a1',
        strategyType: 'Vickrey',
        currentHighestBid: 500,
        status: 'Active',
        endTime: '2026-12-31T23:59:59Z',
        ticket: { eventId: 'Concert' },
    },
    {
        id: 'a2',
        strategyType: 'English',
        currentHighestBid: 200,
        status: 'Closed',
        endTime: '2026-01-01T00:00:00Z',
        ticket: { eventId: 'Sports Game' },
    },
];

/* ---- Tests ---- */
describe('AdminDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('redirects to /login when no user is logged in', async () => {
        mockGetCurrentUser.mockReturnValue(null);

        render(<AdminDashboard />);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    test('renders loading spinner initially', () => {
        mockGetCurrentUser.mockReturnValue({ token: 'tok', role: 'ADMIN' });
        mockGetAnalytics.mockReturnValue(new Promise(() => {})); // never resolves
        mockGetAuctions.mockReturnValue(new Promise(() => {}));

        render(<AdminDashboard />);

        expect(screen.getByText('', { selector: '.animate-spin' }) || document.querySelector('.animate-spin')).toBeTruthy();
    });

    test('renders metrics and auctions on successful load', async () => {
        mockGetCurrentUser.mockReturnValue({ token: 'tok', role: 'ADMIN' });
        mockGetAnalytics.mockResolvedValue({ metrics: sampleMetrics });
        mockGetAuctions.mockResolvedValue(sampleAuctions);

        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Enterprise Analytics Dashboard')).toBeInTheDocument();
        });

        // Metrics
        expect(screen.getByText('$25,000')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();

        // Auction rows
        expect(screen.getByText('Concert')).toBeInTheDocument();
        expect(screen.getByText('Sports Game')).toBeInTheDocument();
    });

    test('renders error banner when API fails', async () => {
        mockGetCurrentUser.mockReturnValue({ token: 'tok', role: 'ADMIN' });
        mockGetAnalytics.mockRejectedValue({ response: { data: { message: 'Forbidden' } } });
        mockGetAuctions.mockRejectedValue(new Error('fail'));

        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Forbidden')).toBeInTheDocument();
        });
        expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    });

    test('close auction button calls adminService.closeAuction', async () => {
        const user = userEvent.setup();
        mockGetCurrentUser.mockReturnValue({ token: 'tok', role: 'ADMIN' });
        mockGetAnalytics.mockResolvedValue({ metrics: sampleMetrics });
        mockGetAuctions.mockResolvedValue(sampleAuctions);
        mockCloseAuction.mockResolvedValue({});

        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Close Auction')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Close Auction'));

        await waitFor(() => {
            expect(mockCloseAuction).toHaveBeenCalledWith('a1');
        });
    });
});
