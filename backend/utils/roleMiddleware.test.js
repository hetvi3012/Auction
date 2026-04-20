jest.mock('../models', () => ({
    User: {},
}));

const { adminGuard } = require('./roleMiddleware');

describe('roleMiddleware — adminGuard()', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    test('should call next() if user is ADMIN', async () => {
        req.user = { role: 'ADMIN' };
        await adminGuard(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test('should respond 403 if user is not ADMIN', async () => {
        req.user = { role: 'USER' };
        await adminGuard(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden. Admin access required.' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should respond 403 if req.user is undefined', async () => {
        await adminGuard(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test('should respond 403 if req.user is null', async () => {
        req.user = null;
        await adminGuard(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
