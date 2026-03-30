const BaseRepository = require('./BaseRepository');
const { User } = require('../models');

/**
 * Repository Pattern — UserRepository
 * Domain-specific data access for User entities.
 */
class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    /**
     * Find a user by email address.
     * @param {string} email 
     * @param {object} [options]
     * @returns {Promise<object|null>}
     */
    async findByEmail(email, options = {}) {
        return this.findOne({ email }, options);
    }

    /**
     * Update a user's wallet balance by a given delta.
     * @param {string} userId 
     * @param {number} delta - Positive to add, negative to deduct
     * @param {object} [options]
     * @returns {Promise<object>}
     */
    async updateWallet(userId, delta, options = {}) {
        const user = await this.findById(userId, options);
        if (!user) throw new Error('User not found.');
        user.walletBalance += delta;
        await user.save(options);
        return user;
    }

    /**
     * Get total number of registered users.
     * @returns {Promise<number>}
     */
    async getTotalUsers() {
        return this.count();
    }
}

module.exports = new UserRepository();
