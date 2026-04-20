import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Auctions from './Auctions';

/* ---- Mocks ---- */
const mockGetActiveAuctions = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockPlaceBid = vi.fn();

vi.mock('../services/api', () => ({
    auctionService: {
        getActiveAuctions: (...args) => mockGetActiveAuctions(...args),
    },
    authService: {
        getCurrentUser: (...args) => mockGetCurrentUser(...args),
    },
    bidService: {
        placeBid: (...args) => mockPlaceBid(...args),
    },
}));

vi.mock('../utils/useSocket', () => ({
    useSocket: () => ({ latestBid: null, auctionClosed: null, socket: null }),
}));

/* ---- Sample Data ---- */
const sampleAuctions = [
    {
        id: 'auc-1',
        strategyType: 'English',
        currentHighestBid: 100,
        endTime: '2026-12-31T23:59:59Z',
        ticket: {
            eventId: 'Rock Concert',
            seatInfo: { section: 'A', row: '1', seat: '5' },
        },
    },
    {
        id: 'auc-2',
        strategyType: 'Vickrey',
        currentHighestBid: 250,
        endTime: '2026-11-15T18:00:00Z',
        ticket: {
            eventId: 'Football Final',
            seatInfo: { section: 'B', row: '3', seat: '12' },
        },
    },
];

/* ---- Tests ---- */
describe('Auctions Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('shows loading spinner while fetching', () => {
        mockGetActiveAuctions.mockReturnValue(new Promise(() => {}));
        render(<Auctions />);
        expect(document.querySelector('.animate-spin')).toBeTruthy();
    });

    test('shows empty state when no auctions exist', async () => {
        mockGetActiveAuctions.mockResolvedValue([]);
        render(<Auctions />);

        await waitFor(() => {
            expect(screen.getByText(/No active auctions/i)).toBeInTheDocument();
        });
    });

    test('renders auction cards with correct details', async () => {
        mockGetActiveAuctions.mockResolvedValue(sampleAuctions);
        render(<Auctions />);

        await waitFor(() => {
            expect(screen.getByText('Rock Concert')).toBeInTheDocument();
        });

        expect(screen.getByText('Football Final')).toBeInTheDocument();
        expect(screen.getByText('English Auction')).toBeInTheDocument();
        expect(screen.getByText('Vickrey Auction')).toBeInTheDocument();
    });

    test('shows error when user is not logged in and tries to bid', async () => {
        const user = userEvent.setup();
        mockGetActiveAuctions.mockResolvedValue([sampleAuctions[0]]);
        mockGetCurrentUser.mockReturnValue(null);

        render(<Auctions />);

        await waitFor(() => {
            expect(screen.getByText('Rock Concert')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText(/Min \$/i);
        await user.type(input, '150');
        await user.click(screen.getByText('Bid'));

        await waitFor(() => {
            expect(screen.getByText('Please log in to place a bid.')).toBeInTheDocument();
        });
    });

    test('shows error for invalid bid amount', async () => {
        const user = userEvent.setup();
        mockGetActiveAuctions.mockResolvedValue([sampleAuctions[0]]);
        mockGetCurrentUser.mockReturnValue({ token: 'tok' });

        render(<Auctions />);

        await waitFor(() => {
            expect(screen.getByText('Rock Concert')).toBeInTheDocument();
        });

        // Try bidding without entering a value
        await user.click(screen.getByText('Bid'));

        await waitFor(() => {
            expect(screen.getByText('Enter a valid bid amount.')).toBeInTheDocument();
        });
    });

    test('shows error when bid is too low', async () => {
        const user = userEvent.setup();
        mockGetActiveAuctions.mockResolvedValue([sampleAuctions[0]]);
        mockGetCurrentUser.mockReturnValue({ token: 'tok' });

        render(<Auctions />);

        await waitFor(() => {
            expect(screen.getByText('Rock Concert')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText(/Min \$/i);
        await user.type(input, '50');
        await user.click(screen.getByText('Bid'));

        await waitFor(() => {
            expect(screen.getByText(/Bid must be higher than/i)).toBeInTheDocument();
        });
    });

    test('successful bid calls bidService and shows success message', async () => {
        const user = userEvent.setup();
        mockGetActiveAuctions.mockResolvedValue([sampleAuctions[0]]);
        mockGetCurrentUser.mockReturnValue({ token: 'tok' });
        mockPlaceBid.mockResolvedValue({ success: true });

        render(<Auctions />);

        await waitFor(() => {
            expect(screen.getByText('Rock Concert')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText(/Min \$/i);
        await user.type(input, '150');
        await user.click(screen.getByText('Bid'));

        await waitFor(() => {
            expect(mockPlaceBid).toHaveBeenCalledWith({ auctionId: 'auc-1', amount: 150 });
        });

        await waitFor(() => {
            expect(screen.getByText('Bid placed successfully!')).toBeInTheDocument();
        });
    });
});
