jest.mock('../factories/StrategyFactory', () => ({
    getAvailableTypes: jest.fn(() => ['English', 'Vickrey']),
    createStrategy: jest.fn(),
}));

const AuctionBuilder = require('./AuctionBuilder');

describe('AuctionBuilder', () => {
    let builder;

    beforeEach(() => {
        builder = new AuctionBuilder();
    });

    // --- Fluent API ---
    describe('fluent chaining', () => {
        test('all setter methods should return the builder instance', () => {
            expect(builder.setTicket('t1')).toBe(builder);
            expect(builder.setStrategy('English')).toBe(builder);
            expect(builder.setStartingPrice(100)).toBe(builder);
            // Use a future date
            const futureDate = new Date(Date.now() + 86400000).toISOString();
            expect(builder.setEndTime(futureDate)).toBe(builder);
        });
    });

    // --- setStrategy ---
    describe('setStrategy()', () => {
        test('should accept a valid strategy type', () => {
            expect(() => builder.setStrategy('English')).not.toThrow();
            expect(builder.config.strategyType).toBe('English');
        });

        test('should throw for an invalid strategy type', () => {
            expect(() => builder.setStrategy('Dutch'))
                .toThrow('Invalid strategy type: Dutch');
        });
    });

    // --- setStartingPrice ---
    describe('setStartingPrice()', () => {
        test('should accept a positive number', () => {
            builder.setStartingPrice(50);
            expect(builder.config.startingPrice).toBe(50);
        });

        test('should throw for zero', () => {
            expect(() => builder.setStartingPrice(0))
                .toThrow('Starting price must be a positive number.');
        });

        test('should throw for negative number', () => {
            expect(() => builder.setStartingPrice(-10))
                .toThrow('Starting price must be a positive number.');
        });

        test('should throw for non-number types', () => {
            expect(() => builder.setStartingPrice('100'))
                .toThrow('Starting price must be a positive number.');
        });
    });

    // --- setEndTime ---
    describe('setEndTime()', () => {
        test('should accept a future date string', () => {
            const futureDate = new Date(Date.now() + 86400000).toISOString();
            builder.setEndTime(futureDate);
            expect(builder.config.endTime).toBeInstanceOf(Date);
        });

        test('should throw for a past date', () => {
            expect(() => builder.setEndTime('2020-01-01T00:00:00Z'))
                .toThrow('End time must be in the future.');
        });

        test('should throw for an invalid date string', () => {
            expect(() => builder.setEndTime('not-a-date'))
                .toThrow('Invalid end time.');
        });
    });

    // --- build ---
    describe('build()', () => {
        test('should return a frozen config object with all required fields', () => {
            const futureDate = new Date(Date.now() + 86400000).toISOString();
            const config = builder
                .setTicket('t1')
                .setStrategy('English')
                .setStartingPrice(100)
                .setEndTime(futureDate)
                .build();

            expect(config.ticketId).toBe('t1');
            expect(config.strategyType).toBe('English');
            expect(config.startingPrice).toBe(100);
            expect(config.endTime).toBeInstanceOf(Date);
            expect(Object.isFrozen(config)).toBe(true);
        });

        test('should throw if required fields are missing', () => {
            builder.setTicket('t1');
            expect(() => builder.build())
                .toThrow('AuctionBuilder: Missing required fields');
        });

        test('should reset internal state after build', () => {
            const futureDate = new Date(Date.now() + 86400000).toISOString();
            builder.setTicket('t1').setStrategy('English').setStartingPrice(100).setEndTime(futureDate).build();
            expect(builder.config).toEqual({});
        });
    });
});
