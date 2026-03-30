const { Auction, User } = require('../models');

/**
 * Decorator Pattern — ValidationDecorator
 * Wraps bid placement with robust pre-validation rules.
 * Throws descriptive errors before the core logic executes.
 */
class ValidationDecorator {
    /**
     * Validate all preconditions for placing a bid.
     * @param {string} auctionId 
     * @param {number} amount 
     * @param {string} userId 
     * @throws {Error} If any validation fails
     */
    static async validateBidPreconditions(auctionId, amount, userId) {
        // Rule 1: Amount must be a positive number
        if (typeof amount !== 'number' || amount <= 0) {
            throw new Error('Bid amount must be a positive number.');
        }

        // Rule 2: Auction must exist
        const auction = await Auction.findByPk(auctionId);
        if (!auction) {
            throw new Error('Auction not found.');
        }

        // Rule 3: Auction must be active
        if (auction.status !== 'Active') {
            throw new Error('Auction is not active.');
        }

        // Rule 4: Auction must not have ended
        if (new Date() > new Date(auction.endTime)) {
            throw new Error('Auction has already ended.');
        }

        // Rule 5: User must exist
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found.');
        }

        // Rule 6: User must have sufficient wallet balance
        if (user.walletBalance < amount) {
            throw new Error('Insufficient wallet balance.');
        }

        return true;
    }
}

module.exports = ValidationDecorator;
