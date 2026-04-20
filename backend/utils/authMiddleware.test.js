const jwt = require('jsonwebtoken');

const mockUser = {
    findByPk: jest.fn(),
};

jest.mock('../models', () => ({
    User: mockUser,
}));

const { protect } = require('./authMiddleware');

describe('authMiddleware — protect()', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should call next and set req.user for a valid token', async () => {
        const token = jwt.sign({ id: 'user-1' }, 'test-secret');
        req.headers.authorization = `Bearer ${token}`;
        const mockUserObj = { id: 'user-1', name: 'Alice' };
        mockUser.findByPk.mockResolvedValue(mockUserObj);

        await protect(req, res, next);

        expect(mockUser.findByPk).toHaveBeenCalledWith('user-1', {
            attributes: { exclude: ['passwordHash'] },
        });
        expect(req.user).toEqual(mockUserObj);
        expect(next).toHaveBeenCalled();
    });

    test('should respond 401 for an invalid token', async () => {
        req.headers.authorization = 'Bearer invalid-token';

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should respond 401 when no authorization header is present', async () => {
        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should respond 401 when authorization header does not start with Bearer', async () => {
        req.headers.authorization = 'Basic some-token';

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});
