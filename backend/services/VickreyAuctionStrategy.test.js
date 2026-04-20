const VickreyAuctionStrategy = require('./VickreyAuctionStrategy');

describe('VickreyAuctionStrategy', () => {
    let strategy;

    beforeEach(() => {
        strategy = new VickreyAuctionStrategy();
    });

    // --- validateBid ---
    describe('validateBid()', () => {
        test('should return true for a valid positive bid with sufficient balance', () => {
            expect(strategy.validateBid(0, 100, 200)).toBe(true);
        });

        test('should allow bid equal to current highest (sealed-bid)', () => {
            expect(strategy.validateBid(100, 100, 200)).toBe(true);
        });

        test('should throw if bid is zero', () => {
            expect(() => strategy.validateBid(0, 0, 200))
                .toThrow('Bid must be strictly positive.');
        });

        test('should throw if bid is negative', () => {
            expect(() => strategy.validateBid(0, -10, 200))
                .toThrow('Bid must be strictly positive.');
        });

        test('should throw if wallet balance is insufficient', () => {
            expect(() => strategy.validateBid(0, 150, 100))
                .toThrow('Insufficient wallet balance to place this bid.');
        });
    });

    // --- determineWinnerAndPrice ---
    describe('determineWinnerAndPrice()', () => {
        test('should return null for empty bids array', () => {
            expect(strategy.determineWinnerAndPrice([])).toBeNull();
        });

        test('should return null for null/undefined bids', () => {
            expect(strategy.determineWinnerAndPrice(null)).toBeNull();
            expect(strategy.determineWinnerAndPrice(undefined)).toBeNull();
        });

        test('should return single bidder paying their own bid', () => {
            const bids = [{ bidderId: 'user-1', amount: 100 }];
            const result = strategy.determineWinnerAndPrice(bids);
            expect(result).toEqual({ winnerId: 'user-1', finalPrice: 100 });
        });

        test('should return highest bidder paying SECOND highest price (Vickrey rule)', () => {
            const bids = [
                { bidderId: 'user-1', amount: 100 },
                { bidderId: 'user-2', amount: 200 },
                { bidderId: 'user-3', amount: 150 },
            ];
            const result = strategy.determineWinnerAndPrice(bids);
            expect(result).toEqual({ winnerId: 'user-2', finalPrice: 150 });
        });

        test('should handle two bids correctly', () => {
            const bids = [
                { bidderId: 'user-1', amount: 300 },
                { bidderId: 'user-2', amount: 500 },
            ];
            const result = strategy.determineWinnerAndPrice(bids);
            expect(result).toEqual({ winnerId: 'user-2', finalPrice: 300 });
        });
    });
});
