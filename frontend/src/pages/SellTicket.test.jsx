import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import SellTicket from './SellTicket';

/* ---- Mocks ---- */
const mockNavigate = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockCreateTicket = vi.fn();
const mockCreateAuction = vi.fn();

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
    },
    ticketService: {
        createTicket: (...args) => mockCreateTicket(...args),
    },
    auctionService: {
        createAuction: (...args) => mockCreateAuction(...args),
    },
}));

describe('SellTicket Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderSell = () => {
        const { MemoryRouter } = require('react-router-dom');
        return render(
            <MemoryRouter>
                <SellTicket />
            </MemoryRouter>
        );
    };

    test('renders the form with all required sections', () => {
        renderSell();
        expect(screen.getByText(/List a Ticket for Auction/i)).toBeInTheDocument();
        expect(screen.getByText('Event Information')).toBeInTheDocument();
        expect(screen.getByText('Auction Format')).toBeInTheDocument();
    });

    test('renders English and Vickrey auction options', () => {
        renderSell();
        expect(screen.getByText('English Auction')).toBeInTheDocument();
        expect(screen.getByText('Vickrey Auction')).toBeInTheDocument();
    });

    test('renders event name input', () => {
        renderSell();
        expect(screen.getByPlaceholderText(/Taylor Swift/i)).toBeInTheDocument();
    });

    test('renders starting price input', () => {
        renderSell();
        expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    });

    test('renders duration dropdown', () => {
        renderSell();
        expect(screen.getByText('1 hour')).toBeInTheDocument();
        expect(screen.getByText('24 hours')).toBeInTheDocument();
    });

    test('renders Start Auction button', () => {
        renderSell();
        expect(screen.getByRole('button', { name: /start auction/i })).toBeInTheDocument();
    });

    test('redirects to login if user not logged in', async () => {
        const user = userEvent.setup();
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        mockGetCurrentUser.mockReturnValue(null);
        renderSell();

        // Fill required fields
        await user.type(screen.getByPlaceholderText(/Taylor Swift/i), 'Concert');
        await user.type(screen.getByPlaceholderText('0.00'), '100');
        await user.click(screen.getByRole('button', { name: /start auction/i }));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Please login first to sell a ticket.');
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });

        alertSpy.mockRestore();
    });

    test('successful submission creates ticket and auction then navigates', async () => {
        const user = userEvent.setup();
        mockGetCurrentUser.mockReturnValue({ token: 'tok', id: 'u1' });
        mockCreateTicket.mockResolvedValue({ id: 't1' });
        mockCreateAuction.mockResolvedValue({ id: 'a1' });

        renderSell();

        await user.type(screen.getByPlaceholderText(/Taylor Swift/i), 'Concert');
        await user.type(screen.getByPlaceholderText('0.00'), '100');
        await user.click(screen.getByRole('button', { name: /start auction/i }));

        await waitFor(() => {
            expect(mockCreateTicket).toHaveBeenCalledWith({
                eventId: 'Concert',
                seatInfo: { section: '', row: '', seat: '' },
            });
            expect(mockCreateAuction).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketId: 't1',
                    strategyType: 'English',
                    startingPrice: 100,
                })
            );
            expect(mockNavigate).toHaveBeenCalledWith('/auctions');
        });
    });

    test('Vickrey auction can be selected', async () => {
        const user = userEvent.setup();
        mockGetCurrentUser.mockReturnValue({ token: 'tok', id: 'u1' });
        mockCreateTicket.mockResolvedValue({ id: 't1' });
        mockCreateAuction.mockResolvedValue({ id: 'a1' });

        renderSell();

        // Click on Vickrey option
        await user.click(screen.getByText('Vickrey Auction'));

        // Fill and submit
        await user.type(screen.getByPlaceholderText(/Taylor Swift/i), 'Event');
        await user.type(screen.getByPlaceholderText('0.00'), '50');
        await user.click(screen.getByRole('button', { name: /start auction/i }));

        await waitFor(() => {
            expect(mockCreateAuction).toHaveBeenCalledWith(
                expect.objectContaining({
                    strategyType: 'Vickrey',
                })
            );
        });
    });
});
