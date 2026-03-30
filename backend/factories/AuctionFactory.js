const { Auction, Ticket } = require('../models');

/**
 * Factory Pattern — AuctionFactory
 * Encapsulates the creation of Auction entities.
 * Validates preconditions and atomically creates an Auction + updates the Ticket status.
 */
class AuctionFactory {

    /**
     * Create a new auction from a validated configuration object.
     * @param {object} config - { ticketId, strategyType, startingPrice, endTime }
     * @param {string} sellerId - The ID of the user creating the auction
     * @param {object} [transaction] - Optional Sequelize transaction
     * @returns {Promise<object>} The created Auction instance
     */
    async createAuction(config, sellerId, transaction = null) {
        const { ticketId, strategyType, startingPrice, endTime } = config;

        // Validate ticket ownership and availability
        const ticket = await Ticket.findByPk(ticketId, { transaction });
        if (!ticket) {
            throw new Error('Ticket not found.');
        }
        if (ticket.sellerId !== sellerId) {
            throw new Error('You do not own this ticket.');
        }
        if (ticket.status !== 'Available') {
            throw new Error('Ticket is already in an auction or sold.');
        }

        // Create the Auction record
        const auction = await Auction.create({
            ticketId,
            strategyType,
            startingPrice,
            endTime,
            status: 'Active',
            currentHighestBid: startingPrice
        }, { transaction });

        // Mark ticket as "In Auction"
        ticket.status = 'In_Auction';
        await ticket.save({ transaction });

        return auction;
    }
}

module.exports = new AuctionFactory();
