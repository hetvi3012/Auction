const mockTicketModel = {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    name: 'Ticket',
};

const mockUserModel = { name: 'User' };

jest.mock('../models', () => ({
    Ticket: mockTicketModel,
    User: mockUserModel,
}));

const TicketRepository = require('./TicketRepository');

describe('TicketRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- findAvailableTickets ---
    describe('findAvailableTickets()', () => {
        test('should return tickets with Available status including seller', async () => {
            const tickets = [{ id: 't1', status: 'Available' }];
            mockTicketModel.findAll.mockResolvedValue(tickets);

            const result = await TicketRepository.findAvailableTickets();

            expect(mockTicketModel.findAll).toHaveBeenCalledWith({
                where: { status: 'Available' },
                include: [{ model: mockUserModel, as: 'seller', attributes: ['name'] }],
            });
            expect(result).toEqual(tickets);
        });

        test('should return empty array if no available tickets', async () => {
            mockTicketModel.findAll.mockResolvedValue([]);
            const result = await TicketRepository.findAvailableTickets();
            expect(result).toEqual([]);
        });
    });

    // --- findWithSeller ---
    describe('findWithSeller()', () => {
        test('should find ticket by id with seller association', async () => {
            const ticket = { id: 't1', seller: { name: 'Alice', email: 'a@b.com' } };
            mockTicketModel.findByPk.mockResolvedValue(ticket);

            const result = await TicketRepository.findWithSeller('t1');

            expect(mockTicketModel.findByPk).toHaveBeenCalledWith('t1', {
                include: [{ model: mockUserModel, as: 'seller', attributes: ['name', 'email'] }],
            });
            expect(result).toEqual(ticket);
        });

        test('should return null if ticket not found', async () => {
            mockTicketModel.findByPk.mockResolvedValue(null);
            const result = await TicketRepository.findWithSeller('bad-id');
            expect(result).toBeNull();
        });

        test('should pass through additional options', async () => {
            mockTicketModel.findByPk.mockResolvedValue(null);
            await TicketRepository.findWithSeller('t1', { transaction: 'tx' });
            expect(mockTicketModel.findByPk).toHaveBeenCalledWith('t1', {
                include: [{ model: mockUserModel, as: 'seller', attributes: ['name', 'email'] }],
                transaction: 'tx',
            });
        });
    });
});
