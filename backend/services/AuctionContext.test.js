jest.mock('../factories/StrategyFactory', () => {
    const mockStrategy = {
        validateBid: jest.fn(() => true),
        determineWinnerAndPrice: jest.fn(() => ({ winnerId: 'u1', finalPrice: 100 })),
    };
    return {
        createStrategy: jest.fn(() => mockStrategy),
        __mockStrategy: mockStrategy,
    };
});

const AuctionContext = require('./AuctionContext');
const StrategyFactory = require('../factories/StrategyFactory');

describe('AuctionContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        AuctionContext.strategy = null;
    });

    // --- setStrategy ---
    describe('setStrategy()', () => {
        test('should call StrategyFactory.createStrategy with the given type', () => {
            AuctionContext.setStrategy('English');
            expect(StrategyFactory.createStrategy).toHaveBeenCalledWith('English');
        });

        test('should set the strategy property', () => {
            AuctionContext.setStrategy('Vickrey');
            expect(AuctionContext.strategy).toBeDefined();
            expect(AuctionContext.strategy).not.toBeNull();
        });
    });

    // --- validateBid ---
    describe('validateBid()', () => {
        test('should throw if no strategy is set', () => {
            expect(() => AuctionContext.validateBid(100, 150, 200))
                .toThrow('Auction strategy not set.');
        });

        test('should delegate to the strategy when set', () => {
            AuctionContext.setStrategy('English');
            const result = AuctionContext.validateBid(100, 150, 200);
            expect(StrategyFactory.__mockStrategy.validateBid).toHaveBeenCalledWith(100, 150, 200);
            expect(result).toBe(true);
        });
    });

    // --- determineWinnerAndPrice ---
    describe('determineWinnerAndPrice()', () => {
        test('should throw if no strategy is set', () => {
            expect(() => AuctionContext.determineWinnerAndPrice([]))
                .toThrow('Auction strategy not set.');
        });

        test('should delegate to the strategy when set', () => {
            AuctionContext.setStrategy('English');
            const bids = [{ bidderId: 'u1', amount: 100 }];
            const result = AuctionContext.determineWinnerAndPrice(bids);
            expect(StrategyFactory.__mockStrategy.determineWinnerAndPrice).toHaveBeenCalledWith(bids);
            expect(result).toEqual({ winnerId: 'u1', finalPrice: 100 });
        });
    });
});
