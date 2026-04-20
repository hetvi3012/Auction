const NotificationService = require('./NotificationService');

describe('NotificationService', () => {
    let service;
    let consoleSpy;

    beforeEach(() => {
        service = new NotificationService();
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    // --- onNewBid ---
    describe('onNewBid()', () => {
        test('should log MANUAL BID for non-proxy bids', () => {
            service.onNewBid({
                auctionId: 'a1',
                bidderId: 'u1',
                amount: 100,
                timestamp: '2026-01-01T00:00:00Z',
            });
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('MANUAL BID')
            );
        });

        test('should log PROXY AUTO-BID for proxy bids', () => {
            service.onNewBid({
                auctionId: 'a1',
                bidderId: 'u1',
                amount: 100,
                timestamp: '2026-01-01T00:00:00Z',
                isProxyAutoBid: true,
            });
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('PROXY AUTO-BID')
            );
        });

        test('should log the bid amount', () => {
            service.onNewBid({
                auctionId: 'a1',
                bidderId: 'u1',
                amount: 250,
                timestamp: '2026-01-01T00:00:00Z',
            });
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('$250'));
        });
    });

    // --- onAuctionClosed ---
    describe('onAuctionClosed()', () => {
        test('should log winner details when there is a winner', () => {
            service.onAuctionClosed({
                auctionId: 'a1',
                winningBidderId: 'u1',
                finalPrice: 500,
            });
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Auction Closed Alert')
            );
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('$500'));
        });

        test('should log no-bids message when there is no winner', () => {
            service.onAuctionClosed({
                auctionId: 'a1',
                winningBidderId: null,
                finalPrice: 0,
                message: 'No bids placed.',
            });
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('No Bids')
            );
        });

        test('should use default message when no message provided and no winner', () => {
            service.onAuctionClosed({
                auctionId: 'a1',
                winningBidderId: null,
                finalPrice: 0,
            });
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('No bids were placed.')
            );
        });
    });
});
