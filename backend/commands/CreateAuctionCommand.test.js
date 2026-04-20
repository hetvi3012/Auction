jest.mock('../builders/AuctionBuilder', () => {
    const mockConfig = { ticketId: 't1', strategyType: 'English', startingPrice: 100, endTime: new Date('2027-01-01') };
    return jest.fn().mockImplementation(() => ({
        setTicket: jest.fn().mockReturnThis(),
        setStrategy: jest.fn().mockReturnThis(),
        setStartingPrice: jest.fn().mockReturnThis(),
        setEndTime: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue(mockConfig),
    }));
});

jest.mock('../factories/AuctionFactory', () => ({
    createAuction: jest.fn().mockResolvedValue({ id: 'a1', status: 'Active' }),
}));

const CreateAuctionCommand = require('./CreateAuctionCommand');
const AuctionBuilder = require('../builders/AuctionBuilder');
const AuctionFactory = require('../factories/AuctionFactory');

describe('CreateAuctionCommand', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- constructor ---
    describe('constructor', () => {
        test('should store params and sellerId', () => {
            const params = { ticketId: 't1', strategyType: 'English', startingPrice: 100, endTime: '2027-01-01' };
            const cmd = new CreateAuctionCommand(params, 'seller-1');
            expect(cmd.params).toEqual(params);
            expect(cmd.sellerId).toBe('seller-1');
            expect(cmd.auction).toBeNull();
        });
    });

    // --- execute ---
    describe('execute()', () => {
        test('should use AuctionBuilder to build config and AuctionFactory to create auction', async () => {
            const params = { ticketId: 't1', strategyType: 'English', startingPrice: 100, endTime: '2027-01-01' };
            const cmd = new CreateAuctionCommand(params, 'seller-1');
            const result = await cmd.execute();

            // Builder was instantiated
            expect(AuctionBuilder).toHaveBeenCalled();

            // Factory was called
            expect(AuctionFactory.createAuction).toHaveBeenCalledWith(
                expect.any(Object),
                'seller-1'
            );

            expect(result).toEqual({ id: 'a1', status: 'Active' });
            expect(cmd.auction).toEqual({ id: 'a1', status: 'Active' });
        });
    });

    // --- undo ---
    describe('undo()', () => {
        test('should log a message and not throw', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const cmd = new CreateAuctionCommand({}, 'seller-1');
            await expect(cmd.undo()).resolves.toBeUndefined();
            consoleSpy.mockRestore();
        });
    });
});
