const AuctionFacade = require('../facades/AuctionFacade');

/**
 * Controller — AuctionController
 * Handles auction creation, listing, and settlement.
 * Delegates all business logic to the AuctionFacade.
 */
class AuctionController {
    
    /**
     * POST /api/auctions — Create a new auction
     */
    static async create(req, res) {
        try {
            const { ticketId, strategyType, startingPrice, endTime } = req.body;
            const auction = await AuctionFacade.createAuction(
                { ticketId, strategyType, startingPrice, endTime },
                req.user.id
            );
            res.status(201).json(auction);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * GET /api/auctions — Get all active auctions
     */
    static async getActive(req, res) {
        try {
            const auctions = await AuctionFacade.getActiveAuctions();
            res.json(auctions);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * POST /api/auctions/:id/close — Close (settle) an auction
     */
    static async close(req, res) {
        try {
            const result = await AuctionFacade.settleAuction(req.params.id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AuctionController;
