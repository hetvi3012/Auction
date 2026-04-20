const mockAuctionFacade = {
    getAnalytics: jest.fn(),
};

const mockAuctionModel = { findAll: jest.fn() };
const mockTicketModel = { name: 'Ticket' };

jest.mock('../facades/AuctionFacade', () => mockAuctionFacade);
jest.mock('../models', () => ({
    Auction: mockAuctionModel,
    Ticket: mockTicketModel,
}));

const AdminController = require('./AdminController');

describe('AdminController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    // --- getAnalytics ---
    describe('getAnalytics()', () => {
        test('should return analytics data', async () => {
            mockAuctionFacade.getAnalytics.mockResolvedValue({
                status: 'HEALTHY',
                metrics: { totalVolume: 5000 },
            });

            await AdminController.getAnalytics(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'HEALTHY',
            }));
        });

        test('should return 500 on error', async () => {
            mockAuctionFacade.getAnalytics.mockRejectedValue(new Error('fail'));

            await AdminController.getAnalytics(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- getAllAuctions ---
    describe('getAllAuctions()', () => {
        test('should return all auctions with tickets', async () => {
            mockAuctionModel.findAll.mockResolvedValue([
                { id: 'a1', ticket: { id: 't1' } },
            ]);

            await AdminController.getAllAuctions(req, res);

            expect(mockAuctionModel.findAll).toHaveBeenCalledWith({
                include: [{ model: mockTicketModel, as: 'ticket' }],
                order: [['createdAt', 'DESC']],
            });
            expect(res.json).toHaveBeenCalledWith([{ id: 'a1', ticket: { id: 't1' } }]);
        });

        test('should return 500 on error', async () => {
            mockAuctionModel.findAll.mockRejectedValue(new Error('fail'));

            await AdminController.getAllAuctions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
