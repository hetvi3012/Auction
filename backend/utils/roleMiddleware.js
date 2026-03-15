const { User } = require('../models');

const adminGuard = async (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
};

module.exports = { adminGuard };
