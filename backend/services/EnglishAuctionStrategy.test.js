const EnglishAuctionStrategy = require('./EnglishAuctionStrategy');

describe('EnglishAuctionStrategy', () => {
    let strategy;

    beforeEach(() => {
        strategy = new EnglishAuctionStrategy();
    });

    // --- validateBid ---
    describe('validateBid()', () => {
        test('should return true for a valid bid above current highest with sufficient balance', () => {
            expect(strategy.validateBid(100, 150, 200)).toBe(true);
        });

        test('should throw if bid is equal to current highest', () => {
            expect(() => strategy.validateBid(100, 100, 200))
                .toThrow('Bid must be higher than the current highest bid.');
        });

        test('should throw if bid is lower than current highest', () => {
            expect(() => strategy.validateBid(100, 50, 200))
                .toThrow('Bid must be higher than the current highest bid.');
        });

        test('should throw if wallet balance is insufficient', () => {
            expect(() => strategy.validateBid(100, 150, 100))
                .toThrow('Insufficient wallet balance to place this bid.');
        });

        test('should throw for insufficient balance even if bid is valid amount', () => {
            expect(() => strategy.validateBid(50, 100, 99))
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

        test('should return the single bidder as winner paying their bid', () => {
            const bids = [{ bidderId: 'user-1', amount: 100 }];
            const result = strategy.determineWinnerAndPrice(bids);
            expect(result).toEqual({ winnerId: 'user-1', finalPrice: 100 });
        });

        test('should return the highest bidder as winner paying their bid', () => {
            const bids = [
                { bidderId: 'user-1', amount: 100 },
                { bidderId: 'user-2', amount: 200 },
                { bidderId: 'user-3', amount: 150 },
            ];
            const result = strategy.determineWinnerAndPrice(bids);
            expect(result).toEqual({ winnerId: 'user-2', finalPrice: 200 });
        });

        test('should handle pre-sorted descending bids correctly', () => {
            const bids = [
                { bidderId: 'user-2', amount: 300 },
                { bidderId: 'user-1', amount: 200 },
            ];
            const result = strategy.determineWinnerAndPrice(bids);
            expect(result).toEqual({ winnerId: 'user-2', finalPrice: 300 });
        });
    });
});
