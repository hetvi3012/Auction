const BaseRepository = require('./BaseRepository');
const { Auction, Ticket, sequelize } = require('../models');

/**
 * Repository Pattern — AuctionRepository
 * Domain-specific data access for Auction entities.
 */
class AuctionRepository extends BaseRepository {
    constructor() {
        super(Auction);
    }

    /**
     * Find all currently active auctions with their ticket info.
     * @returns {Promise<object[]>}
     */
    async findActiveAuctions() {
        return this.model.findAll({
            where: { status: 'Active' },
            include: [{ model: Ticket, as: 'ticket' }]
        });
    }

    /**
     * Find an auction with its associated ticket.
     * @param {string} auctionId 
     * @param {object} [options]
     * @returns {Promise<object|null>}
     */
    async findWithTicket(auctionId, options = {}) {
        return this.model.findByPk(auctionId, {
            include: [{ model: Ticket, as: 'ticket' }],
            ...options
        });
    }

    /**
     * Find an auction by ID with a row-level lock for transactional updates.
     * @param {string} auctionId 
     * @param {object} transaction 
     * @returns {Promise<object|null>}
     */
    async findByIdForUpdate(auctionId, transaction) {
        return this.model.findByPk(auctionId, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
    }

    /**
     * Count active auctions.
     * @returns {Promise<number>}
     */
    async countActive() {
        return this.count({ status: 'Active' });
    }

    /**
     * Count closed auctions.
     * @returns {Promise<number>}
     */
    async countClosed() {
        return this.count({ status: 'Closed' });
    }

    /**
     * Get total trading volume from closed auctions.
     * @returns {Promise<number>}
     */
    async getTotalVolume() {
        const result = await this.model.findAll({
            where: { status: 'Closed' },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('currentHighestBid')), 'totalVolume']
            ]
        });
        return result[0].dataValues.totalVolume || 0;
    }
}

module.exports = new AuctionRepository();
