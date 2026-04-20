const mockUserModel = {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    name: 'User',
};

jest.mock('../models', () => ({
    User: mockUserModel,
}));

const UserRepository = require('./UserRepository');

describe('UserRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- findByEmail ---
    describe('findByEmail()', () => {
        test('should find a user by email', async () => {
            mockUserModel.findOne.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
            const result = await UserRepository.findByEmail('a@b.com');
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
            expect(result).toEqual({ id: 'u1', email: 'a@b.com' });
        });

        test('should return null if no user found', async () => {
            mockUserModel.findOne.mockResolvedValue(null);
            const result = await UserRepository.findByEmail('nobody@test.com');
            expect(result).toBeNull();
        });
    });

    // --- updateWallet ---
    describe('updateWallet()', () => {
        test('should add funds to wallet (positive delta)', async () => {
            const mockUser = { id: 'u1', walletBalance: 1000, save: jest.fn() };
            mockUserModel.findByPk.mockResolvedValue(mockUser);

            const result = await UserRepository.updateWallet('u1', 500);
            expect(mockUser.walletBalance).toBe(1500);
            expect(mockUser.save).toHaveBeenCalled();
            expect(result).toBe(mockUser);
        });

        test('should deduct funds from wallet (negative delta)', async () => {
            const mockUser = { id: 'u1', walletBalance: 1000, save: jest.fn() };
            mockUserModel.findByPk.mockResolvedValue(mockUser);

            const result = await UserRepository.updateWallet('u1', -300);
            expect(mockUser.walletBalance).toBe(700);
        });

        test('should throw if user not found', async () => {
            mockUserModel.findByPk.mockResolvedValue(null);
            await expect(UserRepository.updateWallet('bad-id', 100))
                .rejects.toThrow('User not found.');
        });
    });

    // --- getTotalUsers ---
    describe('getTotalUsers()', () => {
        test('should return total user count', async () => {
            mockUserModel.count.mockResolvedValue(25);
            const result = await UserRepository.getTotalUsers();
            expect(mockUserModel.count).toHaveBeenCalledWith({ where: {} });
            expect(result).toBe(25);
        });
    });
});
