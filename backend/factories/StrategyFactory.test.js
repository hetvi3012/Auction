const StrategyFactory = require('./StrategyFactory');
const EnglishAuctionStrategy = require('../services/EnglishAuctionStrategy');
const VickreyAuctionStrategy = require('../services/VickreyAuctionStrategy');

describe('StrategyFactory', () => {
    // --- createStrategy ---
    describe('createStrategy()', () => {
        test('should create an EnglishAuctionStrategy instance', () => {
            const strategy = StrategyFactory.createStrategy('English');
            expect(strategy).toBeInstanceOf(EnglishAuctionStrategy);
        });

        test('should create a VickreyAuctionStrategy instance', () => {
            const strategy = StrategyFactory.createStrategy('Vickrey');
            expect(strategy).toBeInstanceOf(VickreyAuctionStrategy);
        });

        test('should throw for an unknown strategy type', () => {
            expect(() => StrategyFactory.createStrategy('Dutch'))
                .toThrow('Unknown auction strategy type: Dutch');
        });

        test('should return a new instance each time', () => {
            const s1 = StrategyFactory.createStrategy('English');
            const s2 = StrategyFactory.createStrategy('English');
            expect(s1).not.toBe(s2);
        });
    });

    // --- registerStrategy ---
    describe('registerStrategy()', () => {
        test('should register a new strategy type at runtime', () => {
            class DutchAuctionStrategy {}
            StrategyFactory.registerStrategy('Dutch', DutchAuctionStrategy);
            const strategy = StrategyFactory.createStrategy('Dutch');
            expect(strategy).toBeInstanceOf(DutchAuctionStrategy);

            // Clean up
            StrategyFactory.strategies.delete('Dutch');
        });
    });

    // --- getAvailableTypes ---
    describe('getAvailableTypes()', () => {
        test('should return an array containing English and Vickrey', () => {
            const types = StrategyFactory.getAvailableTypes();
            expect(types).toContain('English');
            expect(types).toContain('Vickrey');
        });

        test('should return an array', () => {
            expect(Array.isArray(StrategyFactory.getAvailableTypes())).toBe(true);
        });
    });
});
