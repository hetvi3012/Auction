const mockAuctionFacade = {
    placeBid: jest.fn(),
    setProxyBidLimit: jest.fn(),
};

jest.mock('../facades/AuctionFacade', () => mockAuctionFacade);

const BidController = require('./BidController');

describe('BidController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, user: { id: 'u1' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    // --- placeBid ---
    describe('placeBid()', () => {
        test('should place bid and return 201', async () => {
            req.body = { auctionId: 'a1', amount: 150 };
            mockAuctionFacade.placeBid.mockResolvedValue({ success: true });

            await BidController.placeBid(req, res);

            expect(mockAuctionFacade.placeBid).toHaveBeenCalledWith('a1', 150, 'u1');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        test('should return 400 on validation error', async () => {
            req.body = { auctionId: 'a1', amount: 50 };
            mockAuctionFacade.placeBid.mockRejectedValue(new Error('Bid too low'));

            await BidController.placeBid(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Bid too low' });
        });
    });

    // --- setProxyLimit ---
    describe('setProxyLimit()', () => {
        test('should set proxy limit and return 200', async () => {
            req.body = { auctionId: 'a1', maxWillingToPay: 500 };
            mockAuctionFacade.setProxyBidLimit.mockResolvedValue({ message: 'Proxy limit set successfully.' });

            await BidController.setProxyLimit(req, res);

            expect(mockAuctionFacade.setProxyBidLimit).toHaveBeenCalledWith('a1', 'u1', 500);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should return 400 on error', async () => {
            req.body = { auctionId: 'a1', maxWillingToPay: 9999 };
            mockAuctionFacade.setProxyBidLimit.mockRejectedValue(new Error('Insufficient balance'));

            await BidController.setProxyLimit(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
