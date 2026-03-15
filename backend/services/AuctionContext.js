const EnglishAuctionStrategy = require('./EnglishAuctionStrategy');
const VickreyAuctionStrategy = require('./VickreyAuctionStrategy');

class AuctionContext {
    constructor() {
        this.strategy = null;
    }

    setStrategy(strategyType) {
        if (strategyType === 'English') {
            this.strategy = new EnglishAuctionStrategy();
        } else if (strategyType === 'Vickrey') {
            this.strategy = new VickreyAuctionStrategy();
        } else {
            throw new Error(`Unknown auction strategy type: ${strategyType}`);
        }
    }

    validateBid(currentHighest, newBid, walletBalance) {
        if (!this.strategy) throw new Error('Auction strategy not set.');
        return this.strategy.validateBid(currentHighest, newBid, walletBalance);
    }

    determineWinnerAndPrice(bids) {
        if (!this.strategy) throw new Error('Auction strategy not set.');
        return this.strategy.determineWinnerAndPrice(bids);
    }
}

module.exports = new AuctionContext();
