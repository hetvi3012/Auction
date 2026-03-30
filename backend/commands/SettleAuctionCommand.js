const AuctionSettlementService = require('../services/AuctionSettlementService');

/**
 * Command Pattern — SettleAuctionCommand
 * Encapsulates auction settlement as a dispatchable command object.
 */
class SettleAuctionCommand {
    /**
     * @param {string} auctionId 
     */
    constructor(auctionId) {
        this.auctionId = auctionId;
        this.result = null;
    }

    /**
     * Execute the auction settlement.
     * @returns {Promise<object>} Settlement result
     */
    async execute() {
        this.result = await AuctionSettlementService.settleAuction(this.auctionId);
        return this.result;
    }

    /**
     * Undo stub — for future rollback support.
     */
    async undo() {
        console.log(`[SettleAuctionCommand] Undo not yet implemented for auction ${this.auctionId}`);
    }
}

module.exports = SettleAuctionCommand;
