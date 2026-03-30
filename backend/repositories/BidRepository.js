const BaseRepository = require('./BaseRepository');
const { Bid } = require('../models');

/**
 * Repository Pattern — BidRepository
 * Domain-specific data access for Bid entities.
 */
class BidRepository extends BaseRepository {
    constructor() {
        super(Bid);
    }

    /**
     * Find all bids for a given auction, sorted descending by amount.
     * @param {string} auctionId 
     * @param {object} [options]
     * @returns {Promise<object[]>}
     */
    async findByAuction(auctionId, options = {}) {
        return this.model.findAll({
            where: { auctionId },
            order: [['amount', 'DESC']],
            ...options
        });
    }

    /**
     * Find the highest bid for a given auction.
     * @param {string} auctionId 
     * @param {object} [options]
     * @returns {Promise<object|null>}
     */
    async findHighestBid(auctionId, options = {}) {
        return this.model.findOne({
            where: { auctionId },
            order: [['amount', 'DESC']],
            ...options
        });
    }
}

module.exports = new BidRepository();
