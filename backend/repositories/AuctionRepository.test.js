/**
 * Unit tests for AuctionRepository.
 * All Sequelize model methods are mocked — no database required.
 */

// --- Mock models BEFORE requiring the module under test ---
const mockAuctionModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
    name: 'Auction',
};

const mockTicketModel = { name: 'Ticket' };

const mockSequelize = {
    fn: jest.fn((...args) => ({ fn: args[0], col: args[1] })),
    col: jest.fn((col) => col),
};

jest.mock('../models', () => ({
    Auction: mockAuctionModel,
    Ticket: mockTicketModel,
    sequelize: mockSequelize,
}));

// We also need to mock BaseRepository so the constructor wires up our mockAuctionModel
jest.mock('./BaseRepository', () => {
    return class BaseRepository {
        constructor(model) {
            this.model = model;
        }
        async count(where = {}) {
            return this.model.count({ where });
        }
    };
});

// NOW require the module under test (it's a singleton)
const AuctionRepository = require('./AuctionRepository');

describe('AuctionRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- findActiveAuctions ---
    describe('findActiveAuctions()', () => {
        test('should query for Active auctions and include Ticket', async () => {
            const mockAuctions = [{ id: 1, status: 'Active' }];
            mockAuctionModel.findAll.mockResolvedValue(mockAuctions);

            const result = await AuctionRepository.findActiveAuctions();

            expect(mockAuctionModel.findAll).toHaveBeenCalledWith({
                where: { status: 'Active' },
                include: [{ model: mockTicketModel, as: 'ticket' }],
            });
            expect(result).toEqual(mockAuctions);
        });
    });

    // --- findWithTicket ---
    describe('findWithTicket()', () => {
        test('should find by PK with Ticket include and no extra options', async () => {
            const mockAuction = { id: 'a1' };
            mockAuctionModel.findByPk.mockResolvedValue(mockAuction);

            const result = await AuctionRepository.findWithTicket('a1');

            expect(mockAuctionModel.findByPk).toHaveBeenCalledWith('a1', {
                include: [{ model: mockTicketModel, as: 'ticket' }],
            });
            expect(result).toEqual(mockAuction);
        });

        test('should spread additional options into the query', async () => {
            mockAuctionModel.findByPk.mockResolvedValue(null);

            await AuctionRepository.findWithTicket('a2', { paranoid: false });

            expect(mockAuctionModel.findByPk).toHaveBeenCalledWith('a2', {
                include: [{ model: mockTicketModel, as: 'ticket' }],
                paranoid: false,
            });
        });
    });

    // --- findByIdForUpdate ---
    describe('findByIdForUpdate()', () => {
        test('should find by PK with a row-level lock', async () => {
            const mockTransaction = { LOCK: { UPDATE: 'UPDATE' } };
            const mockAuction = { id: 'a3' };
            mockAuctionModel.findByPk.mockResolvedValue(mockAuction);

            const result = await AuctionRepository.findByIdForUpdate('a3', mockTransaction);

            expect(mockAuctionModel.findByPk).toHaveBeenCalledWith('a3', {
                transaction: mockTransaction,
                lock: 'UPDATE',
            });
            expect(result).toEqual(mockAuction);
        });
    });

    // --- countActive ---
    describe('countActive()', () => {
        test('should count auctions with Active status', async () => {
            mockAuctionModel.count.mockResolvedValue(5);

            const result = await AuctionRepository.countActive();

            expect(mockAuctionModel.count).toHaveBeenCalledWith({ where: { status: 'Active' } });
            expect(result).toBe(5);
        });
    });

    // --- countClosed ---
    describe('countClosed()', () => {
        test('should count auctions with Closed status', async () => {
            mockAuctionModel.count.mockResolvedValue(12);

            const result = await AuctionRepository.countClosed();

            expect(mockAuctionModel.count).toHaveBeenCalledWith({ where: { status: 'Closed' } });
            expect(result).toBe(12);
        });
    });

    // --- getTotalVolume ---
    describe('getTotalVolume()', () => {
        test('should return the sum of currentHighestBid for closed auctions', async () => {
            mockAuctionModel.findAll.mockResolvedValue([
                { dataValues: { totalVolume: 15000 } },
            ]);

            const result = await AuctionRepository.getTotalVolume();

            expect(mockAuctionModel.findAll).toHaveBeenCalledWith({
                where: { status: 'Closed' },
                attributes: [
                    [{ fn: 'SUM', col: 'currentHighestBid' }, 'totalVolume'],
                ],
            });
            expect(result).toBe(15000);
        });

        test('should return 0 when there is no volume (null)', async () => {
            mockAuctionModel.findAll.mockResolvedValue([
                { dataValues: { totalVolume: null } },
            ]);

            const result = await AuctionRepository.getTotalVolume();
            expect(result).toBe(0);
        });
    });
});
