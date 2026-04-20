const mockBidModel = {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    name: 'Bid',
};

jest.mock('../models', () => ({
    Bid: mockBidModel,
}));

const BidRepository = require('./BidRepository');

describe('BidRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- findByAuction ---
    describe('findByAuction()', () => {
        test('should return bids for an auction sorted descending', async () => {
            const bids = [{ id: 'b1', amount: 200 }, { id: 'b2', amount: 100 }];
            mockBidModel.findAll.mockResolvedValue(bids);

            const result = await BidRepository.findByAuction('a1');

            expect(mockBidModel.findAll).toHaveBeenCalledWith({
                where: { auctionId: 'a1' },
                order: [['amount', 'DESC']],
            });
            expect(result).toEqual(bids);
        });

        test('should pass through additional options', async () => {
            mockBidModel.findAll.mockResolvedValue([]);
            await BidRepository.findByAuction('a1', { transaction: 'tx' });
            expect(mockBidModel.findAll).toHaveBeenCalledWith({
                where: { auctionId: 'a1' },
                order: [['amount', 'DESC']],
                transaction: 'tx',
            });
        });

        test('should return empty array if no bids', async () => {
            mockBidModel.findAll.mockResolvedValue([]);
            const result = await BidRepository.findByAuction('a-empty');
            expect(result).toEqual([]);
        });
    });

    // --- findHighestBid ---
    describe('findHighestBid()', () => {
        test('should return the highest bid for an auction', async () => {
            mockBidModel.findOne.mockResolvedValue({ id: 'b1', amount: 500 });

            const result = await BidRepository.findHighestBid('a1');

            expect(mockBidModel.findOne).toHaveBeenCalledWith({
                where: { auctionId: 'a1' },
                order: [['amount', 'DESC']],
            });
            expect(result).toEqual({ id: 'b1', amount: 500 });
        });

        test('should return null if no bids exist', async () => {
            mockBidModel.findOne.mockResolvedValue(null);
            const result = await BidRepository.findHighestBid('a-empty');
            expect(result).toBeNull();
        });
    });
});
