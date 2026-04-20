import { describe, test, expect, vi, beforeEach } from 'vitest';

/* ---- Mock axios ---- */
const mockPost = vi.fn();
const mockGet = vi.fn();
const mockCreate = vi.fn(() => ({
    interceptors: {
        request: { use: vi.fn() },
    },
    post: mockPost,
    get: mockGet,
}));

vi.mock('axios', () => ({
    default: {
        create: mockCreate,
    },
}));

describe('API Service', () => {
    let authService, ticketService, auctionService, bidService, adminService;

    beforeEach(async () => {
        vi.clearAllMocks();
        // Clear localStorage
        localStorage.clear();
        // Re-import to get fresh module
        const api = await import('./api');
        authService = api.authService;
        ticketService = api.ticketService;
        auctionService = api.auctionService;
        bidService = api.bidService;
        adminService = api.adminService;
    });

    // --- authService ---
    describe('authService', () => {
        test('register should post to /auth/register and store user in localStorage', async () => {
            const userData = { name: 'Alice', email: 'a@b.com', password: 'pw' };
            const responseData = { id: 'u1', name: 'Alice', token: 'tok123' };
            mockPost.mockResolvedValue({ data: responseData });

            const result = await authService.register(userData);

            expect(mockPost).toHaveBeenCalledWith('/auth/register', userData);
            expect(result).toEqual(responseData);
            expect(JSON.parse(localStorage.getItem('user'))).toEqual(responseData);
        });

        test('login should post to /auth/login and store user in localStorage', async () => {
            const loginData = { email: 'a@b.com', password: 'pw' };
            const responseData = { id: 'u1', token: 'tok456' };
            mockPost.mockResolvedValue({ data: responseData });

            const result = await authService.login(loginData);

            expect(mockPost).toHaveBeenCalledWith('/auth/login', loginData);
            expect(JSON.parse(localStorage.getItem('user'))).toEqual(responseData);
        });

        test('logout should remove user from localStorage', () => {
            localStorage.setItem('user', JSON.stringify({ token: 'tok' }));
            authService.logout();
            expect(localStorage.getItem('user')).toBeNull();
        });

        test('getCurrentUser should parse user from localStorage', () => {
            const user = { id: 'u1', token: 'tok' };
            localStorage.setItem('user', JSON.stringify(user));
            expect(authService.getCurrentUser()).toEqual(user);
        });

        test('getCurrentUser should return null when no user', () => {
            expect(authService.getCurrentUser()).toBeNull();
        });

        test('topUp should post amount and update localStorage balance', async () => {
            localStorage.setItem('user', JSON.stringify({ id: 'u1', walletBalance: 1000, token: 'tok' }));
            mockPost.mockResolvedValue({ data: { walletBalance: 1500 } });

            const result = await authService.topUp(500);

            expect(mockPost).toHaveBeenCalledWith('/auth/topup', { amount: 500 });
            expect(result.walletBalance).toBe(1500);
            expect(JSON.parse(localStorage.getItem('user')).walletBalance).toBe(1500);
        });

        test('getProfile should get from /auth/profile', async () => {
            mockGet.mockResolvedValue({ data: { user: { id: 'u1' }, bids: [] } });
            const result = await authService.getProfile();
            expect(mockGet).toHaveBeenCalledWith('/auth/profile');
            expect(result.user.id).toBe('u1');
        });
    });

    // --- ticketService ---
    describe('ticketService', () => {
        test('createTicket should post to /tickets', async () => {
            mockPost.mockResolvedValue({ data: { id: 't1' } });
            const result = await ticketService.createTicket({ eventId: 'e1' });
            expect(mockPost).toHaveBeenCalledWith('/tickets', { eventId: 'e1' });
            expect(result.id).toBe('t1');
        });

        test('getAvailableTickets should get from /tickets', async () => {
            mockGet.mockResolvedValue({ data: [{ id: 't1' }] });
            const result = await ticketService.getAvailableTickets();
            expect(mockGet).toHaveBeenCalledWith('/tickets');
            expect(result).toEqual([{ id: 't1' }]);
        });
    });

    // --- auctionService ---
    describe('auctionService', () => {
        test('createAuction should post to /auctions', async () => {
            mockPost.mockResolvedValue({ data: { id: 'a1' } });
            const result = await auctionService.createAuction({ ticketId: 't1' });
            expect(mockPost).toHaveBeenCalledWith('/auctions', { ticketId: 't1' });
        });

        test('getActiveAuctions should get from /auctions', async () => {
            mockGet.mockResolvedValue({ data: [{ id: 'a1' }] });
            const result = await auctionService.getActiveAuctions();
            expect(mockGet).toHaveBeenCalledWith('/auctions');
        });
    });

    // --- bidService ---
    describe('bidService', () => {
        test('placeBid should post to /bids', async () => {
            mockPost.mockResolvedValue({ data: { success: true } });
            await bidService.placeBid({ auctionId: 'a1', amount: 100 });
            expect(mockPost).toHaveBeenCalledWith('/bids', { auctionId: 'a1', amount: 100 });
        });

        test('placeProxyBid should post to /bids/proxy', async () => {
            mockPost.mockResolvedValue({ data: { message: 'ok' } });
            await bidService.placeProxyBid({ auctionId: 'a1', maxWillingToPay: 500 });
            expect(mockPost).toHaveBeenCalledWith('/bids/proxy', { auctionId: 'a1', maxWillingToPay: 500 });
        });
    });

    // --- adminService ---
    describe('adminService', () => {
        test('getAnalytics should get from /admin/analytics', async () => {
            mockGet.mockResolvedValue({ data: { status: 'HEALTHY' } });
            const result = await adminService.getAnalytics();
            expect(mockGet).toHaveBeenCalledWith('/admin/analytics');
        });

        test('getAuctions should get from /admin/auctions', async () => {
            mockGet.mockResolvedValue({ data: [] });
            await adminService.getAuctions();
            expect(mockGet).toHaveBeenCalledWith('/admin/auctions');
        });

        test('closeAuction should post to /auctions/:id/close', async () => {
            mockPost.mockResolvedValue({ data: { success: true } });
            await adminService.closeAuction('a1');
            expect(mockPost).toHaveBeenCalledWith('/auctions/a1/close');
        });
    });
});
