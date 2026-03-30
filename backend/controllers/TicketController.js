const AuctionFacade = require('../facades/AuctionFacade');

/**
 * Controller — TicketController
 * Handles ticket creation and listing.
 * Delegates to AuctionFacade.
 */
class TicketController {

    /**
     * POST /api/tickets — Create a new ticket
     */
    static async create(req, res) {
        try {
            const { eventId, seatInfo } = req.body;
            const ticket = await AuctionFacade.createTicket({ eventId, seatInfo }, req.user.id);
            res.status(201).json(ticket);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * GET /api/tickets — Get all available tickets
     */
    static async getAvailable(req, res) {
        try {
            const tickets = await AuctionFacade.getAvailableTickets();
            res.json(tickets);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = TicketController;
