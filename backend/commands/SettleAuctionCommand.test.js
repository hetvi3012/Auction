const SettleAuctionCommand = require('./SettleAuctionCommand');
const AuctionSettlementService = require('../services/AuctionSettlementService');

// Mock the settlement service
jest.mock('../services/AuctionSettlementService', () => ({
    settleAuction: jest.fn(),
}));

describe('SettleAuctionCommand', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Constructor Tests ---
    describe('constructor', () => {
        test('should store the auctionId', () => {
            const cmd = new SettleAuctionCommand('auction-123');
            expect(cmd.auctionId).toBe('auction-123');
        });

        test('should initialise result to null', () => {
            const cmd = new SettleAuctionCommand('auction-123');
            expect(cmd.result).toBeNull();
        });
    });

    // --- execute() Tests ---
    describe('execute()', () => {
        test('should call AuctionSettlementService.settleAuction with the correct auctionId', async () => {
            AuctionSettlementService.settleAuction.mockResolvedValue({ success: true });

            const cmd = new SettleAuctionCommand('auction-456');
            await cmd.execute();

            expect(AuctionSettlementService.settleAuction).toHaveBeenCalledTimes(1);
            expect(AuctionSettlementService.settleAuction).toHaveBeenCalledWith('auction-456');
        });

        test('should store the settlement result in this.result', async () => {
            const mockResult = { success: true, message: 'Auction settled' };
            AuctionSettlementService.settleAuction.mockResolvedValue(mockResult);

            const cmd = new SettleAuctionCommand('auction-789');
            const returned = await cmd.execute();

            expect(cmd.result).toEqual(mockResult);
            expect(returned).toEqual(mockResult);
        });

        test('should propagate errors from the settlement service', async () => {
            AuctionSettlementService.settleAuction.mockRejectedValue(new Error('Auction not found'));

            const cmd = new SettleAuctionCommand('bad-id');

            await expect(cmd.execute()).rejects.toThrow('Auction not found');
            expect(cmd.result).toBeNull(); // result should remain null on failure
        });
    });

    // --- undo() Tests ---
    describe('undo()', () => {
        test('should log a message and not throw', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const cmd = new SettleAuctionCommand('auction-undo');
            await expect(cmd.undo()).resolves.toBeUndefined();

            expect(consoleSpy).toHaveBeenCalledWith(
                '[SettleAuctionCommand] Undo not yet implemented for auction auction-undo'
            );

            consoleSpy.mockRestore();
        });
    });
});
