const mockAuctionFacade = {
    createAuction: jest.fn(),
    getActiveAuctions: jest.fn(),
    settleAuction: jest.fn(),
};

jest.mock('../facades/AuctionFacade', () => mockAuctionFacade);

const AuctionController = require('./AuctionController');

describe('AuctionController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, params: {}, user: { id: 'u1' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    // --- create ---
    describe('create()', () => {
        test('should create auction and return 201', async () => {
            req.body = { ticketId: 't1', strategyType: 'English', startingPrice: 100, endTime: '2027-01-01' };
            mockAuctionFacade.createAuction.mockResolvedValue({ id: 'a1' });

            await AuctionController.create(req, res);

            expect(mockAuctionFacade.createAuction).toHaveBeenCalledWith(
                { ticketId: 't1', strategyType: 'English', startingPrice: 100, endTime: '2027-01-01' },
                'u1'
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: 'a1' });
        });

        test('should return 500 on error', async () => {
            req.body = { ticketId: 't1' };
            mockAuctionFacade.createAuction.mockRejectedValue(new Error('fail'));

            await AuctionController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- getActive ---
    describe('getActive()', () => {
        test('should return active auctions', async () => {
            mockAuctionFacade.getActiveAuctions.mockResolvedValue([{ id: 'a1' }]);

            await AuctionController.getActive(req, res);

            expect(res.json).toHaveBeenCalledWith([{ id: 'a1' }]);
        });

        test('should return 500 on error', async () => {
            mockAuctionFacade.getActiveAuctions.mockRejectedValue(new Error('fail'));

            await AuctionController.getActive(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- close ---
    describe('close()', () => {
        test('should settle auction and return result', async () => {
            req.params.id = 'a1';
            mockAuctionFacade.settleAuction.mockResolvedValue({ success: true });

            await AuctionController.close(req, res);

            expect(mockAuctionFacade.settleAuction).toHaveBeenCalledWith('a1');
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        test('should return 500 on error', async () => {
            req.params.id = 'a1';
            mockAuctionFacade.settleAuction.mockRejectedValue(new Error('fail'));

            await AuctionController.close(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
