const mockAuction = { findByPk: jest.fn() };
const mockUser = { findByPk: jest.fn() };

jest.mock('../models', () => ({
    Auction: mockAuction,
    User: mockUser,
}));

const ValidationDecorator = require('./ValidationDecorator');

describe('ValidationDecorator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateBidPreconditions()', () => {
        test('should return true when all validations pass', async () => {
            mockAuction.findByPk.mockResolvedValue({
                status: 'Active',
                endTime: new Date(Date.now() + 86400000),
            });
            mockUser.findByPk.mockResolvedValue({ walletBalance: 500 });

            const result = await ValidationDecorator.validateBidPreconditions('a1', 100, 'u1');
            expect(result).toBe(true);
        });

        test('should throw for non-positive amount (zero)', async () => {
            await expect(ValidationDecorator.validateBidPreconditions('a1', 0, 'u1'))
                .rejects.toThrow('Bid amount must be a positive number.');
        });

        test('should throw for negative amount', async () => {
            await expect(ValidationDecorator.validateBidPreconditions('a1', -5, 'u1'))
                .rejects.toThrow('Bid amount must be a positive number.');
        });

        test('should throw for non-number amount', async () => {
            await expect(ValidationDecorator.validateBidPreconditions('a1', '100', 'u1'))
                .rejects.toThrow('Bid amount must be a positive number.');
        });

        test('should throw if auction not found', async () => {
            mockAuction.findByPk.mockResolvedValue(null);
            await expect(ValidationDecorator.validateBidPreconditions('a1', 100, 'u1'))
                .rejects.toThrow('Auction not found.');
        });

        test('should throw if auction is not active', async () => {
            mockAuction.findByPk.mockResolvedValue({
                status: 'Closed',
                endTime: new Date(Date.now() + 86400000),
            });
            await expect(ValidationDecorator.validateBidPreconditions('a1', 100, 'u1'))
                .rejects.toThrow('Auction is not active.');
        });

        test('should throw if auction has ended', async () => {
            mockAuction.findByPk.mockResolvedValue({
                status: 'Active',
                endTime: new Date(Date.now() - 86400000), // past
            });
            await expect(ValidationDecorator.validateBidPreconditions('a1', 100, 'u1'))
                .rejects.toThrow('Auction has already ended.');
        });

        test('should throw if user not found', async () => {
            mockAuction.findByPk.mockResolvedValue({
                status: 'Active',
                endTime: new Date(Date.now() + 86400000),
            });
            mockUser.findByPk.mockResolvedValue(null);
            await expect(ValidationDecorator.validateBidPreconditions('a1', 100, 'u1'))
                .rejects.toThrow('User not found.');
        });

        test('should throw if user has insufficient wallet balance', async () => {
            mockAuction.findByPk.mockResolvedValue({
                status: 'Active',
                endTime: new Date(Date.now() + 86400000),
            });
            mockUser.findByPk.mockResolvedValue({ walletBalance: 50 });
            await expect(ValidationDecorator.validateBidPreconditions('a1', 100, 'u1'))
                .rejects.toThrow('Insufficient wallet balance.');
        });
    });
});
