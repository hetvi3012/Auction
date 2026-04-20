const mockTicket = {
    findByPk: jest.fn(),
};
const mockAuction = {
    create: jest.fn(),
};

jest.mock('../models', () => ({
    Ticket: mockTicket,
    Auction: mockAuction,
}));

const AuctionFactory = require('./AuctionFactory');

describe('AuctionFactory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const validConfig = {
        ticketId: 't1',
        strategyType: 'English',
        startingPrice: 100,
        endTime: new Date('2027-01-01'),
    };

    describe('createAuction()', () => {
        test('should create an auction and mark ticket as In_Auction on success', async () => {
            const mockTicketInstance = {
                sellerId: 'seller-1',
                status: 'Available',
                save: jest.fn(),
            };
            mockTicket.findByPk.mockResolvedValue(mockTicketInstance);

            const mockAuctionInstance = { id: 'a1', ...validConfig };
            mockAuction.create.mockResolvedValue(mockAuctionInstance);

            const result = await AuctionFactory.createAuction(validConfig, 'seller-1');

            expect(mockTicket.findByPk).toHaveBeenCalledWith('t1', { transaction: null });
            expect(mockAuction.create).toHaveBeenCalledWith({
                ticketId: 't1',
                strategyType: 'English',
                startingPrice: 100,
                endTime: validConfig.endTime,
                status: 'Active',
                currentHighestBid: 100,
            }, { transaction: null });
            expect(mockTicketInstance.status).toBe('In_Auction');
            expect(mockTicketInstance.save).toHaveBeenCalled();
            expect(result).toEqual(mockAuctionInstance);
        });

        test('should throw if ticket is not found', async () => {
            mockTicket.findByPk.mockResolvedValue(null);
            await expect(AuctionFactory.createAuction(validConfig, 'seller-1'))
                .rejects.toThrow('Ticket not found.');
        });

        test('should throw if seller does not own the ticket', async () => {
            mockTicket.findByPk.mockResolvedValue({
                sellerId: 'other-seller',
                status: 'Available',
            });
            await expect(AuctionFactory.createAuction(validConfig, 'seller-1'))
                .rejects.toThrow('You do not own this ticket.');
        });

        test('should throw if ticket is not Available', async () => {
            mockTicket.findByPk.mockResolvedValue({
                sellerId: 'seller-1',
                status: 'In_Auction',
            });
            await expect(AuctionFactory.createAuction(validConfig, 'seller-1'))
                .rejects.toThrow('Ticket is already in an auction or sold.');
        });

        test('should pass through the transaction option', async () => {
            const mockTx = { id: 'tx1' };
            const mockTicketInstance = {
                sellerId: 'seller-1',
                status: 'Available',
                save: jest.fn(),
            };
            mockTicket.findByPk.mockResolvedValue(mockTicketInstance);
            mockAuction.create.mockResolvedValue({ id: 'a2' });

            await AuctionFactory.createAuction(validConfig, 'seller-1', mockTx);

            expect(mockTicket.findByPk).toHaveBeenCalledWith('t1', { transaction: mockTx });
            expect(mockAuction.create).toHaveBeenCalledWith(
                expect.any(Object),
                { transaction: mockTx }
            );
            expect(mockTicketInstance.save).toHaveBeenCalledWith({ transaction: mockTx });
        });
    });
});
