const AuctionBuilder = require('../builders/AuctionBuilder');
const AuctionFactory = require('../factories/AuctionFactory');

/**
 * Command Pattern — CreateAuctionCommand
 * Orchestrates auction creation using Builder + Factory patterns.
 */
class CreateAuctionCommand {
    /**
     * @param {object} params - { ticketId, strategyType, startingPrice, endTime }
     * @param {string} sellerId - The user creating the auction
     */
    constructor(params, sellerId) {
        this.params = params;
        this.sellerId = sellerId;
        this.auction = null;
    }

    /**
     * Execute: Build config → Factory creates Auction.
     * @returns {Promise<object>} The created auction
     */
    async execute() {
        // 1. Build a validated configuration using the Builder Pattern
        const builder = new AuctionBuilder();
        const config = builder
            .setTicket(this.params.ticketId)
            .setStrategy(this.params.strategyType)
            .setStartingPrice(this.params.startingPrice)
            .setEndTime(this.params.endTime)
            .build();

        // 2. Delegate actual creation to the Factory
        this.auction = await AuctionFactory.createAuction(config, this.sellerId);
        return this.auction;
    }

    /**
     * Undo stub — for future rollback support.
     */
    async undo() {
        console.log(`[CreateAuctionCommand] Undo not yet implemented for auction ${this.auction?.id}`);
    }
}

module.exports = CreateAuctionCommand;
