const jwt = require('jsonwebtoken');

const mockUserRepo = {
    findByEmail: jest.fn(),
    create: jest.fn(),
};

const mockUserModel = { findByPk: jest.fn() };
const mockBidModel = { findAll: jest.fn() };
const mockAuctionModel = {};

jest.mock('../repositories/UserRepository', () => mockUserRepo);
jest.mock('../models', () => ({
    User: mockUserModel,
    Bid: mockBidModel,
    Auction: mockAuctionModel,
}));

const AuthController = require('./AuthController');

describe('AuthController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
        req = { body: {}, user: { id: 'u1' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    // --- generateToken ---
    describe('generateToken()', () => {
        test('should return a valid JWT', () => {
            const token = AuthController.generateToken('user-1');
            const decoded = jwt.verify(token, 'test-secret');
            expect(decoded.id).toBe('user-1');
        });
    });

    // --- register ---
    describe('register()', () => {
        test('should create user and return 201 with token', async () => {
            req.body = { name: 'Alice', email: 'alice@test.com', password: 'pw' };
            mockUserRepo.findByEmail.mockResolvedValue(null);
            mockUserRepo.create.mockResolvedValue({
                id: 'u1', name: 'Alice', email: 'alice@test.com', walletBalance: 1000,
            });

            await AuthController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                id: 'u1',
                name: 'Alice',
                email: 'alice@test.com',
                token: expect.any(String),
            }));
        });

        test('should return 400 if user already exists', async () => {
            req.body = { name: 'Alice', email: 'alice@test.com', password: 'pw' };
            mockUserRepo.findByEmail.mockResolvedValue({ id: 'existing' });

            await AuthController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
        });

        test('should return 500 on server error', async () => {
            req.body = { name: 'Alice', email: 'alice@test.com', password: 'pw' };
            mockUserRepo.findByEmail.mockRejectedValue(new Error('DB error'));

            await AuthController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- login ---
    describe('login()', () => {
        test('should return user data with token on valid credentials', async () => {
            req.body = { email: 'alice@test.com', password: 'pw' };
            mockUserRepo.findByEmail.mockResolvedValue({
                id: 'u1',
                name: 'Alice',
                email: 'alice@test.com',
                walletBalance: 1000,
                matchPassword: jest.fn().mockResolvedValue(true),
            });

            await AuthController.login(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                id: 'u1',
                token: expect.any(String),
            }));
        });

        test('should return 401 for invalid password', async () => {
            req.body = { email: 'alice@test.com', password: 'wrong' };
            mockUserRepo.findByEmail.mockResolvedValue({
                matchPassword: jest.fn().mockResolvedValue(false),
            });

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
        });

        test('should return 401 for non-existent user', async () => {
            req.body = { email: 'nobody@test.com', password: 'pw' };
            mockUserRepo.findByEmail.mockResolvedValue(null);

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should return 500 on server error', async () => {
            req.body = { email: 'x@x.com', password: 'pw' };
            mockUserRepo.findByEmail.mockRejectedValue(new Error('DB error'));

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- topUp ---
    describe('topUp()', () => {
        test('should add funds and return new balance', async () => {
            req.body = { amount: 500 };
            const mockUser = { id: 'u1', walletBalance: 1000, save: jest.fn() };
            mockUserModel.findByPk.mockResolvedValue(mockUser);

            await AuthController.topUp(req, res);

            expect(mockUser.walletBalance).toBe(1500);
            expect(mockUser.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                walletBalance: 1500,
            }));
        });

        test('should return 400 for zero amount', async () => {
            req.body = { amount: 0 };
            await AuthController.topUp(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 400 for negative amount', async () => {
            req.body = { amount: -10 };
            await AuthController.topUp(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 400 if amount is missing', async () => {
            req.body = {};
            await AuthController.topUp(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    // --- getProfile ---
    describe('getProfile()', () => {
        test('should return user and bids', async () => {
            mockUserModel.findByPk.mockResolvedValue({ id: 'u1', name: 'Alice' });
            mockBidModel.findAll.mockResolvedValue([{ id: 'b1', amount: 100 }]);

            await AuthController.getProfile(req, res);

            expect(res.json).toHaveBeenCalledWith({
                user: { id: 'u1', name: 'Alice' },
                bids: [{ id: 'b1', amount: 100 }],
            });
        });

        test('should return 500 on server error', async () => {
            mockUserModel.findByPk.mockRejectedValue(new Error('DB error'));

            await AuthController.getProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
