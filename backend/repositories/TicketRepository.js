const BaseRepository = require('./BaseRepository');
const { Ticket, User } = require('../models');

/**
 * Repository Pattern — TicketRepository
 * Domain-specific data access for Ticket entities.
 */
class TicketRepository extends BaseRepository {
    constructor() {
        super(Ticket);
    }

    /**
     * Find all tickets with 'Available' status, including seller info.
     * @returns {Promise<object[]>}
     */
    async findAvailableTickets() {
        return this.model.findAll({
            where: { status: 'Available' },
            include: [{ model: User, as: 'seller', attributes: ['name'] }]
        });
    }

    /**
     * Find a ticket by ID with the seller association.
     * @param {string} ticketId 
     * @param {object} [options]
     * @returns {Promise<object|null>}
     */
    async findWithSeller(ticketId, options = {}) {
        return this.model.findByPk(ticketId, {
            include: [{ model: User, as: 'seller', attributes: ['name', 'email'] }],
            ...options
        });
    }
}

module.exports = new TicketRepository();
