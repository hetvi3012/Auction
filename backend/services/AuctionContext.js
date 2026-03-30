const StrategyFactory = require('../factories/StrategyFactory');

/**
 * Strategy Pattern — AuctionContext
 * Now delegates strategy creation to the StrategyFactory (Factory Pattern).
 * Acts as the context in the Strategy design pattern.
 */
class AuctionContext {
    constructor() {
        this.strategy = null;
    }

    /**
     * Set the active strategy using the StrategyFactory.
     * @param {string} strategyType - 'English' | 'Vickrey'
     */
    setStrategy(strategyType) {
        this.strategy = StrategyFactory.createStrategy(strategyType);
    }

    /**
     * Validate a bid using the currently active strategy.
     */
    validateBid(currentHighest, newBid, walletBalance) {
        if (!this.strategy) throw new Error('Auction strategy not set.');
        return this.strategy.validateBid(currentHighest, newBid, walletBalance);
    }

    /**
     * Determine the winner and final price using the currently active strategy.
     */
    determineWinnerAndPrice(bids) {
        if (!this.strategy) throw new Error('Auction strategy not set.');
        return this.strategy.determineWinnerAndPrice(bids);
    }
}

module.exports = new AuctionContext();
