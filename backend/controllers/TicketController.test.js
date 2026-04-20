const mockAuctionFacade = {
    createTicket: jest.fn(),
    getAvailableTickets: jest.fn(),
};

jest.mock('../facades/AuctionFacade', () => mockAuctionFacade);

const TicketController = require('./TicketController');

describe('TicketController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, user: { id: 'u1' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    // --- create ---
    describe('create()', () => {
        test('should create a ticket and return 201', async () => {
            req.body = { eventId: 'e1', seatInfo: 'A12' };
            mockAuctionFacade.createTicket.mockResolvedValue({ id: 't1' });

            await TicketController.create(req, res);

            expect(mockAuctionFacade.createTicket).toHaveBeenCalledWith(
                { eventId: 'e1', seatInfo: 'A12' },
                'u1'
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: 't1' });
        });

        test('should return 500 on error', async () => {
            req.body = { eventId: 'e1' };
            mockAuctionFacade.createTicket.mockRejectedValue(new Error('fail'));

            await TicketController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- getAvailable ---
    describe('getAvailable()', () => {
        test('should return available tickets', async () => {
            mockAuctionFacade.getAvailableTickets.mockResolvedValue([{ id: 't1' }]);

            await TicketController.getAvailable(req, res);

            expect(res.json).toHaveBeenCalledWith([{ id: 't1' }]);
        });

        test('should return 500 on error', async () => {
            mockAuctionFacade.getAvailableTickets.mockRejectedValue(new Error('fail'));

            await TicketController.getAvailable(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
